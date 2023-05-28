ig.module(
	'game.entities.ore'
)
.requires(
	'game.entities.ai-entity',
	'impact.entity-pool',
	'impact.timer'
)
.defines(function() {

EntityOre = AIEntity.extend({

	updateBehaviors: [
		AI.PlayerDistanceLifetime(1000),
		AI.PlayerVacuum(100, 1200),
		AI.LoadedBlockLifetime()
	],

	// Impact variables
	animSheet: new ig.AnimationSheet('media/ores.png', 8, 8),
	size: {x: 8, y: 8},
	offset: {x: 1, y: 1},
	friction: {x: 200, y: 200},
	maxVel: {x: 180, y: 180},
	
	collides: ig.Entity.COLLIDES.NEVER,
	gravityFactor: 0,
	zIndex: 10,
	doTrace: false,
	
	// Game variables
	tileOffset: 0,
	value: 1,
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		var anim = this.addAnim('idle', 1, [this.tileOffset]);
		anim.flip.x = Math.random() > 0.5;
		anim.flip.y = Math.random() > 0.5;
		//anim.angle = Math.random().map(0, 1, 0, Math.PI);			// This looks a little weird because of nearest-neighbor scaling
	},
	
	reset: function(x, y, settings) {
		this.parent(x, y, settings);
	},
	
	update: function() {
		this.parent();
	},
	
	draw: function() {
		this.parent();
	},
	
	release: function() {
		this.gravityFactor = 1;
		this.doTrace = true;
		this.vel.x = Math.random().map(0, 1, -40, 40);
	},
	
	kill: function() {
		this.parent();
		ig.game.inventory.addOre(this.value);
	}
	
});

// Id's and base tile offsets for ore types/sizes
EntityOre.TYPE = {
	REGULAR: 0,
	PLATINUM: 1,
	MAGMA: 2,
	FUNGAL: 3,
	PERMAFROST: 4,
	SILICA: 5
};

EntityOre.SIZE = {
	//SMALL: 2,
	MEDIUM: 1,
	LARGE: 0
};

EntityOre.VALUE = {};
EntityOre.VALUE[EntityOre.SIZE.MEDIUM] = 1;
EntityOre.VALUE[EntityOre.SIZE.LARGE] = 2;

});