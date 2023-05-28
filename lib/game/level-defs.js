ig.module( 
	'game.level-defs' 
)
.requires(
	'game.zone-defs',
	'game.sun-defs',
	'game.sky-defs',
	'game.enemy-defs',
	
	'game.entities.ore'
)
.defines(function(){

LevelDefs = {
	
	Terran: {
		name: 'Terran',
		sky: SkyDefs.Cliffs,
		sun: SunDefs.YellowSun,
		enemies: {
			TILE_EDGE: ['PlantBubbler'],
			WALKER: ['SmallBlob', 'BigBlob'],
			FLYER: ['BlackBird', 'PteroBird'],
			TERRAIN: []
		},
		terrain: {
			terrainTilesetName: 'media/tilesets/earth_fg.png',
			terrainBackgroundTilesetName: 'media/tilesets/earth_bg.png',
			zones: [
				ZoneDefs.Dirt,
				ZoneDefs.Purple
			],
			hardParticleStyle: '#4c4c4c',
			hardDensityFactor: 2,		// Multiplier for hard tile health
			hardNoiseData: {
				low: 0.31, 
				high: 1.0, 
				octaves: 4,
				amplitude: 1,
				frequency: 120,
				smoothing: 'cubic'
			},
			oreData: {
				//smallThreshold: 0.62,
				mediumThreshold: 0.67,
				largeThreshold: 0.7, 
				
				octaves: 3,
				amplitude: 1,
				frequency: 200,
				smoothing: 'quintic'
			},
			specialOreType: EntityOre.TYPE.PLATINUM,
			specialOreData: {
				tileOffset: 8,
				
				//smallThreshold: 0.62,
				mediumThreshold: 0.67,
				largeThreshold: 0.7, 
				
				octaves: 3,
				amplitude: 1,
				frequency: 200,
				smoothing: 'quintic'
			},
			caveNoiseData: {
				low: 0.05, 
				high: 0.32, 
				octaves: 2,
				amplitude: 1,
				frequency: 84,
				smoothing: 'quintic'
			}
		}
	}
	
};
	
});
