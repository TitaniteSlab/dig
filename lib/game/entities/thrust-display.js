ig.module(
	'game.entities.thrust-display'
)
.requires(
	'impact.entity'
)
.defines(function() {

EntityThrustDisplay = ig.Entity.extend({
	
	health: 999999999,
	curThrust: 100,
	maxThrust: 100,
	
	//curHeight: 0,
	//curColor: '#3aeb68',
	color: '#3aeb68',
	rechargeColor: '#ebd63a',
	outerColor: '#b2b2b2',
	margin: 0,
	
	rechargeTime: 1,
	rechargeTimer: null,
	
	// Impact variables
	animSheet: null,
	size: {x: 2, y: 16},
	posOffset: {x: -12, y: -5},
	collides: ig.Entity.COLLIDES.NEVER,
	flip: false,
	gravityFactor: 0,
	zIndex: 13,
	
	// Game variables
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.rechargeTimer = new ig.Timer();
	},
	
	setThrust: function(amt) {
		this.curThrust = amt;
	},
	
	update: function() {
		this.parent();
		
		var player = ig.game.player;
		if (player) {
			this.updateFromPlayer(player);
		};
	},
	
	updateFromPlayer: function(player) {
		this.pos.x = player.pos.x + this.posOffset.x;
		this.pos.y = player.pos.y + this.posOffset.y;
	},
	
	draw: function() {
		// Only draw if less than full ammo
		if (this.curThrust == this.maxThrust) { return; }
		
		var ctx = ig.system.context;
		ctx.save();
		
		// Outer rect
		var drawPos = {
			x: ig.system.getDrawPos(this.pos.x - ig.game.screen.x),
			y: ig.system.getDrawPos(this.pos.y - ig.game.screen.y)
		};
		
		ctx.fillStyle = this.outerColor;
		ctx.fillRect(drawPos.x, drawPos.y, this.size.x * ig.system.scale, this.size.y * ig.system.scale);
		
		// Inner rect
		var maxHeight = this.size.y - 2*this.margin;
		var height = (this.curThrust / this.maxThrust) * maxHeight;
		drawPos = {
			x: ig.system.getDrawPos(this.pos.x - ig.game.screen.x + this.margin),
			y: ig.system.getDrawPos(this.pos.y - ig.game.screen.y + this.margin + (maxHeight - height))
		};
		
		ctx.fillStyle = this.color;
		ctx.fillRect(drawPos.x, drawPos.y, (this.size.x - 2*this.margin) * ig.system.scale, height * ig.system.scale);
		
		ctx.restore();
	},
	
	// Indestructable
	kill: function() {}

});


});