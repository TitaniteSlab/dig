ig.module(
	'game.entities.enemy-blob'
)
.requires(
	'game.entities.ai-entity'
)
.defines(function() {

EntityEnemyBlob = AIEntity.extend({

	updateBehaviors: [
		AI.Patrol(40), 
		AI.AggroPlayer(200), 
		AI.AggroWalkToPlayer(40),
		AI.AggroJumpWhenStuck(-150),
		AI.PlayerDistanceLifetime(1000)
	],
	
	// Impact variables
	health: 20,
	
	animSheet: new ig.AnimationSheet('media/enemy_smallblobs.png', 12, 12),
	size: {x: 12, y: 12},
	tileOffset: 0,
	flip: false,
	
	collides: ig.Entity.COLLIDES.ACTIVE,
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.A,
	friction: {x: 800, y: 0},
	maxVel: {x: 80, y: 140},
	bounciness: 0.1,
	gravityFactor: 1,
	zIndex: 10,
	
	deathSound: new ig.Sound('sounds/squirt.mp3'),
	
	// Game variables
	atkCooldown: 3 + Math.random(),
	atkTimer: null,
	
	dmgCooldown: 0.5,
	dmgTimer: null,
	
	jumpCooldown: 3 + Math.random(),
	jumpTimer: null,
	
	damage: 5,
	
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.atkTimer = new ig.Timer();
		this.dmgTimer = new ig.Timer();
		this.jumpTimer = new ig.Timer();
		
		this.addAnim('walk', 0.4, [this.tileOffset,this.tileOffset+1]);
		this.addAnim('attack', 0.12, [this.tileOffset+2,this.tileOffset+3]);
	},
	
	ready: function(game) {},
	
	update: function() {
		this.parent();
		
		// Flip animation
		this.currentAnim.flip.x = this.flip;
		
	},
	
	check: function(entity) {
		if (entity == ig.game.player && this.dmgTimer.delta() > 0) {
			entity.receiveDamage(this.damage);
			this.dmgTimer.set(this.dmgCooldown);
		}
	},
	
	attack: function() {
		if (this.vel.y >= 0) {
			this.vel.y -= 300;
		}
		this.currentAnim = this.anims.attack;
	},
	
	kill: function() {
		this.parent();
		if (this.health <= 0) {
			this.deathSound.play();
		}
	}

});

});