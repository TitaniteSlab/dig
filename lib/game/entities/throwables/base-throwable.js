ig.module(
	'game.entities.throwables.base-throwable'
)
.requires(
	'game.entities.ai-entity',
	'game.ai',
	'impact.entity-pool'
)
.defines(function() {

EntityBaseThrowable = AIEntity.extend({

	updateBehaviors: [
		AI.PlayerDistanceLifetime(1500),
		AI.TemporalLifetime(10)
	],

	// Impact variables
	animSheet: new ig.AnimationSheet('media/throwables.png', 16, 16),
	size: {x: 8, y: 8},
	offset: {x: 4, y: 4},
	friction: {x: 60, y: 60},
	bounciness: 0.5,
	maxVel: {x: 180, y: 180},
	
	collides: ig.Entity.COLLIDES.PASSIVE,
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.B,
	gravityFactor: 1,
	zIndex: 10,
	doTrace: true,
	
	// Game variables
	tileOffset: 0,
	vel0: 280,
	angle0: 0,
	rotation: 0,
	rotationSpeed: 4 * Math.PI,		// Radians per second
	flip: false,
	sticky: false,
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		var anim = this.addAnim('idle', 0.14, [this.tileOffset, this.tileOffset+1, this.tileOffset+2]);
		anim.flip.x = this.flip;
		
		this.centerify();
		
		this.vel = {
			x: this.vel0 * Math.cos(this.angle0),
			y: this.vel0 * Math.sin(this.angle0)
		};
		
		this.rotation = Math.random(0, 1, 0, 2 * Math.PI);
		this.rotationTimer = new ig.Timer();
	},
	
	reset: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.centerify();
		
		this.vel = {
			x: this.vel0 * Math.cos(this.angle0),
			y: this.vel0 * Math.sin(this.angle0)
		};
		
		this.rotation = Math.random(0, 1, 0, 2 * Math.PI);
		this.rotationTimer = new ig.Timer();
	},
	
	update: function() {
		this.parent();
		
		this.rotation += this.rotationTimer.tick() * this.rotationSpeed;
		
		this.currentAnim.angle = this.flip ? -this.rotation : this.rotation;
	},
	
	handleMovementTrace: function(res) {
		this.parent(res);
		
		// Dampen rotation
		if (this.doTrace && (res.collision.x || res.collision.y)) {
			if (this.sticky) {
				this.stick();
			} else {
				this.rotationSpeed *= 0.9;
			}
		}
	},
	
	check: function(entity) {
		if (this.sticky) {
			this.stick();
		}
	},
	
	stick: function() {
		this.vel = { x: 0, y: 0 };
		this.accel = { x: 0, y: 0 };
		this.rotationSpeed = 0;
		this.gravityFactor = 0;
		this.doTrace = false;
		this.collides = ig.Entity.COLLIDES.NEVER;
	},
	
	kill: function() {
		this.parent();
	}
	
});


});