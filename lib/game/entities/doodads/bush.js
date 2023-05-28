ig.module(
	'game.entities.doodads.bush'
)
.requires(
	'game.entities.doodads.doodad'
)
.defines(function() {

EntityDoodadBush = EntityDoodad.extend({

	animSheet: new ig.AnimationSheet('media/bushes.png', 24, 24),
	size: {
		x: 24,
		y: 24
	},
	posOffset: {
		x: -24/2,
		y: -22
	},
	zIndex: 2
	
});

});