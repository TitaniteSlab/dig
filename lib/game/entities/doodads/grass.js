ig.module(
	'game.entities.doodads.grass'
)
.requires(
	'game.entities.doodads.doodad'
)
.defines(function() {

EntityDoodadGrass = EntityDoodad.extend({

	// Impact variables
	animSheet: new ig.AnimationSheet('media/grasses.png', 8, 8),
	size: {
		x: 8,
		y: 8
	},
	posOffset: {
		x: -8/2,
		y: -3
	},
	zIndex: 4,
	
	kill: function() {
		this.killNow();
	}
	
});

});