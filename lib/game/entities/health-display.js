ig.module(
	'game.entities.health-display'
)
.requires(
	'impact.entity',
	'impact.entity-pool'
)
.defines(function() {

EntityHealthDisplay = ig.Entity.extend({
	
	health: 999999999,
	curHealth: 100,
	maxHealth: 100,
	
	//curHeight: 0,
	//curColor: '#3aeb68',
	color: '#db2b2b',
	outerColor: '#b2b2b2',
	alpha: 0.7,
	margin: 1,		// Not scaled
	
	// Impact variables
	animSheet: null,
	size: {x: 14, y: 2},
	collides: ig.Entity.COLLIDES.NEVER,
	flip: false,
	gravityFactor: 0,
	zIndex: 13,
	
	// Game variables
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
	},
	
	reset: function(x, y, settings) {
		this.parent(x, y, settings);
		this.curHealth = this.maxHealth;
	},
	
	update: function() {
		this.parent();
	},
	
	draw: function() {
		// Only draw if less than full ammo
		if (this.curHealth == this.maxHealth) { return; }
		
		var ctx = ig.system.context;
		//ctx.save();
		
		var tmpAlpha = ctx.globalAlpha;
		
		ctx.globalAlpha = this.alpha;
		ctx.fillStyle = this.outerColor;
		
		// Outer rect
		var drawPos = {
			x: ig.system.getDrawPos(this.pos.x - ig.game.screen.x),
			y: ig.system.getDrawPos(this.pos.y - ig.game.screen.y)
		};
		
		ctx.fillRect(drawPos.x, drawPos.y, this.size.x * ig.system.scale, this.size.y * ig.system.scale);
		
		// Inner rect
		ctx.fillStyle = this.color;
		
		drawPos = {
			x: ig.system.getDrawPos(this.pos.x - ig.game.screen.x) + this.margin,
			y: ig.system.getDrawPos(this.pos.y - ig.game.screen.y) + this.margin
		};
		var maxWidth = this.size.x;
		var width = (this.curHealth / this.maxHealth) * maxWidth;
		
		ctx.fillRect(drawPos.x, drawPos.y, (width * ig.system.scale) - 2*this.margin, (this.size.y * ig.system.scale) - 2*this.margin);
		
		//ctx.restore();
		ctx.globalAlpha = tmpAlpha;
	}

});


});