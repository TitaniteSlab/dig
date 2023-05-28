ig.module(
	'game.entities.ship-thruster'
)
.requires(
	'impact.entity'
)
.defines(function() {

EntityShipThruster = ig.Entity.extend({
	
	health: 999999999,
	
	// Impact variables
	animSheet: new ig.AnimationSheet('media/ship_thrust_down.png', 32, 20),
	size: {x: 32, y: 20},
	collides: ig.Entity.COLLIDES.NEVER,
	flip: false,
	gravityFactor: 0,
	zIndex: 2,
	doTrace: false,
	
	// Game variables
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.addAnim('idle', 0.2, [0,2,1,2,0,1,3,1,2,3]);
	},
	
	update: function() {
		this.parent();
	},
	
	// Indestructable
	kill: function() {}

});


});