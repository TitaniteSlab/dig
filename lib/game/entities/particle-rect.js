ig.module(
	'game.entities.particle-rect'
)
.requires(
	'game.entities.base-entity',
	
	'impact.entity-pool'
)
.defines(function() {

EntityParticleRect = BaseEntity.extend({

	// Impact variables
	size: {x: 2, y: 2},
	vel: {x: 50, y: 50},
	
	collides: ig.Entity.COLLIDES.NEVER,
	gravityFactor: 0.5,
	zIndex: 12,
	
	// Game variables
	alpha: 1.0,
	fillStyle: '#4b2d00',
	timeToDie: 0.5,
	killTimer: null,
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.pos.x -= this.size.x/2;
		this.pos.y -= this.size.y/2;
		
		this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
		this.vel.y = -Math.abs(Math.random() * this.vel.y);
		
		this.killTimer = new ig.Timer(this.timeToDie);
	},
	
	reset: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.vel.x = (Math.random() * 2 - 1) * this.vel.x;
		this.vel.y = -Math.abs(Math.random() * this.vel.y);
		
		this.killTimer = new ig.Timer(this.timeToDie);
	},
	
	update: function() {
		this.last.x = this.pos.x;
		this.last.y = this.pos.y;
		this.vel.y += ig.game.gravity * ig.system.tick * this.gravityFactor;
		
		this.vel.x = this.getNewVelocity( this.vel.x, this.accel.x, this.friction.x, this.maxVel.x );
		this.vel.y = this.getNewVelocity( this.vel.y, this.accel.y, this.friction.y, this.maxVel.y );
		
		// movement
		this.pos.x += this.vel.x * ig.system.tick;
		this.pos.y += this.vel.y * ig.system.tick;
		
		this.alpha = this.killTimer.delta().map(-this.timeToDie, 0.3, 1, 0);
		
		if (this.killTimer.delta() > 0) {
			this.kill();
		}
	},
	
	draw: function() {
	
		var ctx = ig.system.context;
		//ctx.save();
		var tempAlpha = ctx.globalAlpha;
		
		ctx.globalAlpha = this.alpha;
		ctx.fillStyle = this.fillStyle;
		
		ctx.fillRect(
			ig.system.getDrawPos(this.pos.x - ig.game.screen.x),
			ig.system.getDrawPos(this.pos.y - ig.game.screen.y),
			this.size.x * ig.system.scale,
			this.size.y * ig.system.scale
		);
		
		ctx.globalAlpha = tempAlpha;
		//ctx.restore();
		
	}
	
});

});