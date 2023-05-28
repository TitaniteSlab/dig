ig.module(
	'game.entities.enemies.enemy-flyer'
)
.requires(
	'game.entities.enemies.base-enemy',
	
	'impact.entity-pool'
)
.defines(function() {

EntityEnemyFlyer = EntityBaseEnemy.extend({
	
	initBehaviors: [
		AI.FacePlayer()
	],
	
	updateBehaviors: [
		AI.FlyPatrol(40), 
		AI.AggroPlayer(220), 
		AI.AggroWalkToPlayer(40),
		AI.AggroHoverAbovePlayer(120, 100),
		AI.PlayerDistanceLifetime(1000)
	],
	
	killBehaviors: [
		AI.SpawnParticles('#f00', 6, {x: 1, y: 1}),
		AI.SpawnScrap(10)
	],
	
	// Impact variables
	health: 30,
	
	flip: false,
	
	maxVel: {x: 60, y: 100},
	bounciness: 0.0,
	gravityFactor: 0,
	
	// Game variables
	enemyType: EntityBaseEnemy.TYPE.FLYER,
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		//this.atkTimer = new ig.Timer();
		this.dmgTimer = new ig.Timer();
		//this.jumpTimer = new ig.Timer();
		
		this.addAnim('fly', 0.6, [this.tileOffset,this.tileOffset+1]);
		//this.addAnim('attack', 0.12, [this.tileOffset+2,this.tileOffset+3]);
	},
	
	ready: function(game) {},
	
	update: function() {
		this.parent();
		
	},
	
	attack: function() {
		// TODO 
	}

});

});