ig.module(
	'game.entities.doodads.shrub'
)
.requires(
	'game.entities.doodads.doodad'
)
.defines(function() {

EntityDoodadShrub = EntityDoodad.extend({

	// Impact variables
	animSheet: new ig.AnimationSheet('media/shrubs.png', 16, 16),
	size: {
		x: 16,
		y: 16
	},
	posOffset: {
		x: -16/2-4,
		y: -16+1
	},
	zIndex: 3
	
});

});