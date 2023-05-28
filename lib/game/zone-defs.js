ig.module( 
	'game.zone-defs' 
)
.requires(
	
)
.defines(function(){

// Amplitude in boundary noise data is always normalized to max out at the tileHeight (usually never within 20% of that). So it's pointless to set here.
ZoneDefs = {
	
	Dirt: {
		name: 'Dirt',
		tileHeight: 500,
		tilesetOffset: 59,
		boundaryNoiseData: {
			tileHeight: 140,
			octaves: 2,
			amplitude: 1,
			frequency: 50,
			smoothing: 'cubic'
		},
		particleStyle: '#4b2d00',
		doodads: {
			Tree: {
				density: 0.5,
				tileOffset: 0,
				tileEntropy: 3
			},
			Bush: {
				density: 0.7,
				tileOffset: 0,
				tileEntropy: 13
			},
			Grass: {
				density: 0.9,
				tileOffset: 0,
				tileEntropy: 5
			},
			Shrub: {
				density: 0.3,
				tileOffset: 0,
				tileEntropy: 3
			}
		}
	},
	
	Purple: {
		name: 'Purple',
		tileHeight: 300,
		tilesetOffset: 59*2,
		boundaryNoiseData: {
			tileHeight: 50,
			octaves: 4,
			amplitude: 1,
			frequency: 50,
			smoothing: 'quintic'
		},
		particleStyle: '#495aff',
		doodads: {
			Bush: {
				density: 0.4,
				tileOffset: 0,
				tileEntropy: 13
			},
			Shrub: {
				density: 0.3,
				tileOffset: 0,
				tileEntropy: 5
			}
		}
	}
	
};
	
});
