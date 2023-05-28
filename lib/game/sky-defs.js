ig.module( 
	'game.sky-defs' 
)
.requires(
	
)
.defines(function(){

// Perhaps rename - they're lists of BackgroundMap data for background layers
SkyDefs = {
	
	Cliffs: [{
		tileSize: 512,
		//tileOffset: 0,
		tilesetName: 'media/background2.png',
		tileData:  [[0,0],
					[1,2]]/*,
					[3,3],
					[3,3],
					[3,3]]*/
	},{
		tileSize: 512,
		//tileOffset: 0,
		tilesetName: 'media/background3.png',
		tileData:  [[0,0],
					[1,2]]/*,
					[4,4,4],
					[4,4,4],
					[4,4,4]]*/
	}/*,{
		tileSize: 512,
		//tileOffset: 0,
		tilesetName: 'media/background3.png',
		tileData: [[0,0,0],[1,2,3],[4,4,4],[4,4,4],[4,4,4]]
	},{
		tileSize: 512,
		//tileOffset: 0,
		tilesetName: 'media/background4.png',
		tileData: [[0,0],[1,2,3],[4,4],[4,4],[4,4]]
	}*/]
	
};
	
});
