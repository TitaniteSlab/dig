ig.module(
	'game.entities.doodads.doodad'
)
.requires(
	'game.entities.ai-entity',
	'game.ai',
	'impact.entity-pool',
	'impact.timer'
)
.defines(function() {

EntityDoodad = AIEntity.extend({
	
	updateBehaviors: [
		AI.LoadedBlockLifetime()
	],
	
	// Impact variables
	animSheet: new ig.AnimationSheet('media/trees.png', 104, 120),
	size: {x: 104, y: 120},
	flip: false,
	zIndex: 1,
	
	type: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER,
	maxVel: {x: 0, y: 60},
	gravityFactor: 0,
	friction: {x: 0, y:0},
	doTrace: false,
	
	// Game variables
	tileOffset: 0,
	killTimer: null,
	timeToDie: 1,
	timeToFade: 0.4,
	killGravityFactor: Math.random().map(0, 1, 0.08, 0.25),
	killSweepAngle: 0,		// Angle to rotate during death
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.pos.x = this.pos.x + this.posOffset.x;
		this.pos.y = this.pos.y + this.posOffset.y;
		
		var anim = this.addAnim('idle', 1, [this.tileOffset]);
		anim.pivot = {
			x: this.size.x/2,
			y: this.size.y
		};
		if (Math.random() > 0.5) {
			anim.flip.x = true
		}
		this.killSweepAngle = (Math.random().map(0, 1, 20, 40)).toRad();
		if (Math.random() > 0.5) {
			this.killSweepAngle = -this.killSweepAngle;
		}
	},
	
	reset: function() {
		this.parent(x, y, settings);
		
		this.killSweepAngle = (Math.random().map(0, 1, 20, 40)).toRad();
		
		this.pos.x = this.pos.x + this.posOffset.x;
		this.pos.y = this.pos.y + this.posOffset.y;
	},
	
	update: function() {
		this.parent();
		
		if (this.killTimer) {
			if (this.killTimer.delta() > 0) {
				this.killNow();
				return;
			}
			//console.log('vel.y: ' + this.vel.y);
			//console.log('delta: ' + this.killTimer.delta());
			if (this.killTimer.delta() > -(this.timeToDie - this.timeToFade)) {
				this.currentAnim.alpha = this.killTimer.delta().map(
					-(this.timeToDie - this.timeToFade), 0,
					1, 0
				);
			}
			//console.log('alpha: ' + this.currentAnim.alpha);
			this.currentAnim.angle = this.killTimer.delta().map(
				-this.timeToDie, 0,
				0, this.killSweepAngle
			);
			//console.log('angle: ' + this.currentAnim.angle);
		}
		
	},
	
	kill: function() {
		this.killTimer = new ig.Timer(this.timeToDie);
		this.gravityFactor = this.killGravityFactor;
	},
	
	killNow: function() {
		ig.game.removeDoodadEntity(this);
	}
	
});

});