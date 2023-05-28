ig.module(
	'game.entities.cloud'
)
.requires(
	'game.entities.base-screen-fixed'
)
.defines(function() {

EntityCloud = EntityBaseScreenFixed.extend({
	
	// Impact variables
	animSheet: new ig.AnimationSheet('media/clouds1.png', 96, 48),
	size: {x: 96, y: 48},
	
	// Game variables
	tileOffset: 0,
	numTiles: 9,
	zIndex: 2,
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.tileOffset = terra.randInt(this.numTiles - 1);
		var anim = this.addAnim('idle', 1, [this.tileOffset]);
		anim.flip.x = Math.random() > 0.5;
		
		this.screenPos.y = Math.random().map(0, 1, 48, ig.system.height / 2);	// top half of screen
		this.screenPos.x = Math.random().map(0, 1, -this.size.x, ig.system.width + this.size.x);
		
		this.vel.x = Math.random().map(0, 1, -3, 3);
	},
	
	update: function() {
		this.parent();
	},
	
	draw: function() {
		this.parent();
	}

});

});