ig.module(
	'game.entities.enemies.enemy-surface-launcher'
)
.requires(
	'impact.entity-pool',
	
	'game.entities.enemies.base-enemy',
	'game.entities.enemies.enemy-projectile-homing'
)
.defines(function() {

EntityEnemySurfaceLauncher = EntityBaseEnemy.extend({

	updateBehaviors: [
		AI.AggroPlayer(220), 
		AI.AggroAttack(),
		AI.LoadedBlockLifetime()
	],
	
	hurtBehaviors: [
		AI.SpawnParticles('#7dcb3e', 2, {x: 2, y: 2})
	],
	
	killBehaviors: [
		AI.SpawnParticles('#7dcb3e', 6, {x: 2, y: 2}),
		AI.SpawnScrap(10)
	],
	
	// Impact variables
	health: 200,
	maxHealth: 200,
	
	animSheet: new ig.AnimationSheet('media/enemy_surface_large_earth.png', 36, 36),
	size: {x: 24, y: 30},
	offset: {x: 6, y: 3},
	tileOffset: 0,
	
	collides: ig.Entity.COLLIDES.FIXED,
	maxVel: {x: 0, y: 100},
	bounciness: 0.0,
	gravityFactor: 0,
	doTrace: false,
	zIndex: 10,
	
	deathSound: new ig.Sound('sounds/squirt.mp3'),
	
	// Game variables
	enemyType: EntityBaseEnemy.TYPE.TILE_EDGE,
	tiles: [],
	posOffset: {x: -15-2, y: -24},
	projectileOffset: {x: 11, y: -4},
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.pos.x = this.pos.x + this.posOffset.x;
		this.pos.y = this.pos.y + this.posOffset.y;
		
		this.atkTimer = new ig.Timer();
		this.dmgTimer = new ig.Timer();
		//this.jumpTimer = new ig.Timer();
		
		this.addAnim('idle', 0.5, [this.tileOffset, this.tileOffset+1]);		// Two idle frames
		this.anims.idle.flip = Math.random() > 0.5;
		this.addAnim('attack', 0.14, [this.tileOffset+2,this.tileOffset+3, this.tileOffset]);		// Two attack frames, returning to idle
		this.anims.attack.flip = Math.random() > 0.5;
		this.anims.attack.stop = true;
		
		// Get tile and set indestructable
		var tm = ig.game.terrainManager;
		var tx = this.blockIndex.x * tm.blockTileWidth + this.blockTileIndex.x;
		var ty = this.blockIndex.y * tm.blockTileHeight + this.blockTileIndex.y;
		this.tiles.push(ig.game.terrainManager.getTileAtIndex(tx, ty));
		this.tiles.push(ig.game.terrainManager.getTileAtIndex(tx-1, ty));
		this.setTilesDestructable(false);
	},
	
	ready: function() {
		this.parent(x, y, settings);
		
		this.pos.x = this.pos.x + this.posOffset.x;
		this.pos.y = this.pos.y + this.posOffset.y;
		
	},
	
	update: function() {
		this.parent();
		
		if (this.currentAnim == this.anims.attack && this.currentAnim.loopCount > 0) {
			this.currentAnim = this.anims.idle;
		}
	},
	
	attack: function() {
		if (this.attackTimer.delta() > 0) {
			this.attackTimer.set(this.attackCooldown);
		
			this.currentAnim = this.anims.attack.rewind();
			
			var x = this.pos.x + this.projectileOffset.x;
			var y = this.pos.y + this.projectileOffset.y;
			var projectile = ig.game.spawnEntity('EntityEnemyProjectileHoming', x, y, {
				damage: this.damage
			});
		}
	},
	
	killNow: function() {
		this.parent();
		this.setTilesDestructable(true);
	},
	
	setTilesDestructable: function(destructable) {
		for (var t=0 ; t<this.tiles.length ; t++) {
			var tile = this.tiles[t];
			if (tile) {
				tile.indestructable = !destructable;
			}
		}
	}
	
});

});