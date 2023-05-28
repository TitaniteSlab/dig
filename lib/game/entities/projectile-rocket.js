ig.module(
	'game.entities.projectile-rocket'
)
.requires(
	'game.entities.base-entity',
	'game.entities.ai-entity',
	'game.ai',
	'impact.entity-pool',
	'impact.timer',
	'game.entities.particle-circle-cluster'
)
.defines(function() {

EntityProjectileRocket = AIEntity.extend({
	
	updateBehaviors: [
		AI.PlayerDistanceLifetime(1000)
	],
	
	// Impact variables
	animSheet: new ig.AnimationSheet('media/rockets1.png', 12, 6),
	size: {x: 6, y: 3},
	offset: {x: 3, y: 1.5},
	flip: false,
	zIndex: 13,
	
	collides: ig.Entity.COLLIDES.PASSIVE,
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.B,
	maxVel: {x: 9999, y: 9999},
	gravityFactor: 0.05,
	
	// Game variables
	def: null,
	wobbleTimer: new ig.Timer(),
	
	light: null,
	
	init: function(x, y, projDef) {
		this.parent(x, y, projDef);
		
		//this.pos.x -= this.size.x/2;
		
		this.vel = {
			x: this.vel0 * Math.cos(this.angle0),
			y: this.vel0 * Math.sin(this.angle0)
		};
		
		var anim = this.addAnim('motion', 0.01, [this.tileOffset, this.tileOffset+1]);
		anim.pivot = {
			x: this.size.x / 2,
			y: this.size.y / 2
		};
		
		
		this.light = {
			type: Lighting.TYPE.POINT,
			pos: {
				x: this.center.x,
				y: this.center.y
			},
			radius: 30,
			flicker: 8
		};
		ig.game.lighting.addSource(this.light);
		
	},
	
	reset: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.vel = {
			x: this.vel0 * Math.cos(this.angle0),
			y: this.vel0 * Math.sin(this.angle0)
		};
	},
	
	update: function() {
		this.parent();
		
		// wobble the rocket
		if (Math.round(this.wobbleTimer.delta()*1000) % this.wobbleFrequency == 0) {
			var angle = Math.atan2(this.vel.y, this.vel.x);
			var vel = Math.sqrt(Math.pow(this.vel.x, 2) + Math.pow(this.vel.y, 2));
			var wobble = (Math.random() * 2 - 1) * this.wobbleAngle;
			if (Math.abs(this.angle0 - (angle + wobble)) < this.maxWobbleAngle) {
				angle += wobble;
			} else {
				angle -= wobble/2;
			}
			this.vel.x = vel * Math.cos(angle);
			this.vel.y = vel * Math.sin(angle);
		}
		
		if( this.currentAnim ) {
			this.currentAnim.angle = Math.atan2(this.vel.y, this.vel.x); 	// Rotate animation with Entity
		}
		
		this.light.pos.x = this.center.x;
		this.light.pos.y = this.center.y;
		
	},
	
	handleMovementTrace: function(res) {
		if (res.collision.x || res.collision.y || res.collision.slope) {
			
			this.center = {
				x: this.center.x + this.vel.x * ig.system.tick,
				y: this.center.y + this.vel.y * ig.system.tick
			};
			
			// Damage *all* entities in explosion radius
			var colEntities = BaseEntity.collideRadial(this, this.explosionRadius);
			for (var e=0 ; e<colEntities.length ; e++) {
				colEntities[e].receiveDamage(this.damage);
			}
			
			// Damage terrain
			ig.game.terrainManager.damageTilePattern(this.center.x, this.center.y, this.terrainDamageData);
			
			this.kill();
		}
		
		this.parent(res);
	},
	
	// Initial check triggers explosion, which then checks all enemies in explosionRadius
	check: function(entity) {
		
		// Damage *all* entities in explosion radius
		var colEntities = BaseEntity.collideRadial(this, this.explosionRadius);
		for (var e=0 ; e<colEntities.length ; e++) {
			colEntities[e].receiveDamage(this.damage);
		}
		
		// Damage terrain
		ig.game.terrainManager.damageTilePattern(this.center.x, this.center.y, this.terrainDamageData);
		
		this.kill();
	},
	
	kill: function() {
		this.parent();
		var explosion = ig.game.spawnEntity('EntityParticleCircleCluster', this.center.x, this.center.y, {});
	},
	
	killNow: function() {
		this.parent();
		ig.game.lighting.removeSource(this.light);
	}
});

});