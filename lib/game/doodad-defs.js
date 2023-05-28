ig.module( 
	'game.doodad-defs' 
)
.requires(
	
)
.defines(function(){

DoodadDefs = {
	
	// 3x3 Very large top tile surface features
	Tree: {
		className: 'EntityDoodadTree',
		size: {
			x: 104,
			y: 120
		},
		posOffset: {
			x: 0,
			y: 2
		}
	},
	
	// 3x3 on top tiles
	Bush: {
		className: 'EntityDoodadBush',
		size: {
			x: 24,
			y: 24
		},
		posOffset: {
			x: 0,
			y: 2
		}
	},
	
	// 2x2 on top tiles
	Shrub: {
		className: 'EntityDoodadShrub',
		size: {
			x: 16,
			y: 16
		},
		posOffset: {
			x: 0,
			y: 2
		}
	},
	
	// 1x1 on top tiles
	Weed: {
		className: 'EntityDoodadWeed',
		size: {
			x: 8,
			y: 8
		},
		posOffset: {
			x: 0,
			y: 5
		}
	},
	
	// 1x3 on bottom tiles
	Vine: {
		className: 'EntityDoodadWeed',
		size: {
			x: 8,
			y: 16
		},
		posOffset: {
			x: 0,
			y: 14
		}
	}
	
};
	
});
