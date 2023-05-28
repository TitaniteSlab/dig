ig.module(
	'game.entities.throwables.flare'
)
.requires(
	'game.entities.throwables.base-throwable',
	'game.lighting'
)
.defines(function() {

EntityFlare = EntityBaseThrowable.extend({

	updateBehaviors: [
		AI.PlayerDistanceLifetime(2000),
		AI.TemporalLifetime(60)
	],

	// Impact variables
	friction: {x: 60, y: 60},
	bounciness: 0.4,
	maxVel: {x: 180, y: 180},
	
	collides: ig.Entity.COLLIDES.PASSIVE,
	gravityFactor: 1,
	
	// Game variables
	lightRadius: 60,
	light: null,
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.light = {
			type: Lighting.TYPE.POINT,
			pos: {
				x: this.center.x,
				y: this.center.y
			},
			radius: this.lightRadius,
			flicker: 10		// Hard-coded flicker amount
		};
		ig.game.lighting.addSource(this.light);
	},
	
	reset: function(x, y, settings) {
		this.parent(x, y, settings);
	},
	
	update: function() {
		this.parent();
		
		this.rotation += this.rotationTimer.tick() * this.rotationSpeed;
		this.currentAnim.angle = this.flip ? -this.rotation : this.rotation;
		
		this.light.pos.x = this.center.x;
		this.light.pos.y = this.center.y;
	},
	
	handleMovementTrace: function(res) {
		this.parent(res);
		
		// Dampen rotation
		if (res.collision.x || res.collision.y) {
			this.rotationSpeed *= 0.7;
		}
	},
	
	kill: function() {
		this.parent();
		ig.game.lighting.removeSource(this.light);
	}
	
});


});