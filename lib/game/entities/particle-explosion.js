ig.module(
	'game.entities.particle-explosion'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function() {

EntityParticleExplosion = ig.Entity.extend({

	// Impact variables
	animSheet: new ig.AnimationSheet('media/explode1.png', 20, 20),
	size: {x: 20, y: 20},
	flip: false,
	
	collides: ig.Entity.COLLIDES.NEVER,
	maxVel: {x: 0, y: 0},
	gravityFactor: 0,
	zIndex: 12,
	
	// Game variables
	//duration: 0.8,
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		var anim = this.addAnim('idle', 0.06, [0,1]);
		anim.stop = true;
		anim.alpha = 0.6;
		anim.flip.x = Math.random() > 0.5;
		anim.flip.y = Math.random() > 0.5;
	},
	
	reset: function() {
		this.parent(x, y, settings);
	},
	
	update: function() {
		this.parent();
		
		if (this.currentAnim.loopCount > 0) {
			this.kill();
		}
	}
	
});

});