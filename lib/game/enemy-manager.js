ig.module(
	'game.enemy-manager'
)
.requires(
	'impact.impact',
	
	'game.enemy-defs',
	
	'game.entities.enemies.base-enemy',
	'game.entities.enemies.enemy-surface-launcher',
	'game.entities.enemies.enemy-flyer',
	'game.entities.enemies.enemy-walker',
	
	'game.tile'
)
.defines(function() {

EnemyManager = ig.Class.extend({
	
	targetEnemyCounts: null,
	
	init: function() {
		
		this.targetEnemyCounts = {};
		this.targetEnemyCounts[EntityBaseEnemy.TYPE.TILE_EDGE] = 5;
		this.targetEnemyCounts[EntityBaseEnemy.TYPE.FLYER] = 6;
		this.targetEnemyCounts[EntityBaseEnemy.TYPE.WALKER] = 8;
		this.targetEnemyCounts[EntityBaseEnemy.TYPE.TERRAIN] = 1;
		
	},
	
	update: function() {
		
		var entities = ig.game.entities;
		
		//console.log('num entities: ' + entities.length);
		
		// Get enemy entities
		//var enemies = ig.game.findEnemyEntities();
		var typedEnemies = this.binEnemiesByType();
		//console.log(typedEnemies);
		
		for (var type in typedEnemies) {
			//debugger;
			var enemies = typedEnemies[type];
			if (!enemies || enemies.length >= this.targetEnemyCounts[type]) {
				//console.log('skipping type ' + type);
				continue;
			}
			//console.log(type);
			//debugger;
			switch (type) {
			case EntityBaseEnemy.TYPE.TILE_EDGE:
				var spawned = this.spawnTileEdgeEnemy();
				break;
			case EntityBaseEnemy.TYPE.FLYER:
				var spawned = this.spawnFlyerEnemy();
				break;
			case EntityBaseEnemy.TYPE.WALKER:
				var spawned = this.spawnWalkerEnemy();
				break;
			}
			
			/*if (!spawned) {
				console.log('type ' + type + ' spawn failed');
			}*/
		}
	},
	
	// Attempts to spawn a walker enemy. Returns false if failed.
	// Rules:
	//  - off screen
	//  - within loaded blocks
	//  - Empty tile
	//  - Max height above surface if top zone
	spawnWalkerEnemy: function() {
		//console.log('attempting walker spawn');
		
		// Get possible position rectangle
		var rect = ig.game.terrainManager.loadedRect;
		if (!rect) { return false; }
		
		// Try a random position between top of loaded rect and player
		var pos = {
			x: Math.random().map(0, 1, rect.x, rect.x + rect.w),
			y: Math.random().map(0, 1, rect.y, rect.y + rect.h)
		};
		
		// Max height above surface
		var zoneAtPos = ig.game.terrainManager.getZoneAtPosition(pos.x, pos.y);
		if (zoneAtPos == -1) {
			var tileIndex = ig.game.terrainManager.getTileIndexAtPosition(pos.x, pos.y);
			var surfaceDepth = ig.game.terrainManager.zoneDepths[0][tileIndex.tx];
			if ((surfaceDepth - tileIndex.ty) > 20) {
				return false;
			}
		}
		
		// Position must be an empty tile
		var tile = ig.game.terrainManager.getTileAtPosition(pos.x, pos.y);
		if (tile && tile.tileType != Tile.TYPE.NONE) { 
			console.log('spawn tile occupied at ' + pos.x + ',' + pos.y + ' with type ' + tile.tileType);
			return false;
		}
		
		// Position must be off-screen
		if (
			pos.x >= ig.game.screen.x && pos.x <= ig.game.screen.x + ig.system.width &&
			pos.y >= ig.game.screen.y && pos.y <= ig.game.screen.y + ig.system.height
		) {
			//console.log('spawn pos on-screen');
			return false;
		}
		
		// Spawn!
		//console.log('Spawning flyer enemy at ' + pos.x + ', ' + pos.y);
		var enemyId = ig.game.level.enemies.WALKER.random();
		var enemyDef = EnemyDefs[enemyId];
		
		var enemy = ig.game.spawnEntity(enemyDef.entityClass, pos.x, pos.y, enemyDef);
		enemy.centerify();
		
		return true;
	},
	
	// Attempts to spawn a flyer enemy in the sky zone. Returns false if failed.
	// Rules:
	//  - off screen
	//  - within loaded blocks
	//  - Empty tile
	spawnFlyerEnemy: function() {
		//console.log('attempting flyer spawn');
		
		var player = ig.game.player;
		var zone = ig.game.terrainManager.getZoneAtPosition(player.center.x, player.center.y);
		
		// Player is too deep
		if (zone >= 1) { console.log('player zone too deep'); return false; }
		
		// Get possible position rectangle
		var rect = ig.game.terrainManager.loadedRect;
		if (!rect) { return false; }
		
		// Try a random position between top of loaded rect and player
		var pos = {
			x: Math.random().map(0, 1, rect.x, rect.x + rect.w),
			y: Math.random().map(0, 1, rect.y, player.pos.y)
		};
		
		// Position must be in the top two zones
		var zoneAtPos = ig.game.terrainManager.getZoneAtPosition(pos.x, pos.y);
		if (zoneAtPos >= 0) { /*console.log('spawn zone too deep');*/ return false; }
		
		// Position must be an empty tile
		var tile = ig.game.terrainManager.getTileAtPosition(pos.x, pos.y);
		if (tile && tile.tileType != Tile.TYPE.NONE) { 
			console.log('spawn tile occupied at ' + pos.x + ',' + pos.y + ' with type ' + tile.tileType);
			return false;
		}
		
		// Position must be off-screen
		if (
			pos.x >= ig.game.screen.x && pos.x <= ig.game.screen.x + ig.system.width &&
			pos.y >= ig.game.screen.y && pos.y <= ig.game.screen.y + ig.system.height
		) {
			//console.log('spawn pos on-screen');
			return false;
		}
		
		// Spawn!
		//console.log('Spawning flyer enemy at ' + pos.x + ', ' + pos.y);
		var enemyId = ig.game.level.enemies.FLYER.random();
		var enemyDef = EnemyDefs[enemyId];
		
		var enemy = ig.game.spawnEntity(enemyDef.entityClass, pos.x, pos.y, enemyDef);
		enemy.centerify();
		
		return true;
	},
	
	// Attempts to spawn a tile edge enemy in the loaded blocks. Returns false if failed.
	spawnTileEdgeEnemy: function() {
		//console.log('attempting tile edge spawn');
		var tm = ig.game.terrainManager;
		
		var loadedBlocks = tm.loadedBlocks;
		if (!loadedBlocks || loadedBlocks.length == 0) { return false; }
		
		// Pick a random block
		var block = loadedBlocks.random();
		
		// Player is in block (quick way to prevent player from seeing spawns; changed to only spawn off-screen, below)
		/*if (
			block.globalIndex.x == tm.curGlobalBlockIndex.x && 
			block.globalIndex.y == tm.curGlobalBlockIndex.y
		) {
			return;
		}*/
		
		// No edge spawns in block
		if (block.edgeSpawns.length == 0) { return false; }
		
		// Pick a random edge spawn point
		var spawnPoint = block.edgeSpawns.random();
	
		// Compute real position
		var tx = (spawnPoint.blockTileIndex.x + block.globalIndex.x*tm.blockTileWidth);
		var ty = (spawnPoint.blockTileIndex.y + block.globalIndex.y*tm.blockTileHeight);
		var x = tx * tm.tilesize + tm.tilesize/2;
		var y = ty * tm.tilesize;
		
		// Make sure the tile is still there
		var tile = tm.getTileAtIndex(tx, ty);
		if (!tile || tile.tileType == Tile.TYPE.NONE) { return false; }
		
		// Check if this spot is already taken
		var existing = this.findTileEnemies(
			block.globalIndex.x, 
			block.globalIndex.y, 
			spawnPoint.blockTileIndex.x, 
			spawnPoint.blockTileIndex.y
		);
		if (existing.length > 0) { return false; }
			
		// Don't spawn if on-screen
		if (
			x >= ig.game.screen.x && x <= ig.game.screen.x + ig.system.width &&
			y >= ig.game.screen.y && y <= ig.game.screen.y + ig.system.height
		) {
			return false;
		}
		
		// Valid spawn; otherwise we just try again next update to prevent clogging here
		console.log('spawning surface launcher at ' + x + ',' + y);
		
		var enemyId = ig.game.level.enemies.TILE_EDGE.random();
		var enemyDef = EnemyDefs[enemyId];
		enemyDef.blockIndex = block.globalIndex;
		enemyDef.blockTileIndex = spawnPoint.blockTileIndex;
		
		var enemy = ig.game.spawnEntity(enemyDef.entityClass, x, y, enemyDef);
		
		return true;
	},
	
	// Arranges a single enemies list into a map of type -> list
	binEnemiesByType: function(enemies) {
		enemies = enemies || ig.game.findEnemyEntities();
		
		var binned = {};
		for (var t in EntityBaseEnemy.TYPE) {
			binned[EntityBaseEnemy.TYPE[t]] = [];
		}
		
		for (var e=0 ; e<enemies.length ; e++) {
			var enemy = enemies[e];
			var bin = binned[enemy.enemyType];
			if (!bin) {
				binned[enemy.enemyType] = bin = [];
			}
			bin.push(enemy);
		}
		
		return binned;
	},
	
	// Finds enemies occupying the specified block tile
	findTileEnemies: function(bx, by, btx, bty) {
		var ents = [];
		for( var d = 0; d < ig.game.entities.length; d++ ) {
			var ent = ig.game.entities[d];
			if (
				ent.enemy && 
				ent.blockIndex && 
				ent.blockIndex.x == bx && ent.blockIndex.y == by && 
				ent.blockTileIndex.x == btx && ent.blockTileIndex.y == bty && 
				!ent._killed
			) {
				ents.push(ent);
			}
		}
		return ents;
	},
	
	getAllTileEnemies: function() {}
	
});

});