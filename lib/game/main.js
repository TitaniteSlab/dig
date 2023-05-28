ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',
	'impact.background-map',
	
	'game.terrain-manager',
	'game.enemy-manager',
	'game.lighting',
	'game.climate',
	
	'game.level-defs',
	'game.sky-defs',
	'game.sun-defs',
	'game.weapon-defs',
	
	'game.entities.sun',
	'game.entities.cloud',
	'game.entities.player-mech',
	'game.entities.ship',
	
	'terra.ui.progress-bar',
	'terra.ui.segment-bar',
	'terra.ui.tooltip',
	'game.ui.hotbar',
	'game.ui.resource-display',
	'game.ui.weapon-display',
	'game.ui.weapon-chooser',
	'game.ui.escape-menu',
	'game.ui.armory',
	'game.ui.inventory',
	
	'jquery',		// take this out...?
	
	'perlin'
)
.defines(function(){

GameMain = ig.Game.extend({
	
	staticInstantiate: function() {
		
	},
	
	//
	// Impact State
	//
	font: new ig.Font('media/04b03.font.png'),
	clearColor: '#a9d8ee',
	gravity: 320,
	backgroundEntities: [],		// mod
	doodadEntities: [],		// mod
	_deferredDoodadKill: [],	// mod
	sortBy: ig.Game.SORT.Z_INDEX,
	doodadSortBy: ig.Game.SORT.POS_Y,
	autoSort: true,
	
	
	//
	// Game State
	//
	seed: 3775674,
	levelLoaded: false,
	
	tooltip: null,
	
	inventory: null,
	terrainManager: null,
	lighting: null,
	climate: null,
	
	collisionMap: null,
	terrainTilesetName: 'media/terrain1.png',
	
	skyBackgroundMaps: [],
	skyTileHeight: 280,
	//skyZones: SkyDefs.Cliffs,
	
	//sunData: SunDefs.YellowSun,
	
	level: null,
	
	ship: null,
	player: null,
	
	// UI
	hotbar: null,
	healthBar: null,
	resourceDisplay: null,
	weaponDisplays: {},
	escapeMenu: null,
	
	quitCallback: null,
	
	//
	// Constructor
	//
	init: function() {
		// Input Events
		ig.input.bind(ig.KEY.MOUSE1, 'click1');
		ig.input.bind(ig.KEY.MOUSE2, 'click2');
		ig.input.bind(ig.KEY.SPACE, 'thrust');
		ig.input.bind(ig.KEY.D, 'right');
		ig.input.bind(ig.KEY.A, 'left');
		ig.input.bind(ig.KEY.ESC, 'escape');
		
		noise.seed(this.seed);
		
		// Lighting
		this.lighting = new Lighting();
		
		// FPS display
		this.fps = document.getElementById('fps');
		this.fps2 = document.getElementById('fps2');
		this.timePrev = new Date().getTime();
		this.timePrev2 = new Date().getTime();
		this.fpsInterval = 20;
		this.i = 0;
		this.i2 = 0;
		
		// HUD
		//this.hotbar = new Hotbar('#hotbar');
		this.healthBarWrapper = $('.healthBarWrapper');		// Change this...
		this.healthBar = new terra.ui.ProgressBar('#healthBar');
		this.shieldBar = new terra.ui.SegmentBar('#shieldBar');
		this.resourceDisplay = new ResourceDisplay('#resourceDisplay');
		
		this.weaponChooser = new WeaponChooser('#weaponChooser');
		this.weaponDisplays.top = new WeaponDisplay('#weapon1Display');
		this.weaponDisplays.bottom = new WeaponDisplay('#weapon2Display');
		
		this.escapeMenu = new EscapeMenu('#escapeMenu');
		
		this.armory = new Armory('#armory');
		
		this.tooltip = new terra.ui.Tooltip();
	},
	
	showHUD: function(show) {
		show = show == undefined ? true : show;		// Default show
		
		//this.weaponChooser.show(show);
		this.weaponDisplays.top.show(show);
		this.weaponDisplays.bottom.show(show);
		//this.hotbar.show(show);
		this.inventory.show(show);
		this.resourceDisplay.show(show);
		//this.armory.show(show);
		
		// Change this...
		if (show) {
			this.healthBarWrapper.show();
		} else {
			this.healthBarWrapper.hide();
		}
	},
	
	loadLevel: function(levelId) {
	
		this.level = LevelDefs[levelId];
		
		this.screen = {x: 0, y: 0};
		
		// Create BackgroundMaps
		this.backgroundMaps = [];
		
		// Sky background maps
		this.skyBackgroundMaps = [];
		for(var s = 0 ; s < this.level.sky.length ; s++) {
			var skyData = this.level.sky[s];
			
			var skyMap = new ig.BackgroundMap(skyData.tileSize, skyData.tileData, skyData.tilesetName);
			skyMap.offset = {x: 0, y: 400 + s*320};
			skyMap.anims = {};
			skyMap.repeat = true;
			skyMap.distance = 3 - s*0.5;
			skyMap.foreground = false;
			skyMap.preRender = false;
			skyMap.name = 'Sky' + s;
			
			this.backgroundMaps.push(skyMap);
			this.skyBackgroundMaps.push(skyMap);
		}
		
		// Terrain
		LevelMainResources = [new ig.Image(this.terrainTilesetName)];
		
		this.terrainManager = new TerrainManager(this.level.terrain);
		//this.backgroundMaps.push(this.terrainManager);
		
		this.inventory = new Inventory('#inventory');
		
		// Reset entities
		this.entities = [];
		this.doodadEntities = [];
		this.namedEntities = {};
		this.backgroundEntities = [];
		
		// Create sun
		this.spawnBackgroundEntity(
			'EntitySun', 
			0, 
			0, 
			this.level.sun
		);
		
		// Climate
		this.climate = new Climate();
		
		// Spawn Ship
		this.spawnShip();
		
		// Spawn player
		this.spawnPlayer();
		
		// Enemy spawn manager/director
		this.enemyManager = new EnemyManager();
		
		// Spawn some test entities
		//this.spawnTestEntities();
		
		// Call post-init ready function on all entities
		for(var i = 0; i < this.entities.length; i++) {
			this.entities[i].ready(this);
		}
		
		noise.seed(this.seed);
		this.levelLoaded = true;
		this.showHUD();
	},
	
	quitGame: function() {
		if (this.levelLoaded) {
			this.destroyLevel();
		}
		if (this.quitCallback) {
			this.quitCallback();
		}
	},
	
	destroyLevel: function() {
	
		this.entities = [];
		this.doodadEntities = [];
		this.namedEntities = {};
		this.backgroundEntities = [];
		
		this.skyBackgroundMaps = [];
		this.backgroundMaps = [];
		
		this.terrainManager = undefined;
		this.enemyManager = undefined;
		this.lighting = undefined;
		this.climate = undefined;
		
		
		this.screen = {x: 0, y: 0};
		
		this.showHUD(false);
		
		ig.system.clear('rgba(0,0,0,0)');
		
		this.levelLoaded = false;
	},
	
	spawnShip: function() {
		var stx = this.terrainManager.tileWidth / 4;
		var sx = stx * this.terrainManager.tilesize
		var sy = (this.terrainManager.zoneDepths[0][stx] - 40) * this.terrainManager.tilesize;
		this.ship = this.spawnEntity(
			'EntityShip', 
			sx, 
			sy, 
			{}
		);
		
	},
	
	spawnPlayer: function() {
		
		this.player = this.spawnEntity(
			'EntityPlayerMech', 
			this.ship.pos.x + this.ship.playerSpawnOffset.x, 
			this.ship.pos.y + this.ship.playerSpawnOffset.y, 
			{}
		);
		
		// Testing weapons
		this.inventory.addWeapon('Shotgun');
		this.player.setWeapon('Shotgun');
		//this.inventory.addWeapon('RocketLauncher');
		//this.player.setWeapon('RocketLauncher');
	},
	
	spawnTestEntities: function() {
		// Test spawn enemy
		for(var b = 0; b < 4; b++) {
			this.spawnEntity(
				'EntityEnemyBird',
				this.player.pos.x + (2*Math.random()-1) * 200,
				this.player.pos.y - Math.random() * 100
			);
		}
		for(var b = 0; b < 4; b++) {
			this.spawnEntity(
				'EntityEnemyPteroBird',
				this.player.pos.x + (2*Math.random()-1) * 200,
				this.player.pos.y - Math.random() * 100
			);
		}
		/*for(var b = 0; b < 4; b++) {
			this.spawnEntity(
				'EntityEnemyBigBlob',
				this.player.pos.x + (2*Math.random()-1) * 200,
				this.player.pos.y + (2*Math.random()-1) * 200
			);
		}
		for(var b = 0; b < 4; b++) {
			this.spawnEntity(
				'EntityEnemyBlob',
				this.player.pos.x + (2*Math.random()-1) * 100,
				this.player.pos.y + (2*Math.random()-1) * 100
			);
		}*/
		for(var b = 0; b < 10; b++) {
			this.spawnEntity(
				'EntityEnemyBlueBlob',
				this.player.pos.x + (2*Math.random()-1) * 100,
				this.player.pos.y + (2*Math.random()-1) * 100
			);
		}
		/*for(var b = 0; b < 4; b++) {
			this.spawnEntity(
				'EntityEnemyYellowBlob',
				this.player.pos.x + (2*Math.random()-1) * 100,
				this.player.pos.y + (2*Math.random()-1) * 100
			);
		}*/
	},
	
	update: function() {
		if (!this.levelLoaded) {
			return;
		}
		
		this.parent();		// Updates entities, including player position
		
		// Move screen to player or spawn if not present
		if (this.player && !this.player._killed) {
			this.screen.x = this.player.pos.x - ig.system.width / 2 + this.player.size.x / 2;
			this.screen.y = this.player.pos.y - ig.system.height / 2 + this.player.size.y / 2;
		} else {
			this.spawnPlayer();
		}
		
		this.updateBackgroundEntities();
		this.updateDoodadEntities();
		
		// remove all killed entities
		for( var i = 0; i < this._deferredKill.length; i++ ) {
			this._deferredKill[i].erase();
			this.entities.erase( this._deferredKill[i] );
		}
		this._deferredKill = [];
		
		// remove all killed doodad entities
		for( var i = 0; i < this._deferredDoodadKill.length; i++ ) {
			this._deferredDoodadKill[i].erase();
			this.doodadEntities.erase( this._deferredDoodadKill[i] );
		}
		this._deferredDoodadKill = [];
		
		// sort entities?
		if( this._doSortEntities || this.autoSort ) {
			this.sortEntities();
			this._doSortEntities = false;
		}
		
		// update background animations
		for( var tileset in this.backgroundAnims ) {
			var anims = this.backgroundAnims[tileset];
			for( var a in anims ) {
				anims[a].update();
			}
		}
		
		// Update terrain tiles
		this.terrainManager.update();
		//this.progression.update();
		
		// Update enemies
		this.enemyManager.update();
		
		// Update inventory
		this.inventory.update();
		
		// Do lighting
		this.lighting.update();
		
		// Toggle escape menu
		if (ig.input.pressed('escape')) {
			this.escapeMenu.toggleShow();
		}
		
		// FPS (update)
		if (this.i % this.fpsInterval == 0) {
			var timeNow = new Date().getTime();
			var spf = (timeNow - this.timePrev) / this.fpsInterval / 1000;
			this.fps.innerHTML = 'update: ' + (1/spf).toFixed(0);
			this.timePrev = timeNow;
		}
		this.i++;
		
	},
	
	draw: function() {
		if (!this.levelLoaded) {
			return;
		}
		
	
		if (this.clearColor) {
			ig.system.clear( this.clearColor );
		}
		
		// This is a bit of a circle jerk. Entities reference game._rscreen 
		// instead of game.screen when drawing themselfs in order to be 
		// "synchronized" to the rounded(?) screen position
		this._rscreen.x = ig.system.getDrawPos(this.screen.x)/ig.system.scale;
		this._rscreen.y = ig.system.getDrawPos(this.screen.y)/ig.system.scale;
		
		this.drawBackgroundEntities();
		
		var mapIndex;
		for( mapIndex = 0; mapIndex < this.backgroundMaps.length; mapIndex++ ) {
			var map = this.backgroundMaps[mapIndex];
			if( map.foreground ) {
				// All foreground layers are drawn after the entities
				break;
			}
			map.setScreenPos( this.screen.x, this.screen.y );
			map.draw();
		}
		
		this.terrainManager.drawBackground();
		
		this.drawDoodadEntities();
		
		this.terrainManager.draw();
		
		this.drawForegroundDoodadEntities();
		
		this.drawEntities();
		
		
		for( mapIndex; mapIndex < this.backgroundMaps.length; mapIndex++ ) {
			var map = this.backgroundMaps[mapIndex];
			if (map.foreground) {
				map.setScreenPos( this.screen.x, this.screen.y );
				map.draw();
			}
		}
		
		this.lighting.draw();
		
		// FPS (draw)
		if (this.i2 % this.fpsInterval == 0) {
			var timeNow = new Date().getTime();
			var spf = (timeNow - this.timePrev2) / this.fpsInterval / 1000;
			this.fps2.innerHTML = 'draw: ' + (1/spf).toFixed(0);
			this.timePrev2 = timeNow;
		}
		this.i2++;
		
	},
	
	// Initial lighting routine; replace by Lighting
	drawLightingMaskOld: function() {
	
		var tilesize = this.terrainManager.tilesize;
		
		var mod = 5;
		
		var xStart = this.screen.x - tilesize*mod*2;
		var yStart = this.screen.y - tilesize*mod*2;
		var xEnd = this.screen.x + ig.system.width + tilesize*mod*2;
		var yEnd = this.screen.y + ig.system.height + tilesize*mod*2;
		
		var radius = 160;
		var innerRadius = 0;
		var outerRadius = radius;
		
		var ctx = ig.system.context;
		ctx.save();
		
		
		// Create temp canvas
		/*var cvs = ig.$new('canvas');
		cvs.width = ig.system.realWidth;
		cvs.height = ig.system.realHeight;
		var tmpCtx = cvs.getContext('2d');
		tmpCtx.globalCompositeOperation = 'hard-light';
		
		tmpCtx.fillStyle = 'rgba(255,255,255,0.0)';
		tmpCtx.fillRect(0,0,cvs.width,cvs.height);*/
		
		// Darken temp canvas
		for (var y=yStart ; y<=yEnd ; y+=tilesize*mod) {
			y = Math.floor(y / tilesize / mod) * tilesize * mod;
			
			for (var x=xStart ; x<=xEnd ; x+=tilesize*mod) {
				x = Math.floor(x / tilesize / mod) * tilesize * mod;
				
				var zone = this.terrainManager.getZoneAtPosition(x, y);
				if (zone < 0) {continue;}
				var zoneAbove = this.terrainManager.getZoneAtPosition(x, y-10*tilesize);
				if (zoneAbove < 0) { continue; }
				
				var worldPos = {
					x: x + tilesize / 2,
					y: y + tilesize / 2
				};
				var drawPos = {
					x: ig.system.getDrawPos(worldPos.x - this.screen.x),
					y: ig.system.getDrawPos(worldPos.y - this.screen.y)
				};
				var gradient = ctx.createRadialGradient(drawPos.x, drawPos.y, innerRadius, drawPos.x, drawPos.y, outerRadius);
				
				// Distance to player
				var scale = 0.8;
				if (this.player) {
					var pPos = {
						x: this.player.pos.x + this.player.size.x/2,
						y: this.player.pos.y + this.player.size.y/2
					};
					var dist = Math.sqrt(Math.pow(worldPos.x - pPos.x, 2) + Math.pow(worldPos.y - pPos.y, 2));
					if (dist < 120) { continue; }
					if (dist < 300) { scale *= dist / 300; }
				}
				
				gradient.addColorStop(0, 'rgba(0,0,0,' + scale + ')');
				//gradient.addColorStop(0.2, 'rgba(0,0,0,0.7)');
				gradient.addColorStop(1, 'rgba(0,0,0,0.0)');
				
				ctx.beginPath();
				ctx.arc(drawPos.x, drawPos.y, radius, 0, 2 * Math.PI);
				ctx.fillStyle = gradient;
				ctx.fill();
			}
		}
		
		// Copy temp canvas to main canvas
		//ctx.globalCompositeOperation = 'source-over';
		//ctx.drawImage(cvs, 0, 0);
		
		// Brighten player
		/*var player = this.getEntitiesByType(EntityPlayerMech)[0];
		if (player && player.curZone > 0) {
			ctx.globalCompositeOperation = 'soft-light';
			var drawPos = {
				x: ig.system.getDrawPos(player.pos.x + player.size.x / 2 - this.screen.x),
				y: ig.system.getDrawPos(player.pos.y + player.size.y / 2 - this.screen.y)
			};
			radius = 150;
			outerRadius = radius;
			var gradient = ig.system.context.createRadialGradient(drawPos.x, drawPos.y, innerRadius, drawPos.x, drawPos.y, outerRadius);
			gradient.addColorStop(0, 'rgba(255,255,255,0.7)');
			gradient.addColorStop(0.4, 'rgba(255,255,255,0.7)');
			gradient.addColorStop(1, 'rgba(255,255,255,0.0)');
			
			
			ctx.beginPath();
			ctx.arc(drawPos.x, drawPos.y, radius, 0, 2 * Math.PI);
			ctx.fillStyle = gradient;
			ctx.fill();
			ctx.fill();
		}*/
		
		ctx.restore();
	},
	
	// Background entities (sun, moon, clouds, etc)
	drawBackgroundEntities: function() {
		for( var i = 0; i < this.backgroundEntities.length; i++ ) {
			this.backgroundEntities[i].draw();
		}
	},
	
	spawnBackgroundEntity: function( type, x, y, settings ) {
		var entityClass = typeof(type) === 'string'
			? ig.global[type]
			: type;
			
		if( !entityClass ) {
			throw("Can't spawn background entity of type " + type);
		}
		var ent = new (entityClass)( x, y, settings || {} );
		this.backgroundEntities.push( ent );
		return ent;
	},
	
	updateBackgroundEntities: function() {
		for( var i = 0; i < this.backgroundEntities.length; i++ ) {
			this.backgroundEntities[i].update();
		}
	},
	
	// Doodad entities (trees, bushes, terrain background stuff)
	drawDoodadEntities: function() {
		for( var i = 0; i < this.doodadEntities.length; i++ ) {
			var ent = this.doodadEntities[i];
			if (!ent.foreground) {
				ent.draw();
			}
		}
	},
	
	// Foreground Doodad entities (weeds, ore)
	drawForegroundDoodadEntities: function() {
		for( var i = 0; i < this.doodadEntities.length; i++ ) {
			var ent = this.doodadEntities[i];
			if (ent.foreground) {
				ent.draw();
			}
		}
	},
	
	spawnDoodadEntity: function( type, x, y, settings ) {
		var entityClass = typeof(type) === 'string'
			? ig.global[type]
			: type;
			
		if( !entityClass ) {
			throw("Can't spawn doodad entity of type " + type);
		}
		var ent = new (entityClass)( x, y, settings || {} );
		this.doodadEntities.push( ent );
		return ent;
	},
	
	removeDoodadEntity: function( ent ) {
		ent._killed = true;
		ent.type = ig.Entity.TYPE.NONE;
		ent.checkAgainst = ig.Entity.TYPE.NONE;
		ent.collides = ig.Entity.COLLIDES.NEVER;
		this._deferredDoodadKill.push( ent );
	},
	
	// Finds all *doodad* entities matching type and (local) block/tile indices
	// Doodads are always attached to a tile so the conditions are naive here
	findDoodadEntities: function(bx, by, btx, bty) {
		var ents = [];
		for( var d = 0; d < this.doodadEntities.length; d++ ) {
			var ent = this.doodadEntities[d];
			if (
				ent.blockIndex.x == bx && ent.blockIndex.y == by && 
				ent.blockTileIndex.x == btx && ent.blockTileIndex.y == bty && 
				!ent._killed
			) {
				ents.push(ent);
			}
		}
		return ents;
	},
	
	// Finds all regular entities matching type and (local) block/tile indices
	// Not all regular entities are attached to a tile
	findTileEntities: function(type, bx, by, btx, bty) {
		var entityClass = typeof(type) === 'string'
			? ig.global[type]
			: type;
		var ents = [];
		for( var d = 0; d < this.entities.length; d++ ) {
			var ent = this.entities[d];
			if (
				ent instanceof entityClass && 
				ent.blockIndex && ent.blockIndex.x == bx && ent.blockIndex.y == by && 
				ent.blockTileIndex && ent.blockTileIndex.x == btx && ent.blockTileIndex.y == bty && 
				!ent._killed
			) {
				ents.push(ent);
			}
		}
		return ents;
	},
	
	findEnemyEntities: function() {
		var enemies = [];
		for (var e=0 ; e<this.entities.length ; e++) {
			var ent = this.entities[e];
			if (ent.enemy) {
				enemies.push(ent);
			}
		}
		return enemies;
	},
	
	updateDoodadEntities: function() {
		for( var d = 0; d < this.doodadEntities.length; d++ ) {
			this.doodadEntities[d].update();
		}
	},
	
	// Regular entities (player, enemies, particles, etc)
	updateEntities: function() {
		for( var i = 0; i < this.entities.length; i++ ) {
			var ent = this.entities[i];
			if( !ent._killed ) {
				ent.update();
			}
		}
	},
	
	// use ig.system.resize instead
	setResolution: function(x, y) {
		ig.system.width = Math.floor(x / ig.system.scale);
		ig.system.height = Math.floor(y / ig.system.scale);
		ig.system.realWidth = x;
		ig.system.realHeight = y;
		
		ig.system.canvas.width = x;
		ig.system.canvas.height = y;
	}
});

	

});
