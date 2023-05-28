ig.module(
	'game.lighting'
)
.requires(
	'impact.impact',
	
	'game.tile'
)
.defines(function() {

Lighting = ig.Class.extend({
	
	enabled: true,
	
	blackColor: 'rgba(4,4,4,1)',
	ambientColor: 'rgba(0,0,0,0.0)',
	
	darkMaskCanvas: null,
	darkMaskContext: null,
	
	// Point lights
	playerLightRadius: 80,
	playerLightCanvas: null,
	playerLightContext: null,
	
	surfaceLightRadius: 80,
	surfaceLightCanvas: null,
	surfaceLightContext: null,
	
	density: {x: 60, y: 30},		// deprecated
	
	sources: [],
	pointSourceCache: {},
	
	data: [[]],
	
	init: function() {
		
		// Main mask canvas
		this.darkMaskCanvas = ig.$new('canvas');
		this.darkMaskContext = this.darkMaskCanvas.getContext('2d');
		
		this.darkMaskContext.globalCompositeOperation = 'lighten';
		this.darkMaskContext.imageSmoothingEnabled = false;
		
		this.darkMaskCanvas.width = ig.system.realWidth;
		this.darkMaskCanvas.height = ig.system.realHeight;
		
		this.createPlayerLight();
		this.createSurfaceLight();
	},
	
	update: function() {
		
		// Make sure dimensions are correct
		this.darkMaskCanvas.width = ig.system.realWidth;
		this.darkMaskCanvas.height = ig.system.realHeight;
		
		// Clear black
		this.darkMaskContext.fillStyle = this.blackColor;
		this.darkMaskContext.fillRect(0, 0, this.darkMaskCanvas.width, this.darkMaskCanvas.height);
		
		var tm = ig.game.terrainManager.terrainMap;
		
		// Set dimensions to terrainMap dimensions
		this.data = [];
		for (var r=0 ; r<tm.data.length ; r++) {
			this.data.push([]);
		}
		
		var tileOffsetX = (tm.scroll.x / tm.tilesize).toInt(),
			tileOffsetY = (tm.scroll.y / tm.tilesize).toInt(),
			pxOffsetX = tm.scroll.x % tm.tilesize,
			pxOffsetY = tm.scroll.y % tm.tilesize,
			pxMinX = -pxOffsetX - tm.tilesize,
			pxMinY = -pxOffsetY - tm.tilesize,
			pxMaxX = ig.system.width + tm.tilesize - pxOffsetX,
			pxMaxY = ig.system.height + tm.tilesize - pxOffsetY;
		
		
		// Compute brightness for on-screen tiles
		for( var mapY = -1, pxY = pxMinY; pxY < pxMaxY; mapY++, pxY += tm.tilesize) {
			var tileY = mapY + tileOffsetY;
				
			// Repeat Y?
			if( tileY >= tm.height || tileY < 0 ) {
				continue;
			}
			
			for( var mapX = -1, pxX = pxMinX; pxX < pxMaxX; mapX++, pxX += tm.tilesize ) {
				var tileX = mapX + tileOffsetX;
				// Repeat X?
				if( tileX >= tm.width || tileX < 0 ) {
					continue;
				}
				
				// Get current terrainMap tile
				//var tile = tm.data[tileY][tileX];
				
				if (this.data[tileY]) {
				
					var gt = ig.game.terrainManager.mapIndexToGlobalIndex(tileX, tileY);
						
					// Optimization - fill entire row with white if we know it's all in the sky
					if (gt.y < ig.game.terrainManager.minTileDepth) {
						this.darkMaskContext.fillStyle = 'rgb(255,255,255)';
						this.darkMaskContext.fillRect(
							0,
							ig.system.getDrawPos(pxY),
							ig.system.realWidth,
							tm.tilesize * ig.system.scale
						);
						
						break;
					}
					
					// Compute brightness
					var brightness = this.computeTileBrightness(gt.x, gt.y);
					
					// Save brightness data
					this.data[tileY][tileX] = brightness;
					
					// Draw surface/sunlight gradients, indicated by -1 brightness
					if (brightness == -1) {
						this.darkMaskContext.drawImage(
							this.surfaceLightCanvas,
							0, 0,
							this.surfaceLightCanvas.width, 
							this.surfaceLightCanvas.height,
							ig.system.getDrawPos(pxX) - this.surfaceLightCanvas.width/2,
							ig.system.getDrawPos(pxY) - this.surfaceLightCanvas.height/2, 
							this.surfaceLightCanvas.width, 
							this.surfaceLightCanvas.height
						);
					}
					
					// Draw white rects for sky tiles
					if (brightness == -2) {
						this.darkMaskContext.fillStyle = 'rgb(255,255,255)';
						this.darkMaskContext.fillRect(
							ig.system.getDrawPos(pxX),
							ig.system.getDrawPos(pxY),
							tm.tilesize * ig.system.scale,
							tm.tilesize * ig.system.scale
						);
					}
				}
			} // end for x
		} // end for y
		
		// Ambient
		this.darkMaskContext.fillStyle = this.ambientColor;
		this.darkMaskContext.fillRect(0, 0, this.darkMaskCanvas.width, this.darkMaskCanvas.height);
		
		// Player light
		this.darkMaskContext.drawImage(
			this.playerLightCanvas,
			0, 0,
			this.playerLightCanvas.width, 
			this.playerLightCanvas.height,
			this.darkMaskCanvas.width/2 - this.playerLightCanvas.width/2 * ig.system.scale,
			this.darkMaskCanvas.height/2 - this.playerLightCanvas.height/2 * ig.system.scale, 
			this.playerLightCanvas.width * ig.system.scale, 
			this.playerLightCanvas.height * ig.system.scale
		);
		
		// Other sources
		var numDynamicSources = 0;
		for (var s=0 ; s<this.sources.length ; s++) {
			var source = this.sources[s];
			
			// Flicker code is very hacky - speed will depend on framerate
			var radius = source.radius;
			if (source.flicker) {
				if (Math.random() > 0.92) {
					radius -= source.flicker;
				}
			}
			
			// Create canvas if not cached
			var mask = this.pointSourceCache[radius];
			if (!mask) {
				mask = this.createPointSource(radius);
				this.pointSourceCache[radius] = mask;
			}
			
			// Source must be on-screen
			if (
				source.pos.x + source.radius > ig.game.screen.x &&
				source.pos.x - source.radius < ig.game.screen.x + ig.system.width &&
				source.pos.y + source.radius > ig.game.screen.y &&
				source.pos.y - source.radius < ig.game.screen.y + ig.system.height
			) {
				// Draw
				this.darkMaskContext.drawImage(
					mask.canvas,
					0, 0,
					mask.canvas.width, 
					mask.canvas.height,
					ig.system.getDrawPos(source.pos.x - ig.game.screen.x) - radius,
					ig.system.getDrawPos(source.pos.y - ig.game.screen.y) - radius, 
					mask.canvas.width * ig.system.scale, 
					mask.canvas.height * ig.system.scale
				);
				
				numDynamicSources++;
			}
		}
		
		// Force retile if dynamic sources are present
		if (numDynamicSources > 0) {
			tm._retile = true;
		}
	},
	
	createPointSource: function(radius) {
	
		// Create canvas
		var canvas = ig.$new('canvas');
		var context = canvas.getContext('2d');
		context.globalCompositeOperation = 'lighten';
		
		// Dimension
		radius = radius / ig.system.scale;		// Scale it down; will be scaled back up upon drawing
		canvas.width = radius * 2;
		canvas.height = radius * 2;
		
		// Clear
		context.fillStyle = 'rgba(0,0,0,0)';
		context.fillRect(0, 0, canvas.width, canvas.height);
		
		var center = {
			x: canvas.width / 2,
			y: canvas.height / 2,
		};
		
		// Colors
		var gradClr1 = 'rgba(255,255,200,1)';
		var gradClr2 = 'rgba(255,255,200,1)';
		var gradClr3 = 'rgba(255,255,255,0)';
		
		// Gradient
		this.tileGradient = context.createRadialGradient(
			center.x, center.y, 
			0, 
			center.x, center.y, 
			radius
		);
		this.tileGradient.addColorStop(0, gradClr1);
		//this.tileGradient.addColorStop(0.2, gradClr2);
		this.tileGradient.addColorStop(1, gradClr3);
		
		// Draw
		context.fillStyle = this.tileGradient;
		context.beginPath();
		context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
		context.fill();
		
		return {
			canvas: canvas,
			context: context
		};
	},
	
	/*updateOld: function() {
		if (!this.enabled) { return; }
		
		// Make sure dimensions are correct
		this.darkMaskCanvas.width = ig.system.realWidth;
		this.darkMaskCanvas.height = ig.system.realHeight;
		
		
		var center = {
			x: this.darkMaskCanvas.width / 2,
			y: this.darkMaskCanvas.height / 2,
		};
		
		// Clear
		this.darkMaskContext.fillStyle = 'rgba(1,1,1,1)';
		this.darkMaskContext.fillRect(0, 0, this.darkMaskCanvas.width, this.darkMaskCanvas.height);
		
		// Player light
		this.darkMaskContext.drawImage(
			this.playerLightCanvas,
			0, 0,
			this.playerLightCanvas.width, 
			this.playerLightCanvas.height,
			center.x - this.playerLightCanvas.width/2, 
			center.y - this.playerLightCanvas.height/2,
			this.playerLightCanvas.width, 
			this.playerLightCanvas.height
		);
		
		// Light screen
		var rect = {
			x: ig.game.screen.x,
			y: ig.game.screen.y,
			w: ig.system.width,
			h: ig.system.height
		};
		
		var stepX = 8;//Math.floor(rect.w / this.density.x);
		var stepY = 8;//Math.floor(rect.h / this.density.y);
		
		// Tile vs. screen correction
		var nudgeX = rect.x % stepX;
		var nudgeY = rect.y % stepY;
		
		for (var y=rect.y ; y<=(rect.y+rect.h+stepY) ; y+=stepY) {
			for (var x=rect.x ; x<=(rect.x+rect.w+stepX) ; x+=stepX) {
				
				var tile = ig.game.terrainManager.getTileAtPosition(x, y);
				//var zoneId = ig.game.terrainManager.getZoneAtPosition(x, y);
				
				
				if (tile && tile.zone == -1) {
				
					var realX = ig.system.getDrawPos(x - ig.game.screen.x - nudgeX) - this.skyLightCanvas.width/2;
					var realY = ig.system.getDrawPos(y - ig.game.screen.y - nudgeY) - this.skyLightCanvas.height/2;
					
					this.darkMaskContext.fillStyle = 'rgba(255,255,255,1)';
					this.darkMaskContext.fillRect(realX, realY, this.skyLightCanvas.width, this.skyLightCanvas.height);
					
				} else if (!tile || tile.tileType == Tile.TYPE.NONE) {
				
					var canvas = this.surfaceLightCanvas;
					
					var realX = ig.system.getDrawPos(x - ig.game.screen.x - nudgeX) - canvas.width/2;
					var realY = ig.system.getDrawPos(y - ig.game.screen.y - nudgeY) - canvas.height/2;
					
					this.darkMaskContext.drawImage(
						canvas,
						0, 0,
						canvas.width, 
						canvas.height,
						realX, 
						realY,
						canvas.width, 
						canvas.height
					);
				}
					
			}
		}
		
	},*/
	
	draw: function() {
		if (!this.enabled) { return; }
		
		// Composite on main canvas
		
		ig.system.context.save();
		ig.system.context.globalCompositeOperation = 'multiply';
		
		ig.system.context.drawImage(
			this.darkMaskCanvas,
			0, 0,
			this.darkMaskCanvas.width, this.darkMaskCanvas.height,
			0, 0,
			ig.system.realWidth, ig.system.realHeight
		);
		
		ig.system.context.restore();
	},
	
	createPlayerLight: function() {
		
		// Create canvas
		this.playerLightCanvas = ig.$new('canvas');
		this.playerLightContext = this.playerLightCanvas.getContext('2d');
		this.playerLightContext.globalCompositeOperation = 'lighten';
		
		// Dimension
		this.playerLightCanvas.width = this.playerLightRadius * 2;
		this.playerLightCanvas.height = this.playerLightRadius * 2;
		
		// Clear
		this.playerLightContext.fillStyle = 'rgba(0,0,0,0)';
		this.playerLightContext.fillRect(0, 0, this.playerLightCanvas.width, this.playerLightCanvas.height);
		
		var center = {
			x: this.playerLightCanvas.width / 2,
			y: this.playerLightCanvas.height / 2,
		};
		
		// Colors
		var gradClr1 = 'rgba(255,255,255,1)';
		var gradClr2 = 'rgba(255,255,255,1)';
		var gradClr3 = 'rgba(255,255,255,0)';
		
		// Gradient
		this.playerGradient = this.playerLightContext.createRadialGradient(
			center.x, center.y, 
			0, 
			center.x, center.y, 
			this.playerLightRadius
		);
		this.playerGradient.addColorStop(0, gradClr1);
		this.playerGradient.addColorStop(0.3, gradClr2);
		this.playerGradient.addColorStop(1, gradClr3);
		
		// Draw
		this.playerLightContext.fillStyle = this.playerGradient;
		this.playerLightContext.beginPath();
		this.playerLightContext.arc(center.x, center.y, this.playerLightRadius, 0, 2 * Math.PI);
		this.playerLightContext.fill();
		
	},
	
	createSurfaceLight: function() {
		
		// Create canvas
		this.surfaceLightCanvas = ig.$new('canvas');
		this.surfaceLightContext = this.surfaceLightCanvas.getContext('2d');
		this.surfaceLightContext.globalCompositeOperation = 'lighten';
		
		// Dimension
		this.surfaceLightCanvas.width = this.surfaceLightRadius * 2;
		this.surfaceLightCanvas.height = this.surfaceLightRadius * 2;
		
		// Clear
		this.surfaceLightContext.fillStyle = 'rgba(0,0,0,0)';
		this.surfaceLightContext.fillRect(0, 0, this.surfaceLightCanvas.width, this.surfaceLightCanvas.height);
		
		var center = {
			x: this.surfaceLightCanvas.width / 2,
			y: this.surfaceLightCanvas.height / 2,
		};
		
		// Colors
		var gradClr1 = 'rgba(255,255,255,1)';
		//var gradClr2 = 'rgba(255,255,255,0.5)';
		var gradClr3 = 'rgba(255,255,255,0)';
		
		// Gradient
		this.tileGradient = this.surfaceLightContext.createRadialGradient(
			center.x, center.y, 
			0, 
			center.x, center.y, 
			this.surfaceLightRadius
		);
		this.tileGradient.addColorStop(0, gradClr1);
		//this.tileGradient.addColorStop(0.4, gradClr2);
		this.tileGradient.addColorStop(1, gradClr3);
		
		// Draw
		this.surfaceLightContext.fillStyle = this.tileGradient;
		this.surfaceLightContext.beginPath();
		this.surfaceLightContext.arc(center.x, center.y, this.surfaceLightRadius, 0, 2 * Math.PI);
		this.surfaceLightContext.fill();
		
	},
	
	// Returns a pseudo-brightness for a terrain tile
	//  0  = completely unlit (no mask, no terrain tile)
	//  1  = at least partially lit (draws terrain tile)
	//  -2 = completely lit (draws white rect)
	//  -1 = lit with gradient (will light other tiles)
	computeTileBrightness: function(tx, ty) {
		
		var brightness = 0;
		var tilesize = ig.game.terrainManager.tilesize;
		var tile = ig.game.terrainManager.getTileAtIndex(tx, ty);
		
		// Sky always full brightness
		if (tile && tile.zone == -1) { return -2; }
		
		// Sky
		var txRepeat = ig.game.terrainManager.repeatGlobalTx(tx);
		var surfaceDepth = ig.game.terrainManager.zoneDepths[0][txRepeat];
		var distToSky = ty - surfaceDepth;
		
		if (distToSky == 0) {
			return -1;
		} else if (distToSky < Math.floor(this.surfaceLightRadius / tilesize) + 3) {
			return 1;
		}
		
		// Player
		var x = tx * tilesize + tilesize/2;
		var y = ty * tilesize + tilesize/2;
		var distToPlayer = Math.sqrt(Math.pow(ig.game.player.center.x - x, 2) + Math.pow(ig.game.player.center.y - y, 2));
		
		if (distToPlayer < this.playerLightRadius + tilesize) {
			return 1;
		}
		
		// Other sources
		for (var s=0 ; s<this.sources.length ; s++) {
			var source = this.sources[s];
			
			switch (source.type) {
			case Lighting.TYPE.POINT:
				var dist = Math.sqrt(Math.pow(source.pos.x - x, 2) + Math.pow(source.pos.y - y, 2));
				if (dist <= source.radius / ig.system.scale + tilesize) {
					return 1;
				}
				break;
			}
			
			if (brightness != 0) { break; }
		}
		
		return brightness;
	},
	
	addSource: function(src) {
		this.sources.push(src);
		
	},
	
	removeSource: function(src) {
		for (var s=this.sources.length-1 ; s>=0 ; s--) {
			if (this.sources[s] == src) {
				this.sources.splice(s, 1);
				break;
			}
		}
	}
	
});

Lighting.TYPE = {
	SPOT: 0,
	CONE: 1,
	POINT: 2
};

});