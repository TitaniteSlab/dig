ig.module(
	'game.entities.doodads.weed'
)
.requires(
	'game.entities.doodads.doodad'
)
.defines(function() {

EntityDoodadWeed = EntityDoodad.extend({

	// Impact variables
	animSheet: new ig.AnimationSheet('media/weeds.png', 8, 8),
	size: {
		x: 8,
		y: 8
	},
	posOffset: {
		x: -8/2,
		y: -8+1
	},
	zIndex: 4,
	
	kill: function() {
		this.killNow();
	}
	
});

});