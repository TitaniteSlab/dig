ig.module(
	'game.entities.projectile-trace-line'
)
.requires(
	'game.entities.base-entity',
	
	'impact.entity-pool'
)
.defines(function() {

// Remember this class is only asthetic; collisions, damage, etc is handled in weapon-trace
EntityProjectileTraceLine = BaseEntity.extend({

	// Impact variables
	zIndex: 13,
	
	collides: ig.Entity.COLLIDES.NEVER,
	maxVel: {x: 0, y: 0},
	gravityFactor: 0,
	
	// Game variables
	pos: {x: 0, y: 0},
	endPos: {x: 0, y: 0},
	angle: 0,
	length: 1,
	lineWidth: 1,		// This is not scaled!
	duration: 0.3,
	startAlpha: 0.5,
	endAlpha: 0.1,
	color: '#444',
	
	timer: null,
	
	init: function(x, y, def) {
		this.parent(x, y, def);
		
		this.timer = new ig.Timer(this.duration);
		
		this.endPos = {
			x: this.pos.x + this.length * Math.cos(this.angle),
			y: this.pos.y + this.length * Math.sin(this.angle)
		};
	},
	
	reset: function() {
		this.parent(x, y, settings);
	},
	
	update: function() {
		this.parent();
		
		if (this.timer.delta() > 0) {
			this.kill();
		}
	},
	
	draw: function() {
		
		var ctx = ig.system.context;
		var tmpAlpha = ctx.globalAlpha;
		
		ctx.strokeStyle = this.color;
		ctx.globalAlpha = this.timer.delta().map(-this.duration, 0, this.startAlpha, this.endAlpha);
		ctx.lineWidth = this.lineWidth;
		
		ctx.beginPath();
		ctx.moveTo(
			ig.system.getDrawPos(this.pos.x - ig.game.screen.x),
			ig.system.getDrawPos(this.pos.y - ig.game.screen.y)
		);
		ctx.lineTo(
			ig.system.getDrawPos(this.endPos.x - ig.game.screen.x),
			ig.system.getDrawPos(this.endPos.y - ig.game.screen.y)
		);
		ctx.stroke();
		
		ctx.globalAlpha = tmpAlpha;
	}
	
});

});