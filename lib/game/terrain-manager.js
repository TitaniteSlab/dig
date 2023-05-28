ig.module(
	'game.terrain-manager'
)
.requires(
	'impact.background-map',
	'terra.buffered-background-map',
	'impact.sound',
	'game.entities.ore',
	'game.entities.doodads.tree',
	'game.entities.doodads.bush',
	'game.entities.doodads.shrub',
	'game.entities.doodads.weed',
	'game.entities.doodads.grass',
	'game.entities.particle-rect',
	'game.zone-defs',
	'game.doodad-defs',
	'game.tile',
	'terra',
	'terra.collision-map',
	
	'perlin'
)
.defines(function(){ "use strict";

window.TerrainManager = ig.Class.extend({	
	
	staticInstantiate: function() {
		
	},
	
	tilesize: 8,
	
	loaded: false,
	
	// Sounds
	tileHitSound: new ig.Sound('sounds/Explosion48.ogg'),
	
	// Stores one planet-width array for each zone. 
	// This may use too much memory for huge planets. Could recompute noise each time instead.
	zoneDepths: [],
	minTileDepth: 0,		// Absolute highest tile
	
	// Tile Blocks (Core performance optimization for large planets and limiting entities)
	blocks: [[]],
	solidBackgroundChunks: [],
	curBlockIndex: {x: 0, y: 0},
	curGlobalBlockIndex: {x: 0, y: 0},
	loadedBlocks: [],			// Actual loaded blocks
	loadedBlockIndices: [],		// Block indices currently loaded in impact
	loadedRect: null,			// x, y, w, h of real loaded rectangle
	blockTileWidth: 40,
	blockTileHeight: 40,
	blockBufferDistance: 2,
	blockLoadDistance: 2,
	
	blockWidth: 80,		// Num blocks in entire level
	blockHeight: 0,		// Not needed????
	tileWidth: 0,		// Tile width of entire level; computed from blocks
	tileHeight: 0,		// Computed from zones; blocks don't repeat vertically so there's no real connection to this
	
	terrainTilesetWidth: 36,
	terrainBackgroundTilesetWidth: 14,
	
	// ig.BackgroundMaps for terrain
	terrainMap: null,
	terrainBackgroundMap: null,		// Terrain backing (indestructable, preRendered)
	
	terrainDamageParticles: 3,		// Particles to spawn on terrain tile damage
	
	// Zone data
	terrainZoneData: [],		// tile row/col -> zoneId + 1
	
	// Pseudo-seeds, variations of ig.game.seed
	oreSeed: 0,
	specialOreSeed: 0,
	hardSeed: 0,
	
	
	init: function(terrainData) {
		ig.merge(this, terrainData);
		
		// Make new non-random seeds
		this.hardSeed = ig.game.seed + 9;		
		this.oreSeed = ig.game.seed + 10;
		this.specialOreSeed = ig.game.seed + 11;
		
		// Compute tile width from block info
		this.tileWidth = this.blockTileWidth * this.blockWidth;
		
		// Compute zone boundaries
		this.computeZoneDepths();
		
		// Compute total vertical tiles
		this.tileHeight = ig.game.skyTileHeight;
		for (var z=0 ; z<this.zones.length ; z++) {
			this.tileHeight += (this.zones[z].tileHeight);
		}
		console.log('tile dimensions: ' + this.tileWidth + 'x' + this.tileHeight);
		console.log('pixel dimensions: ' + this.tileWidth*this.tilesize + 'x' + this.tileHeight*this.tilesize);
		console.log('planet array size: ' + (this.tileWidth*this.tilesize * this.tileHeight*this.tilesize * 4 / 1000) + 'KB');
		
		// Collision
		ig.game.collisionMap = new terra.CollisionMap(this.tilesize, [[]]);
		ig.game.collisionMap.width = this.blockTileWidth * (1 + 2 * this.blockLoadDistance);
		ig.game.collisionMap.height = this.blockTileHeight * (1 + 2 * this.blockLoadDistance);
		
		// Terrain Background
		this.terrainBackgroundMap = new ig.BackgroundMap(this.tilesize, [[]], this.terrainBackgroundTilesetName);
		this.terrainBackgroundMap.name = 'TerrainBackground';
		this.terrainBackgroundMap.preRender = true;
		this.terrainBackgroundMap.chunkSize = Math.min(this.blockTileWidth*this.tilesize, this.blockTileHeight*this.tilesize) * ig.system.scale;
		this.terrainBackgroundMap.width = this.blockTileHeight * (1 + 2 * this.blockLoadDistance);
		this.terrainBackgroundMap.height = this.blockTileHeight * (1 + 2 * this.blockLoadDistance);
		this.terrainBackgroundMap.debugChunks = false;
		
		if (this.terrainBackgroundMap.tiles.loaded) {
			this.createSolidBackgroundTiles();
			this.loaded = true;
		} else {
			this.terrainBackgroundMap.tiles.loadCallback = $.proxy(function() {
				this.createSolidBackgroundChunks();
				this.loaded = true;
			}, this);
		}
		
		console.log('block px width: ' + this.blockTileWidth * this.tilesize);
		console.log('block px height: ' + this.blockTileHeight * this.tilesize);
		console.log('chunk size: ' + this.terrainBackgroundMap.chunkSize);
		
		// Terrain Foreground
		this.terrainMap = new terra.BufferedBackgroundMap(this.tilesize, [[]], this.terrainTilesetName);
		this.terrainMap.name = 'Terrain';
		this.terrainMap.width = this.blockTileWidth * (1 + 2 * this.blockLoadDistance);
		this.terrainMap.height = this.blockTileHeight * (1 + 2 * this.blockLoadDistance);
		this.terrainMap.lightingEnabled = true;
		
	},
	
	createSolidBackgroundChunks: function() {
		this.solidBackgroundChunks = [];
		for (var z=0 ; z<this.zones.length ; z++) {
			var data = [];
			this.terrainBackgroundMap.data = data;
			for (var bty=0 ; bty<this.blockTileHeight ; bty++) {
				data[bty] = [];
				for (var btx=0 ; btx<this.blockTileWidth ; btx++) {
					data[bty][btx] = z * this.terrainBackgroundTilesetWidth + terra.randInt(2) + 1;
				}
			}
			
			this.solidBackgroundChunks[z] = this.terrainBackgroundMap.preRenderChunk(
				0, 0, 
				this.terrainBackgroundMap.chunkSize, 
				this.terrainBackgroundMap.chunkSize
			);
		}
		this.terrainBackgroundMap.data = null;
	},
	
	computeZoneDepths: function() {
		noise.seed(ig.game.seed);
	
		this.zoneDepths = [];
		this.minTileDepth = 999999;
		
		var curZoneDepth = ig.game.skyTileHeight;
		for (var z=0 ; z<this.zones.length ; z++) {
			var zoneData = this.zones[z];
			var noiseData = zoneData.boundaryNoiseData;
			
			noise.seed(ig.game.seed + z + 1);		// New non-random noise seed per zone
			
			var depths = [];
			this.zoneDepths.push(depths);
			
			for (var col=0 ; col<this.tileWidth ; col++) {
						
				// Mirror half the terrain
				var noiseX = col > this.tileWidth / 2 ? this.tileWidth - col : col;
				
				// Compute boundary noise
				var rawNoise = noise.perlinFBM1(
					(noiseX + 1) / this.tileWidth, 
					noiseData.smoothing, 
					noiseData.octaves, 
					noiseData.amplitude, 
					noiseData.frequency
				);
				
				// Shift first zone down and normalize amplitude
				if (z == 0) {
					rawNoise = (noiseData.amplitude + rawNoise) / (2 * noiseData.amplitude);
				} else {
					rawNoise = rawNoise / noiseData.amplitude;
				}
				
				var tileNoise = Math.floor(rawNoise * noiseData.tileHeight);
				var depth = curZoneDepth + tileNoise;
				depths.push(depth);
				
				if (z == 0 & depth < this.minTileDepth) {
					this.minTileDepth = depth;
				}
			}
			
			curZoneDepth += zoneData.tileHeight;
		}
		
		noise.seed(ig.game.seed);
	},
	
	// Called by game/owner
	update: function() {
		if (!this.loaded) { return; }
		
		// Check/Update blocks around player. Could use screen for this logic but player should work okay for now.
		var player = ig.game.player;
		if (player) {
			
			var index = this.getBlockIndexAtPosition(player.pos.x, player.pos.y);
			var gIndex = this.getBlockIndexAtPosition(player.pos.x, player.pos.y, false);
			
			// Reload blocks if we entered a new one
			if (this.curGlobalBlockIndex.x != gIndex.x || this.curGlobalBlockIndex.y != gIndex.y) {
				console.log('entered a new block: ' + '[' + gIndex.x + ',' + gIndex.y + ']');
				this.curBlockIndex = index;
				this.curGlobalBlockIndex = gIndex;
				
				// Get or create blocks around curBlock
				var bxMin = gIndex.x - this.blockBufferDistance;
				var bxMax = gIndex.x + this.blockBufferDistance;
				var byMin = gIndex.y - this.blockBufferDistance;
				var byMax = gIndex.y + this.blockBufferDistance;
				
				for (var by=byMin ; by<=byMax ; by++) {
					for (var bx=bxMin ; bx<=bxMax ; bx++) {
						var bxRepeat = bx;
						if (bx >= this.blockWidth || bx < 0) {
							bxRepeat = (bx%this.blockWidth + this.blockWidth) % this.blockWidth;
						}
					
						// Get block from memory
						var block = this.getBlockAtIndex(bxRepeat, by);
						if (!block || block.length <= 1) {
							// TODO Get block from disk
							
							// Create new block from scratch
							this.populateBlock(bx, by);
						}
					}
				}
				
				// Update Impact state
				this.exportBlocksToImpact();
			}
		}
		
		// Update terrain scroll
		this.terrainMap.setScreenPos(
			ig.game.screen.x - this.loadedRect.x,
			ig.game.screen.y - this.loadedRect.y
		);
	},
	
	exportBlocksToImpact: function() {
		
		// Create
		var terrain = [];
		var background = [];
		var collision = [];
		
		// Set
		this.terrainMap.data = terrain;
		this.terrainMap._retile = true;
		
		//this.terrainBackgroundMap.data = background;
		this.terrainBackgroundMap.preRenderedChunks = background;
		//this.terrainBackgroundMap.preRenderedChunks = null;		// Trigger a new prerender
		
		ig.game.collisionMap.data = collision;
		var blockStart = {
			x: (this.curGlobalBlockIndex.x - this.blockLoadDistance) * this.blockTileWidth * this.tilesize,
			y: (this.curGlobalBlockIndex.y - this.blockLoadDistance) * this.blockTileHeight * this.tilesize
		};
		ig.game.collisionMap.pos = {
			x: blockStart.x,
			y: blockStart.y
		};
		
		// Export
		var bxMin = this.curGlobalBlockIndex.x - this.blockLoadDistance;
		var bxMax = this.curGlobalBlockIndex.x + this.blockLoadDistance;
		var byMin = this.curGlobalBlockIndex.y - this.blockLoadDistance;
		var byMax = this.curGlobalBlockIndex.y + this.blockLoadDistance;
		//var bw = 1 + 2 * this.blockLoadDistance;
		//var bh = 1 + 2 * this.blockLoadDistance;
		
		// Save real rectangle pos/size
		this.loadedRect = {
			x: blockStart.x,
			y: blockStart.y,
			w: (1 + 2 * this.blockLoadDistance) * this.blockTileWidth * this.tilesize,
			h: (1 + 2 * this.blockLoadDistance) * this.blockTileHeight * this.tilesize
		};
		
		// Block columns
		this.loadedBlocks = [];
		var newLoadedBlockIndices = [];
		for (var bx=bxMin ; bx<=bxMax ; bx++) {
			var bxRepeat = bx;
			if (bx >= this.blockWidth || bx < 0) {
				bxRepeat = (bx%this.blockWidth + this.blockWidth) % this.blockWidth;
			}
			
			// Block rows
			for (var by=byMin, bj=0 ; by<=byMax ; by++, bj++) {
				var block = this.blocks[by][bxRepeat];
				if (!block) { 
					console.log('Error: Terrain block not found at ' + bx + ',' + bx);
					continue;
				}
				
				// Set current global block index
				block.globalIndex = {x: bx, y: by};
				this.loadedBlocks.push(block);
				
				var blockAlreadyLoaded = this.indexInArray(this.loadedBlockIndices, bx, by);
				newLoadedBlockIndices.push({ x: bx, y: by });
				
				// Background chunk (already computed, just grabbing from the other array)
				var bgChunk = block.backgroundChunk;//this.backgroundBlockChunks[by][bxRepeat];
				var backgroundRow = background[bj];
				if (!backgroundRow) {
					backgroundRow = [];
					background[bj] = backgroundRow;
				}
				backgroundRow.push(bgChunk);
				
				// Block tile rows
				for (var bty=0 ; bty<this.blockTileHeight ; bty++) {
					
					// Insert rows if needed
					var terrainRow = terrain[bty + bj*this.blockTileHeight];
					if (!terrainRow) {
						terrainRow = [];
						terrain.push(terrainRow);
					}
					var collisionRow = collision[bty + bj*this.blockTileHeight];
					if (!collisionRow) {
						collisionRow = [];
						collision.push(collisionRow);
					}
					
					// Copy tile columns
					var blockRow = block.tileData[bty];
					for (var btx=0 ; btx<this.blockTileWidth ; btx++) {
						var tileData = blockRow[btx];
						if (tileData) {
							terrainRow.push(tileData.tile);
							collisionRow.push(tileData.tileCollision);
							
							// Spawn Ore
							if (!blockAlreadyLoaded && tileData.ore) {
								var tx = btx + bx*this.blockTileWidth;
								var ty = bty + by*this.blockTileHeight;
								var x = tx * this.tilesize;
								var y = ty * this.tilesize;
								
								ig.game.spawnEntity('EntityOre', x, y, {
									tileOffset: tileData.ore.tile,
									oreType: tileData.ore.type,
									oreSize: tileData.ore.size,
									blockIndex: { x: bx, y: by },
									blockTileIndex: { x: btx, y: bty },
									value: tileData.ore.value
								});
							}
						} else {
							terrainRow.push(0);
							collisionRow.push(0);
						}
					}
				}
				
				// Spawn doodads for block if new block
				if (!blockAlreadyLoaded) {
					//console.log('loading block doodads: ' + bx + ',' + by);
					
					var doodads = block.doodads;
					for (var d=0 ; d<doodads.length ; d++) {
						var doodad = doodads[d];
						
						doodad.blockIndex = {
							x: bx,
							y: by
						};
						
						var tx = (doodad.blockTileIndex.x + bx*this.blockTileWidth);
						var ty = (doodad.blockTileIndex.y + by*this.blockTileHeight);
						var x = tx * this.tilesize + this.tilesize/2;
						var y = ty * this.tilesize;
						
						var doodadEntity = ig.game.spawnDoodadEntity(doodad.className, x, y, doodad);
					}
				} else {
					//console.log('skipping already-loaded block doodads: ' + bx + ',' + by);
				}
			}
		}
		
		this.loadedBlockIndices = newLoadedBlockIndices;
		
		console.log('loaded ' + terrain.length + 'x' + terrain[0].length);
	},
	
	draw: function() {
		if (!this.loaded) { return; }
		
		this.terrainMap.draw();
	},
	
	drawBackground: function() {
		if (!this.loaded) { return; }
		
		var blockStart = {
			x: (this.curGlobalBlockIndex.x - this.blockLoadDistance) * this.blockTileWidth * this.tilesize,
			y: (this.curGlobalBlockIndex.y - this.blockLoadDistance) * this.blockTileHeight * this.tilesize
		};
		this.terrainBackgroundMap.setScreenPos(
			ig.game.screen.x - blockStart.x,
			ig.game.screen.y - blockStart.y
		);
		this.terrainBackgroundMap.draw();
	},
	
	
	populateBlock: function(bx, by) {
		
		var bxRepeat = bx;
		if (bx >= this.blockWidth || bx < 0) {
			bxRepeat = (bx%this.blockWidth + this.blockWidth) % this.blockWidth;
		}
	
		//console.log('populating block at: ' + bx + ',' + by);
		var block = {
			index: {
				x: bx,
				y: by
			},
			tileData: [],
			doodads: [],
			edgeSpawns: []
			
		};
		this.setBlockAtIndex(bxRepeat, by, block);
		
		var allSky = true;
		var allSame = true;
		var prevZone = null;
		
		for (var bty=0 ; bty<this.blockTileHeight ; bty++) {
			var ty = by * this.blockTileHeight + bty;
			
			var row = [];
			block.tileData.push(row);
			
			var topFreeLeft = false;
			var topFreeLeft2 = false;
			
			for (var btx=0 ; btx<this.blockTileWidth ; btx++) {
				var tx = bxRepeat * this.blockTileWidth + btx;
				
				// Create tile
				var data = {
					health: 10
				};
				row.push(data);
				
				// Zone data
				data.zone = this.getZoneAtTileIndex(tx, ty);
				allSky &= (data.zone < 0);
				if (prevZone != null) {
					allSame &= (data.zone == prevZone);
				}
				prevZone = data.zone;
				
				// Tile data
				data.tileType = this.computeTileType(tx, ty);
				if (data.tileType == Tile.TYPE.HARD) {
					data.health *= this.hardDensityFactor;
				}
				if (data.tileType != Tile.TYPE.NONE) {
					data.tileEdge = this.computeTileEdge(tx, ty, data.tileType);
				}
				data.tile = this.computeRealTile(data.tileType, data.tileEdge, data.zone);
				data.tileCollision = this.computeTileCollision(data.tileType, data.tileEdge);
				data.tileBackground = this.computeBackgroundTile(tx, ty);
				
				// Ore
				if (data.tileType != Tile.TYPE.NONE) {
					data.ore = this.computeTileOre(tx, ty);
					if (data.ore) {
						data.ore.tile = data.ore.type * 9 + data.ore.size * 3 + terra.randInt(2);
					}
				}
				
				// Edge computations - doodads and enemy spawns
				// Skipping first/last row/column in block for convenience
				if (data.tileType != Tile.TYPE.NONE && bty > 0  && bty < this.blockTileHeight-1 && btx > 0) {
				
					var topTile = block.tileData[bty-1][btx];
					//var bottomBlock = block.tileData[bty+1][btx];
					
					if (topTile.zone < 0) {
						data.surface = true;
					}
					
					var zoneData = this.zones[data.zone];
					
					var topFree = (
						data.tileEdge == Tile.EDGE.TOP ||
						data.tileEdge == Tile.EDGE.TOP_LEFT ||
						data.tileEdge == Tile.EDGE.TOP_RIGHT 
					) && 
					(topTile.tileType == Tile.TYPE.NONE);
					
					var doodadPlaced = false;
					
					// Triple top (Trees, Bushes, 3x edge spawns)
					if (topFreeLeft2 && topFreeLeft && topFree) {
						
						block.edgeSpawns.push({
							side: 'top',
							size: 3,
							blockTileIndex: {
								x: btx,
								y: bty
							}
						});
						
						// Tree Doodads
						if (zoneData.doodads.Tree && data.surface && Math.random() < zoneData.doodads.Tree.density) {
							block.doodads.push({
								className: 'EntityDoodadTree',
								blockTileIndex: {
									x: btx-1,
									y: bty
								},
								tileOffset: zoneData.doodads.Tree.tileOffset + terra.randInt(zoneData.doodads.Tree.tileEntropy)
							});
							
							doodadPlaced = true;
							
							topFreeLeft = false;
						}
						
						// Bush doodads
						if (zoneData.doodads.Bush && Math.random() < zoneData.doodads.Bush.density) {
							block.doodads.push({
								className: 'EntityDoodadBush',
								blockTileIndex: {
									x: btx-1,
									y: bty
								},
								tileOffset: zoneData.doodads.Bush.tileOffset + terra.randInt(zoneData.doodads.Bush.tileEntropy)
							});
							
							doodadPlaced = true;
							
							topFreeLeft = false;
						}
					}
					
					// Double top (shrubs, 2x edge spawns)
					if (topFree && topFreeLeft) {
						
						block.edgeSpawns.push({
							side: 'top',
							size: 2,
							blockTileIndex: {
								x: btx,
								y: bty
							}
						});
						
						if (zoneData.doodads.Shrub && Math.random() < zoneData.doodads.Shrub.density) {
							block.doodads.push({
								className: 'EntityDoodadShrub',
								blockTileIndex: {
									x: btx,
									y: bty
								},
								tileOffset: zoneData.doodads.Shrub.tileOffset + terra.randInt(zoneData.doodads.Shrub.tileEntropy)
							});
							
							doodadPlaced = true;
							
							topFreeLeft = false;
						}
					}
					
					// Single top tiles (grass, dirt)
					if (zoneData.doodads.Grass && data.surface && topFree && Math.random() < zoneData.doodads.Grass.density) {
						
						block.doodads.push({
							className: 'EntityDoodadGrass',
							foreground: true,
							blockTileIndex: {
								x: btx,
								y: bty
							},
							tileOffset: zoneData.doodads.Grass.tileOffset + terra.randInt(zoneData.doodads.Grass.tileEntropy)
						});
						
					}
					
					topFreeLeft2 = topFreeLeft;
					topFreeLeft = topFree;
				} else {
					topFreeLeft = false;
				}
			}
		}
		
		// Compute background chunk
		var bgChunk = null;
		
		// Empty
		if (allSky) {
			bgChunk = null;
		} 
		// Solid
		else if (allSame) {
			var zone = this.getZoneAtTileIndex(bxRepeat * this.blockTileWidth, by * this.blockTileHeight);
			if (zone >= 0) {
				bgChunk = this.solidBackgroundChunks[zone];
			}
		} 
		// Computed (zone boundary)
		else {
			var data = [];
			this.terrainBackgroundMap.data = data;
			
			for (var bty=0 ; bty<this.blockTileHeight ; bty++) {
				data[bty] = [];
				for (var btx=0 ; btx<this.blockTileWidth ; btx++) {
					data[bty][btx] = block.tileData[bty][btx].tileBackground;
				}
			}
			
			bgChunk = this.terrainBackgroundMap.preRenderChunk(
				0, 0, 
				this.terrainBackgroundMap.chunkSize, 
				this.terrainBackgroundMap.chunkSize
			);
			
			this.terrainBackgroundMap.data = null;
		}
		
		block.backgroundChunk = bgChunk;
	},
	
	computeTileType: function(tx, ty) {
		if (tx >= this.tileWidth || tx < 0) {
			tx = (tx%this.tileWidth + this.tileWidth) % this.tileWidth;
		}
		if (this.isTileInSky(tx, ty)) {
			return Tile.TYPE.NONE;
		} else if (this.isTileInCave(tx, ty)) {
			return Tile.TYPE.NONE;
		} else if (this.isTileHard(tx, ty)) {
			return Tile.TYPE.HARD;
		} else {
			return Tile.TYPE.TERRAIN;
		}
	},
	
	// Computes using noise only; destroyed tiles not considered
	// Expects repeat-normalized tile index
	computeTileEdge: function(tx, ty, tileType) {
		
		if (tileType == Tile.TYPE.NONE) {
			return null;
		}
		
		var edge = Tile.EDGE.CENTER;
		
		// Recomputing every time here. Could try to retrieve from existing data.
		var m01 = this.computeTileType(tx, ty-1) == tileType;		// top
		var m10 = this.computeTileType(tx-1, ty) == tileType;		// left
		var m12 = this.computeTileType(tx+1, ty) == tileType;		// right
		var t21 = this.computeTileType(tx, ty+1);
		var m21 = t21 == tileType || this.getZoneAtTileIndex(tx, ty) != this.getZoneAtTileIndex(tx, ty+1);		// bottom; if on a zone boundary, treat this like a non-match as well

		// all
		if (!m01 && !m10 && !m12 && !m21) {
			edge = Tile.EDGE.ALL;
		}
		
		// triples
		else if (!m01 && !m10 && !m12) {
			edge = Tile.EDGE.TRIPLE_TOP;
		} else if (!m01 && !m10 && !m21) {
			edge = Tile.EDGE.TRIPLE_LEFT;
		} else if (!m01 && !m12 && !m21) {
			edge = Tile.EDGE.TRIPLE_RIGHT;
		} else if (!m10 && !m12 && !m21) {
			edge = Tile.EDGE.TRIPLE_BOTTOM;
		} 
		
		// doubles (sides)
		else if (!m10 && !m12) {
			edge = Tile.EDGE.LEFT_RIGHT;
		} else if (!m01 && !m21) {
			edge = Tile.EDGE.TOP_BOTTOM;
		}
		
		// Corners
		else if (!m01 && !m10) {
			edge = Tile.EDGE.TOP_LEFT;
		} else if (!m01 && !m12) {
			edge = Tile.EDGE.TOP_RIGHT;
		} else if (!m10 && !m21) {
			edge = Tile.EDGE.BOTTOM_LEFT;
		} else if (!m21 && !m12 ) {
			edge = Tile.EDGE.BOTTOM_RIGHT;
		}
		
		// Sides
		else if (!m01) {
			edge = Tile.EDGE.TOP;
		} else if (!m10) {
			edge = Tile.EDGE.LEFT;
		} else if (!m12) {
			edge = Tile.EDGE.RIGHT;
		} else if (!m21) {
			edge = Tile.EDGE.BOTTOM;
		}
		
		return edge;
	},
	
	// Computes from existing tiles
	recomputeTileEdge: function(tx, ty, tile) {
		
		/*if (tile.tileType == Tile.TYPE.NONE) {
			return 0;
		}*/
		
		var edge = Tile.EDGE.CENTER;
		
		var t01 = this.getTileAtIndex(tx, ty-1);		// top
		t01 = !t01 || t01.tileType == Tile.TYPE.NONE || t01.tileType != tile.tileType;
		var t10 = this.getTileAtIndex(tx-1, ty);		// left
		t10 = !t10 || t10.tileType == Tile.TYPE.NONE || t10.tileType != tile.tileType;
		var t12 = this.getTileAtIndex(tx+1, ty);		// right
		t12 = !t12 || t12.tileType == Tile.TYPE.NONE || t12.tileType != tile.tileType;
		var t21 = this.getTileAtIndex(tx, ty+1);		// bottom
		t21 = !t21 || t21.tileType == Tile.TYPE.NONE || t21.tileType != tile.tileType;
		
		// all
		if (t01 && t10 && t12 && t21) {
			edge = Tile.EDGE.ALL;
		}
		
		// triples
		else if (t01 && t10 && t12) {
			edge = Tile.EDGE.TRIPLE_TOP;
		} else if (t01 && t10 && t21) {
			edge = Tile.EDGE.TRIPLE_LEFT;
		} else if (t01 && t12 && t21) {
			edge = Tile.EDGE.TRIPLE_RIGHT;
		} else if (t10 && t12 && t21) {
			edge = Tile.EDGE.TRIPLE_BOTTOM;
		} 
		
		// doubles (sides)
		else if (t10 && t12) {
			edge = Tile.EDGE.LEFT_RIGHT;
		} else if (t01 && t21) {
			edge = Tile.EDGE.TOP_BOTTOM;
		}
		
		// Corners
		else if (t01 && t10) {
			edge = Tile.EDGE.TOP_LEFT;
		} else if (t01 && t12) {
			edge = Tile.EDGE.TOP_RIGHT;
		} else if (t10 && t21) {
			edge = Tile.EDGE.BOTTOM_LEFT;
		} else if (t21 && t12 ) {
			edge = Tile.EDGE.BOTTOM_RIGHT;
		}
		
		// Sides
		else if (t01) {
			edge = Tile.EDGE.TOP;
		} else if (t10) {
			edge = Tile.EDGE.LEFT;
		} else if (t12) {
			edge = Tile.EDGE.RIGHT;
		} else if (t21) {
			edge = Tile.EDGE.BOTTOM;
		}
		
		return edge;
	},
	
	computeBackgroundTile: function(tx, ty) {
		ty -= 1;		// Actually compute for tile above, to chop off the top 'layer'
		
		var zone = this.getZoneAtTileIndex(tx, ty);
		if (zone < 0) {
			return 0;
		}
		
		var tile = Tile.EDGE.CENTER + terra.randInt(2);		// Slightly hacky since we do this after for terrain tiles
		
		var z01 = this.getZoneAtTileIndex(tx, ty-1) != zone;		// top
		var z10 = this.getZoneAtTileIndex(tx-1, ty) != zone;		// left
		var z12 = this.getZoneAtTileIndex(tx+1, ty) != zone;		// right

		// triples (only top)
		if (z01 && z10 && z12) {
			tile = Tile.EDGE.TRIPLE_TOP;
		}	
		
		// Corners (only topLeft and topRight)
		else if (z01 && z10) {
			tile = Tile.EDGE.TOP_LEFT;
		} else if (z01 && z12) {
			tile = Tile.EDGE.TOP_RIGHT;
		}
		
		// Sides (only left and right)
		else if (z01) {
			tile = Tile.EDGE.TOP;
		} else if (z10) {
			tile = Tile.EDGE.LEFT;
		} else if (z12) {
			tile = Tile.EDGE.RIGHT;
		}
		
		return tile + zone * this.terrainBackgroundTilesetWidth + 1;
	},
	
	computeRealTile: function(type, edge, zone, charred) {
		if (charred) {
			edge += Math.floor(this.terrainTilesetWidth / 2);
		}
		if (type == Tile.TYPE.NONE) {
			return 0;
		} else if (type == Tile.TYPE.HARD) {
			if (edge == Tile.EDGE.CENTER) {
				return edge + terra.randInt(2) + 1;
			} else {
				return edge + 1;
			}
		} else {
			if (edge == Tile.EDGE.CENTER) {
				return this.terrainTilesetWidth + zone * this.terrainTilesetWidth + edge + terra.randInt(2) + 1;
			} else {
				//if (charred) {
				//	edge += Math.floor(this.terrainTilesetWidth / 2);
				//}
				return this.terrainTilesetWidth + zone * this.terrainTilesetWidth + edge + 1;
			}
		}
	},
	
	computeTileCollision: function(type, edge) {
		if (type == Tile.TYPE.NONE) {
			return 0;		// empty
		}
		/*var edgeCollision = Tile.EDGE_COLLISION[edge];
		if (edgeCollision != undefined) {
			return edgeCollision;		// sloped edge
		}*/
		return 1;		// solid
	},
	
	
	
	
	getBlockAtPosition: function(x, y) {
		var index = this.getBlockIndexAtPosition(x, y);
		if (index == null) { return null; }
		
		return this.getBlockAtIndex(index.x, index.y);
	},
	
	// Expects repeat-normalized block index
	getBlockAtIndex: function(bx, by) {
		var row;
		if ((row = this.blocks[by]) == undefined) {
			row = this.blocks[by] = [];
		}
		return row[bx];
	},
	
	getDoodadBlockAtIndex: function(bx, by) {
		var row;
		if ((row = this.doodadBlocks[by]) == undefined) {
			row = this.doodadBlocks[by] = [];
		}
		return row[bx];
	},
	
	// Expects repeat-normalized block index
	setBlockAtIndex: function(bx, by, data) {
		var row;
		if ((row = this.blocks[by]) == undefined) {
			row = this.blocks[by] = [];
		}
		row[bx] = data;
	},
	
	// Expects repeat-normalized block index
	setDoodadBlockAtIndex: function(bx, by, data) {
		var row;
		if ((row = this.doodadBlocks[by]) == undefined) {
			row = this.doodadBlocks[by] = [];
		}
		row[bx] = data;
	},
	
	// Repeats by default
	getBlockIndexAtPosition: function(x, y, repeat) {
		
		var tx = Math.floor(x / this.tilesize);
		var ty = Math.floor(y / this.tilesize);
		var bx = Math.floor(tx / this.blockTileWidth);
		var by = Math.floor(ty / this.blockTileHeight);
		
		if (by < 0) {
			console.log('invalid block position: ' + x + ',' + y);
			return null;
		}
		
		if (repeat !== false) {
			if (bx >= this.blockWidth || bx < 0) {
				bx = (bx%this.blockWidth + this.blockWidth) % this.blockWidth;
			}
		}
		
		return {x: bx, y: by};
	},
	
	
	// Gets absolute, repeated tile index at global position
	getTileIndexAtPosition: function(x, y) {
		var tx = Math.floor(x / this.tilesize);
		if (tx >= this.tileWidth || tx < 0) {
			tx = (tx%this.tileWidth + this.tileWidth) % this.tileWidth;
		}
		var ty = Math.floor(y / this.tilesize);
		return {
			tx: tx,
			ty: ty
		};
	},
	
	getTileAtPosition: function(x, y) {
		var tx = Math.floor(x / this.tilesize);
		var ty = Math.floor(y / this.tilesize);
		return this.getTileAtIndex(tx, ty);
	},
	
	getTileAtIndex: function(tx, ty) {
		//console.log('global tile: ' + tx + ',' + ty);
		
		if (tx >= this.tileWidth || tx < 0) {
			tx = (tx%this.tileWidth + this.tileWidth) % this.tileWidth;
		}
		
		var bx = Math.floor(tx / this.blockTileWidth);
		var by = Math.floor(ty / this.blockTileHeight);
		
		var block = this.getBlockAtIndex(bx, by);
		if (!block) {
			return null;
		}
		
		var btx = tx - bx * this.blockTileWidth;
		var bty = ty - by * this.blockTileHeight;
		
		return block.tileData[bty][btx];
	},
	
	setTileAtIndex: function(tx, ty, data) {
		//console.log('global tile: ' + tx + ',' + ty);
		
		if (tx >= this.tileWidth || tx < 0) {
			tx = (tx%this.tileWidth + this.tileWidth) % this.tileWidth;
		}
		
		var bx = Math.floor(tx / this.blockTileWidth);
		var by = Math.floor(ty / this.blockTileHeight);
		
		//console.log('block: ' + bx + ',' + by);
		//console.log('curBlock: ' + this.curBlockIndex.x + ',' + this.curBlockIndex.y);
		
		var btx = tx - bx * this.blockTileWidth;
		var bty = ty - by * this.blockTileHeight;
		
		//console.log('block tile: ' + btx + ',' + bty);
		
		var blockRow = this.blocks[by];
		if (blockRow == undefined) {debugger;}
		
		blockRow[bx].tileData[bty][btx] = data;
	},
	
	
	damageTileAtPosition: function(x, y, dmg) {
		var tx = Math.floor(x / this.tilesize);
		var ty = Math.floor(y / this.tilesize);
		this.damageTileAtIndex(tx, ty, dmg);
	},
	
	damageTileAtIndex: function(tx, ty, dmg) {
		var tile = this.getTileAtIndex(tx, ty);
	
		//console.log('damage tile at index: ' + tx + ',' + ty);
		
		if (tile && tile.tileType != Tile.TYPE.NONE && tile.health != undefined && !tile.indestructable) {
			if (tile.health - dmg <= 0) {
				this.destroyTileAtIndex(tx, ty, tile);
			} else {
				tile.health -= dmg;
				this.charTileAtIndex(tx, ty, tile);
				this.spawnDamageParticlesAtIndex(tx, ty, tile);
			}
		}
	},
	
	spawnDamageParticlesAtIndex: function(tx, ty, tile) {
		tile = tile || this.getTileAtIndex(tx, ty);
		
		// Figure out tile particle style
		var style = '#495aff';		// Arbitrary default (brown)
		if (tile.tileType == Tile.TYPE.HARD) {
			style = this.hardParticleStyle;
		} else {
			var z = this.getZoneAtTileIndex(tx, ty);
			style = this.zones[z].particleStyle;
		}
		
		var x = tx * this.tilesize + this.tilesize/2;
		var y = ty * this.tilesize + this.tilesize/2;
		for (var p=0 ; p<this.terrainDamageParticles ; p++) {
			ig.game.spawnEntity('EntityParticleRect', x, y, { fillStyle: style });
		}
	},
	
	destroyTileAtIndex: function(tx, ty, tile) {
		tile = tile || this.getTileAtIndex(tx, ty);
		if (!tile) { return; }
		
		// Update tile
		//tile.tileType = Tile.TYPE.NONE;
		
		// Get block
		var bx = Math.floor(tx / this.blockTileWidth);
		var by = Math.floor(ty / this.blockTileHeight);
		
		var bxRepeat = bx;
		if (bx >= this.blockWidth || bx < 0) {
			bxRepeat = (bx%this.blockWidth + this.blockWidth) % this.blockWidth;
		}
		
		var btx = tx - bx * this.blockTileWidth;
		var bty = ty - by * this.blockTileHeight;
		
		var block = this.blocks[by][bxRepeat];
		block.tileData[bty][btx] = undefined;
		
		// Update Impact maps
		if (
			Math.abs(bx - this.curGlobalBlockIndex.x) <= this.blockLoadDistance || 
			Math.abs(by - this.curGlobalBlockIndex.y) <= this.blockLoadDistance
		) {
			//var mapIndex = this.globalIndexToMapIndex(tx, ty);
			var bgx = btx + (bx - (this.curGlobalBlockIndex.x - this.blockLoadDistance)) * this.blockTileWidth;
			var bgy = bty + (by - (this.curGlobalBlockIndex.y - this.blockLoadDistance)) * this.blockTileHeight;
			
			// It's possible this tile isn't even loaded in the backgroundmap!
			var terrainRow = this.terrainMap.data[bgy];
			if (!terrainRow) { return; }
			
			// Remove tile from loaded maps
			terrainRow[bgx] = 0;
			this.terrainMap._retile = true;
			ig.game.collisionMap.data[bgy][bgx] = 0;
			
			// Update surrounding tiles
			this.charTileNeighbors(tx, ty, tile);
			
			// Destroy doodads (entities and block data)
			this.destroyTileDoodads(bx, by, btx, bty, block);
			
			// Release ore (entities and tile data)
			tile.ore = null;
			var ore = ig.game.findTileEntities('EntityOre', bx, by, btx, bty);
			if (ore.length > 0) {
				ore[0].release();
			}
			
			// Spawn particles
			this.spawnDamageParticlesAtIndex(tx, ty, tile);
			
			// Play sound
			//this.tileHitSound.play();
		}
	},
	
	destroyTileDoodads: function(bx, by, btx, bty, block) {
		var bxRepeat = bx;
		if (bx >= this.blockWidth || bx < 0) {
			bxRepeat = (bx%this.blockWidth + this.blockWidth) % this.blockWidth;
		}
		
		var block = block || this.getBlockAtIndex(bxRepeat, by);
		//var blockDoodads = this.getDoodadBlockAtIndex(bx, by);
		if (!block) {
			console.log('Error: Block not found for doodads at ' + bx + ',' + by);
			return;
		}
		
		// Remove block data
		for (var d=block.doodads.length-1 ; d>=0 ; d--) {
			var doodad = block.doodads[d];
			if (doodad.blockTileIndex.x == btx && doodad.blockTileIndex.y == bty) {
				block.doodads.splice(d, 1);		// Remove backing data
			}
		}
		
		// Kill entities
		var ents = ig.game.findDoodadEntities(bx, by, btx, bty);
		for (var e=0 ; e<ents.length ; e++) {
			ents[e].kill();
		}
	},
	
	charTileNeighbors: function(tx, ty, tile) {
		this.charTileAtIndex(tx, ty-1);
		this.charTileAtIndex(tx-1, ty);
		this.charTileAtIndex(tx+1, ty);
		this.charTileAtIndex(tx, ty+1);
	},
	
	charTileAtIndex: function(tx, ty, tile) {
		tile = tile || this.getTileAtIndex(tx, ty);
		if (!tile) { return; }
		
		var txRepeat = tx;
		if (tx >= this.tileWidth || tx < 0) {
			txRepeat = (tx%this.tileWidth + this.tileWidth) % this.tileWidth;
		}
		
		if (!tile.indestructable) {
			tile.charred = true;
		}
		tile.tileEdge = this.recomputeTileEdge(txRepeat, ty, tile);
		tile.tile = this.computeRealTile(tile.tileType, tile.tileEdge, tile.zone, tile.charred);
		
		var bx = Math.floor(tx / this.blockTileWidth);
		var by = Math.floor(ty / this.blockTileHeight);
		
		if (
			Math.abs(bx - this.curGlobalBlockIndex.x) <= this.blockLoadDistance || 
			Math.abs(by - this.curGlobalBlockIndex.y) <= this.blockLoadDistance
		) {
			//var mapIndex = this.globalIndexToMapIndex(tx, ty);
			var btx = tx - bx * this.blockTileWidth;
			var bty = ty - by * this.blockTileHeight;
			var bgx = btx + (bx - (this.curGlobalBlockIndex.x - this.blockLoadDistance)) * this.blockTileWidth;
			var bgy = bty + (by - (this.curGlobalBlockIndex.y - this.blockLoadDistance)) * this.blockTileHeight;
			
			if (bgx > 0 && bgx < this.terrainMap.width && bgy > 0 && bgy < this.terrainMap.height) {
				this.terrainMap.data[bgy][bgx] = tile.tile;
				this.terrainMap._retile = true;
			} else {
				// If this happens something went wrong. We're trying to copy a tile to an index outside the BackgroundMap's bounds
				//debugger;
			}
		}
	},
	
	damageTilePattern: function(x, y, data) {
		if (typeof data === 'number') {
			this.damageTileAtPosition(x, y, data);
			return;
		}
		
		var tx = Math.floor( x / this.tilesize );
		var ty = Math.floor( y / this.tilesize );
		var patH = data.length;
		var patW = data[0].length;
		var txStart = Math.floor(tx - patW / 2);
		var tyStart = Math.floor(ty - patH / 2);
		
		for (var i=0 ; i < patH ; i++) {
			for (var j=0 ; j < patW ; j++) {
				var dmg = data[i][j];
				if (dmg > 0) {
					var txRepeat = txStart + j;
					//if (txRepeat >= this.tileWidth || txRepeat < 0) {
					//	txRepeat = (txRepeat%this.tileWidth + this.tileWidth) % this.tileWidth;
					//}
		
					this.damageTileAtIndex(txRepeat, tyStart + i, dmg);
				}
			}
		}
	},
	
	// Not used?
	destroyTilePattern: function(x, y, data) {
		if (data.length == 1 && data[0].length == 1) {
			this.destroyTile(x, y);
			return;
		}
		
		var tx = Math.floor( x / this.tilesize );
		var ty = Math.floor( y / this.tilesize );
		if ((tx >= 0 && tx <  this.width) && (ty >= 0 && ty < this.height)) {
			var patH = data.length;
			var patW = data[0].length;
			var txStart = Math.floor(tx - patW / 2);
			var tyStart = Math.floor(ty - patH / 2);
			for (var i=0 ; i < patH ; i++) {
				for (var j=0 ; j < patW ; j++) {
					if (data[i][j]) {
						this.destroyTileAtIndex(txStart + j, tyStart + i);
					}
				}
			}
		}
	},
	
	isTileInSky: function(tx, ty) {
		return ty < this.zoneDepths[0][tx];
	},
	
	isTileInCave: function(x, y) {
		
		noise.seed(ig.game.seed);
		
		// Mirror half the terrain
		x = x > this.tileWidth / 2 ? this.tileWidth - x : x;
		
		var caveNoise = noise.perlinFBM2(
			(x + 1) / this.tileWidth, 
			(y + 1) / this.tileWidth,
			this.caveNoiseData.smoothing, 
			this.caveNoiseData.octaves, 
			this.caveNoiseData.amplitude, 
			this.caveNoiseData.frequency
		);
		
		//caveNoise = (1 + caveNoise) / 2;		// noise is [-1,1]. Transform to [0,1].
		
		if (caveNoise > this.caveNoiseData.low && caveNoise < this.caveNoiseData.high) {
			return true;
		} else {
			return false;
		}
	},
	
	isTileHard: function(x, y) {
		
		noise.seed(this.hardSeed);
		
		// Mirror half the terrain
		x = x > this.tileWidth / 2 ? this.tileWidth - x : x;
		
		var hardNoise = noise.perlinFBM2(
			(x + 1) / this.tileWidth, 
			(y + 1) / this.tileWidth,
			this.caveNoiseData.smoothing, 
			this.caveNoiseData.octaves, 
			this.caveNoiseData.amplitude, 
			this.caveNoiseData.frequency
		);
		
		if (hardNoise > this.hardNoiseData.low && hardNoise < this.hardNoiseData.high) {
			return true;
		} else {
			return false;
		}
	},
	
	computeTileOre: function(tx, ty) {
		noise.seed(this.oreSeed);
		
		// Mirror half the terrain
		//tx = tx > this.tileWidth / 2 ? this.tileWidth - tx : tx;
		
		var oreData = null;
		
		// Compute special ore first
		var oreNoise = noise.perlinFBM2(
			(tx + 1) / this.tileWidth, 
			(ty + 1) / this.tileWidth,
			this.specialOreData.smoothing, 
			this.specialOreData.octaves, 
			this.specialOreData.amplitude, 
			this.specialOreData.frequency
		);
		
		// Check thresholds. If none pass, check for regular ore
		if (oreNoise > this.specialOreData.largeThreshold) {
			oreData = {
				type: this.specialOreType, 
				size: EntityOre.SIZE.LARGE, 
				value: EntityOre.VALUE[EntityOre.SIZE.LARGE]
			};
		} else if (oreNoise > this.specialOreData.mediumThreshold) {
			oreData = {
				type: this.specialOreType, 
				size: EntityOre.SIZE.MEDIUM, 
				value: EntityOre.VALUE[EntityOre.SIZE.MEDIUM]
			};
		}/* else if (oreNoise > this.specialOreData.smallThreshold) {
			oreData = { type: this.specialOreType, size: EntityOre.SIZE.SMALL };
		}*/ else {
			oreData = this.computeRegularTileOre(tx, ty);
		}
		
		return oreData;
	},
	
	computeRegularTileOre: function(tx, ty) {
		noise.seed(this.specialOreSeed);
		
		// Mirror half the terrain
		//tx = tx > this.tileWidth / 2 ? this.tileWidth - tx : tx;
		
		var oreData = null;
		
		var oreNoise = noise.perlinFBM2(
			(tx + 1) / this.tileWidth, 
			(ty + 1) / this.tileWidth,
			this.oreData.smoothing, 
			this.oreData.octaves, 
			this.oreData.amplitude, 
			this.oreData.frequency
		);
		
		if (oreNoise > this.oreData.largeThreshold) {
			oreData = {
				type: EntityOre.TYPE.REGULAR, 
				size: EntityOre.SIZE.LARGE, 
				value: EntityOre.VALUE[EntityOre.SIZE.LARGE]
			};
		} else if (oreNoise > this.oreData.mediumThreshold) {
			oreData = {
				type: EntityOre.TYPE.REGULAR, 
				size: EntityOre.SIZE.MEDIUM, 
				value: EntityOre.VALUE[EntityOre.SIZE.MEDIUM]
			};
		}/* else if (oreNoise > this.oreData.smallThreshold) {
			oreData = { type: EntityOre.TYPE.REGULAR, size: EntityOre.SIZE.SMALL };
		}*/
		
		return oreData;
	},
	
	getZoneAtPosition: function(x, y) {
		var tx = Math.floor( x / this.tilesize );
		var ty = Math.floor( y / this.tilesize );
		return this.getZoneAtTileIndex(tx, ty);
	},
	
	getZoneAtTileIndex: function(tx, ty) {
		if (ty < 0) {
			return -1;
		}
		if (tx >= this.tileWidth || tx < 0) {
			tx = (tx%this.tileWidth + this.tileWidth) % this.tileWidth;
		}
		var zone = -1;
		for (var z=0 ; z<this.zones.length ; z++) {
			if (ty < this.zoneDepths[z][tx]) {
				return zone;
			}
			zone++;
		}
		return zone;
	},
	
	mapIndexToGlobalIndex: function(mtx, mty) {
		return {
			x: mtx + (this.curGlobalBlockIndex.x - this.blockLoadDistance) * this.blockTileWidth,
			y: mty + (this.curGlobalBlockIndex.y - this.blockLoadDistance) * this.blockTileHeight
		};
	},
	
	repeatGlobalTx: function(tx) {
		var repeatTx = tx;
		if (tx >= this.tileWidth || tx < 0) {
			repeatTx = (tx%this.tileWidth + this.tileWidth) % this.tileWidth;
		}
		return repeatTx;
	},
	
	// Naive search for object with matching x and y property values.
	indexInArray: function(arr, x, y) {
		for (var i=0 ; i<arr.length ; i++) {
			var elem = arr[i];
			if (elem.x == x && elem.y == y) {
				return true;
			}
		}
		return false;
	}
});

});