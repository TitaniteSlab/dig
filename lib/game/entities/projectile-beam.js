ig.module(
	'game.entities.projectile-beam'
)
.requires(
	'impact.entity',
	'terra.stretchable-animation'
)
.defines(function() {

EntityProjectileBeam = ig.Entity.extend({

	// Impact variables
	segmentAnimSheet: new ig.StretchableAnimationSheet('media/beams1.png', 1, 16),
	capsAnimSheet: new ig.AnimationSheet('media/beamends1.png', 4, 16),
	size: {x: 4, y: 16},
	flip: false,
	zIndex: 13,
	
	collides: ig.Entity.COLLIDES.NEVER,
	maxVel: {x: 0, y: 0},
	gravityFactor: 0,
	
	// Game variables
	def: null,
	angle: 0,
	beamWidth: 16,
	capLength: 4,
	
	init: function(x, y, beamDef) {
		this.parent(x, y, beamDef);
		
		this.def = beamDef;
		this.angle = beamDef.angle0;
		
		this.startAnim = new ig.Animation(this.capsAnimSheet, 1, [0]);
		this.startAnim.angle = this.def.angle0;
		this.startAnim.pivot = {x: 0, y: this.beamWidth/2};
		
		this.segmentAnim = new ig.StretchableAnimation(this.segmentAnimSheet, 1, [0]);
		this.segmentAnim.angle = this.def.angle0;
		this.segmentAnim.pivot = {x: 0, y: this.beamWidth/2};
		
		this.endAnim = new ig.Animation(this.capsAnimSheet, 1, [1]);
		this.endAnim.angle = this.def.angle0;
		this.endAnim.pivot = {x: 0, y: this.beamWidth/2};
	},
	
	/*reset: function() {
		this.parent(x, y, settings);
		
	},*/
	
	update: function() {
		//this.parent();
		//this.currentAnim.angle = this.angle;
		this.startAnim.angle = this.angle;
		this.segmentAnim.angle = this.angle;
		this.endAnim.angle = this.angle;
	},
	
	draw: function() {
		
		ig.system.context.webkitImageSmoothingEnabled = true;
		ig.system.context.mozImageSmoothingEnabled = true;
		
		// Start cap anim
		var startPos = {
			x: this.pos.x - this.offset.x - ig.game._rscreen.x,
			y: this.pos.y - this.offset.y - ig.game._rscreen.y
		};
		this.startAnim.draw(
			startPos.x,
			startPos.y
		);
		
		// Center segment draw position
		var segmentPos = {
			x: startPos.x + (this.capLength - 1) * Math.cos(this.angle),
			y: startPos.y + (this.capLength - 1) * Math.sin(this.angle)
		}
		
		// Determine segment length by tracing to the collision map
		var segmentLength = 9999;
		var tracePos;
		var v = 4000;
		var vx = v * Math.cos(this.angle);
		var vy = v * Math.sin(this.angle);
		if (this.flip) {
			tracePos = {
				x: ig.game._rscreen.x + segmentPos.x + this.beamWidth/2 * Math.sin(this.angle + Math.PI),
				y: ig.game._rscreen.y + segmentPos.y + this.beamWidth/2 * Math.cos(this.angle + Math.PI)
			};
		} else {
			tracePos = {
				x: ig.game._rscreen.x + segmentPos.x + this.beamWidth/2 * Math.sin(this.angle),
				y: ig.game._rscreen.y + segmentPos.y + this.beamWidth/2 * Math.cos(this.angle)
			};
		}
		
		// Trace
		var trace = ig.game.collisionMap.trace(
			tracePos.x, 
			tracePos.y, 
			vx, vy, 
			1, 1,
			true
		);
		
		if (trace.collision.x || trace.collision.y || res.collision.slope) {
			var dx = trace.pos.x - tracePos.x;
			var dy = trace.pos.y - tracePos.y;
			segmentLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
		}
		
		// Draw center segment
		this.segmentAnim.draw(
			segmentPos.x,
			segmentPos.y,
			segmentLength,
			this.beamWidth
		);
		
		// Draw end cap
		this.endAnim.draw(
			startPos.x + (this.capLength + segmentLength - 2) * Math.cos(this.angle),
			startPos.y + (this.capLength + segmentLength - 2) * Math.sin(this.angle)
		);
		
		ig.system.context.webkitImageSmoothingEnabled = false;
		ig.system.context.mozImageSmoothingEnabled = false;
		
	}
	
});

});