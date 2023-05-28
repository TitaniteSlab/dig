ig.module(
	'game.entities.enemies.base-enemy'
)
.requires(
	'impact.entity-pool',
	
	'game.entities.ai-entity',
	'game.entities.health-display',
	'game.entities.scrap'
)
.defines(function() {

EntityBaseEnemy = AIEntity.extend({
	
	enemy: true,
	
	updateBehaviors: [
		AI.AggroPlayer(220)
	],
	
	health: 100,
	maxHealth: 100,
	
	collides: ig.Entity.COLLIDES.ACTIVE,
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.A,
	
	zIndex: 11,
	
	deathSound: new ig.Sound('sounds/squirt.mp3'),
	
	tileOffset: 0,
	
	touchDamage: 5,
	touchCooldown: 1,
	touchTimer: null,
	
	damage: 5,
	attackCooldown: 4,
	attackTimer: null,
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.animSheet = new ig.AnimationSheet(this.tilesetName, this.tileSize.x, this.tileSize.y);
		
		this.attackTimer = new ig.Timer();
		this.touchTimer = new ig.Timer();
		
		this.health = this.maxHealth;
		
		this.healthDisplay = ig.game.spawnEntity('EntityHealthDisplay', 0, 0, {
			size: {x: this.size.x, y: 4},
			curHealth: this.maxHealth,
			maxHealth: this.maxHealth
		});
	},
	
	ready: function() {
		this.parent();
	},
	
	update: function() {
		this.parent();
		
		// Set flip
		this.flip = this.accel.x < 0;
		if (this.currentAnim) {
			this.currentAnim.flip.x = this.flip;
		}
		
		// Update health display
		this.healthDisplay.pos.x = this.pos.x;
		this.healthDisplay.pos.y = this.pos.y - 10;		// Hard-coded health bar offset above entity
		this.healthDisplay.curHealth = this.health;
	},
	
	check: function(entity) {
		this.parent(entity);
		
		// Handle touch damage
		if (entity == ig.game.player && this.touchTimer.delta() > 0) {
			entity.receiveDamage(this.touchDamage);
			this.touchTimer.set(this.touchCooldown);
		}
	},
	
	attack: function() {
		this.currentAnim = this.anims.attack;
		this.currentAnim.rewind();
	},
	
	kill: function() {
		this.parent();
		if (this.health <= 0) {
			//this.deathSound.play();
		}
		this.healthDisplay.kill();
	},
	
	killNow: function() {
		this.parent();
		this.healthDisplay.kill();
	}

});

EntityBaseEnemy.TYPE = {
	TILE_EDGE: 'TILE_EDGE',
	WALKER: 'WALKER', 
	FLYER: 'FLYER',
	TERRAIN: 'TERRAIN',
	GHOST: 'GHOST'
};

});