ig.module( 
	'game.enemy-defs' 
)
.requires(
	
)
.defines(function(){

EnemyDefs = {
	
	//
	// Tile Edge
	//
	PlantBubbler: {
		name: 'Plant Spitter',
		entityClass: 'EntityEnemySurfaceLauncher',
		tilesetName: 'media/enemy_surface_large_earth.png', 
		tileSize: {x: 36, y: 36},
		tileOffset: 0,
		size: {x: 24, y: 30},
		offset: {x: 6, y: 3},
	
		maxHealth: 120,
		damage: 20,
		attackCooldown: 2
	},
	
	//
	// Flyers
	//
	BlackBird: {
		name: 'Dark Bird',
		entityClass: 'EntityEnemyFlyer',
		tilesetName: 'media/enemy_bird.png', 
		tileSize: {x: 30, y: 30},
		tileOffset: 0,
		size: {x: 20, y: 20},
		offset: {x: 0, y: 0},
		
		maxHealth: 60,
		damage: 10,
		attackCooldown: 2
	},
	
	PteroBird: {
		name: 'Ptero Bird',
		entityClass: 'EntityEnemyFlyer',
		tilesetName: 'media/enemy_bird.png', 
		tileSize: {x: 30, y: 30},
		tileOffset: 4,
		size: {x: 20, y: 20},
		offset: {x: 0, y: 0},
		
		maxHealth: 60,
		damage: 10,
		attackCooldown: 2
	},
	
	//
	// Walkers
	//
	SmallBlob: {
		name: 'Small Blob',
		entityClass: 'EntityEnemyWalker',
		tilesetName: 'media/enemy_smallblobs.png', 
		tileSize: {x: 12, y: 12},
		tileOffset: 0,
		size: {x: 12, y: 12},
		offset: {x: 0, y: 0},
		
		maxHealth: 50,
		damage: 10,
		attackCooldown: 2
	},
	
	
	BigBlob: {
		name: 'Big Blob',
		entityClass: 'EntityEnemyWalker',
		tilesetName: 'media/enemy_bigblobs.png', 
		tileSize: {x: 24, y: 24},
		tileOffset: 0,
		size: {x: 20, y: 20},
		offset: {x: 2, y: 2},
		
		maxHealth: 120,
		damage: 20,
		attackCooldown: 2
	}
	
};
	
});
