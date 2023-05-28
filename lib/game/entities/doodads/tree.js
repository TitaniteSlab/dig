ig.module(
	'game.entities.doodads.tree'
)
.requires(
	'game.entities.doodads.doodad'
)
.defines(function() {

EntityDoodadTree = EntityDoodad.extend({

	animSheet: new ig.AnimationSheet('media/trees.png', 104, 120),
	size: {
		x: 104,
		y: 120
	},
	posOffset: {
		x: -104/2,
		y: -120+2
	},
	zIndex: 1
	
});

});