ig.module(
	'game.entities.projectile-lobbed'
)
.requires(
	'game.entities.base-entity',
	'game.entities.ai-entity',
	'game.entities.particle-circle-cluster',
	'impact.entity-pool',
	'impact.timer'
)
.defines(function() {

EntityProjectileLobbed = AIEntity.extend({

	updateBehaviors: [
		AI.PlayerDistanceLifetime(1000)
	],
	
	// Impact variables
	animSheet: new ig.AnimationSheet('media/projectiles1.png', 7, 7),
	size: {x: 5, y: 5},
	offset: {x: 1, y: 1},
	flip: false,
	zIndex: 13,
	
	collides: ig.Entity.COLLIDES.PASSIVE,
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.B,
	maxVel: {x: 9999, y: 9999},
	gravityFactor: 0,
	
	// Game variables
	killTimer: null,
	
	init: function(x, y, projDef) {
		this.parent(x, y, projDef);
		
		this.centerify();
		
		if (this.timeToDie) {
			this.killTimer = new ig.Timer(this.timeToDie);
		}
		
		this.vel = {
			x: this.vel0 * Math.cos(this.angle0),
			y: this.vel0 * Math.sin(this.angle0)
		};
		
		var anim = this.addAnim('motion', 0.01, [this.tileOffset, this.tileOffset+1]);
	},
	
	reset: function() {
		this.parent(x, y, settings);
		
		this.vel = {
			x: this.vel0 * Math.cos(this.angle0),
			y: this.vel0 * Math.sin(this.angle0)
		};
	},
	
	update: function() {
		this.parent();
		
		if( this.currentAnim ) {
			this.currentAnim.angle = Math.atan2(this.vel.y, this.vel.x); 	// Rotate animation with Entity
		}
		
		if (this.killTimer && this.killTimer.delta() > 0) {
			ig.game.terrainManager.damageTilePattern(this.center.x, this.center.y, this.terrainDamageData);
			
			this.kill();
		}
	},
	
	handleMovementTrace: function(res) {
		if (res.collision.x || res.collision.y || res.collision.slope) {
			
			this.center = {
				x: this.center.x + this.vel.x * ig.system.tick,
				y: this.center.y + this.vel.y * ig.system.tick
			};
			
			// Radial check if explosion radius is defined
			if (this.explosionRadius) {
				var colEntities = BaseEntity.collideRadial(this, this.explosionRadius);
				for (var e=0 ; e<colEntities.length ; e++) {
					colEntities[e].receiveDamage(this.damage);
				}
			}
			
			// Damage terrain
			var globalIndex = ig.game.terrainManager.mapIndexToGlobalIndex(res.tileIndex.x, res.tileIndex.y);
			var tilesize = ig.game.terrainManager.tilesize;
			ig.game.terrainManager.damageTilePattern(globalIndex.x * tilesize, globalIndex.y * tilesize, this.terrainDamageData);
			
			this.kill();
		}
		
		this.parent(res);
	},
	
	// Initial check triggers explosion, which then checks all enemies in explosionRadius
	check: function(entity) {
		
		// Radial check if explosion radius is defined
		if (this.explosionRadius) {
			var colEntities = BaseEntity.collideRadial(this, this.explosionRadius);
			for (var e=0 ; e<colEntities.length ; e++) {
				colEntities[e].receiveDamage(this.damage);
			}
		} else {
			entity.receiveDamage(this.damage);
		}
		
		// Damage terrain
		ig.game.terrainManager.damageTilePattern(this.center.x, this.center.y, this.terrainDamageData);
		
		this.kill();
	},
	
	kill: function() {
		if (this.explosionRadius) {
			var explosion = ig.game.spawnEntity('EntityParticleCircleCluster', this.center.x, this.center.y, {});
		}
		
		this.parent();
	}
	
});

});