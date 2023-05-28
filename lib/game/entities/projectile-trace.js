ig.module(
	'game.entities.projectile-trace'
)
.requires(
	'impact.entity',
	'terra.stretchable-animation'
)
.defines(function() {

// Remember this class is only asthetic; collisions, damage, etc is handled in weapon-trace
EntityProjectileTrace = ig.Entity.extend({

	// Impact variables
	animSheet: new ig.StretchableAnimationSheet('media/traces1.png', 1, 1),
	size: {x: 1, y: 1},
	flip: false,
	zIndex: 13,
	
	collides: ig.Entity.COLLIDES.NEVER,
	maxVel: {x: 0, y: 0},
	gravityFactor: 0,
	
	// Game variables
	angle: 0,
	length: 1,
	
	init: function(x, y, def) {
		this.parent(x, y, def);
		
		this.angle = def.angle;
		this.length = def.length;
		
		var anim = new ig.StretchableAnimation(this.animSheet, 0.13, [0,1,2]);
		anim.angle = this.angle;
		anim.stop = true;
		this.currentAnim = anim;
	},
	
	/*reset: function() {
		this.parent(x, y, settings);
		
	},*/
	
	update: function() {
		this.parent();
		
		if (this.currentAnim.loopCount > 0) {
			this.kill();
		}
	},
	
	draw: function() {
		
		if (this.currentAnim) {
			this.currentAnim.draw(
				this.pos.x - this.offset.x  - ig.game._rscreen.x,
				this.pos.y - this.offset.y - ig.game._rscreen.y,
				this.length,
				1
			);
		}
		
	}
	
});

});