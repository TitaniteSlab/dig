ig.module(
	'game.entities.enemies.enemy-walker'
)
.requires(
	'game.entities.enemies.base-enemy'
)
.defines(function() {

EntityEnemyWalker = EntityBaseEnemy.extend({

	updateBehaviors: [
		AI.Patrol(20), 
		AI.AggroPlayer(200), 
		AI.AggroWalkToPlayer(20),
		AI.AggroJumpWhenStuck(-150),
		AI.PlayerDistanceLifetime(1000)
	],
	
	killBehaviors: [
		AI.SpawnParticles('#f00', 8, {x: 1, y: 1}),
		AI.SpawnScrap(10)
	],
	
	// Impact variables	
	friction: {x: 400, y: 100},
	maxVel: {x: 60, y: 140},
	bounciness: 0.1,
	gravityFactor: 1,
	zIndex: 10,
	
	// Game variables
	enemyType: EntityBaseEnemy.TYPE.WALKER,
	deathSound: new ig.Sound('sounds/squirt.mp3'),
	
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.addAnim('walk', 0.4, [this.tileOffset,this.tileOffset+1]);
		this.addAnim('attack', 0.12, [this.tileOffset+2,this.tileOffset+3]);
	},
	
	ready: function(game) {},
	
	update: function() {
		this.parent();
	},
	
	attack: function() {
		this.parent();
	},
	
	kill: function() {
		this.parent();
	}

});

});