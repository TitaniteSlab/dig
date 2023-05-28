ig.module(
	'game.tile'
)
.requires(
	
)
.defines(function() {

Tile = {
	
	TYPE: {
		NONE: 0,
		HARD: 1,
		TERRAIN: 2
	},
	
	EDGE: {
		CENTER: 0,
		TOP_LEFT: 3,
		TOP: 4,
		TOP_RIGHT: 5,
		LEFT: 6,
		RIGHT: 7,
		BOTTOM_LEFT: 8,
		BOTTOM: 9,
		BOTTOM_RIGHT: 10,
		LEFT_RIGHT: 11,
		TOP_BOTTOM: 12,
		TRIPLE_TOP: 13,
		TRIPLE_LEFT: 14,
		TRIPLE_RIGHT: 15,
		TRIPLE_BOTTOM: 16,
		ALL: 17
	},
	
	BACKGROUND: {
		NONE: 0,
		SOLID: 1,
		PRERENDER: 2
	},
	
	EDGE_COLLISION: {}
	
};

Tile.EDGE_COLLISION[Tile.EDGE.TOP_LEFT] = 2;
Tile.EDGE_COLLISION[Tile.EDGE.BOTTOM_LEFT] = 13;
Tile.EDGE_COLLISION[Tile.EDGE.TOP_RIGHT] = 24;
Tile.EDGE_COLLISION[Tile.EDGE.BOTTOM_RIGHT] = 35;


});