ig.module(
	'game.entities.enemies.enemy-projectile-homing'
)
.requires(
	'game.entities.ai-entity',
	'impact.entity-pool',
	'impact.timer'
)
.defines(function() {

EntityEnemyProjectileHoming = AIEntity.extend({
	
	updateBehaviors: [
		AI.PlayerHoming(350),
		AI.PlayerDistanceLifetime(1000),
		AI.TemporalLifetime(3)
	],
	
	killBehaviors: [
		AI.SpawnParticles('#61660d', 4)
	],

	// Impact variables
	animSheet: new ig.AnimationSheet('media/enemy_projectiles.png', 8, 8),
	size: {x: 8, y: 8},
	offset: {x: 0, y: 0},
	friction: {x: 200, y: 200},
	maxVel: {x: 70, y: 70},
	vel: {x: 0, y: 0},
	
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.A,
	collides: ig.Entity.COLLIDES.NEVER,
	gravityFactor: 0,
	zIndex: 11,
	doTrace: true,
	
	// Game variables
	enemy: true,
	damage: 5,
	tileOffset: 0,
	
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
	
	handleMovementTrace: function(res) {
		this.parent(res);
		if (res.collision.x || res.collision.y || res.collision.slope) {
			this.kill();
		}
	},
	
	check: function(entity) {
		if (entity == ig.game.player) {
			entity.receiveDamage(this.damage);
		}
		this.kill();
	},
	
	kill: function() {
		this.parent();
	},
	
	draw: function() {
		this.parent();
		
		/*var ctx = ig.system.context;
		
		ctx.strokeStyle = 'red';
		ctx.lineWidth = '2';
		var len = 20;
		
		var cx = ig.system.getDrawPos(this.center.x - ig.game.screen.x);
		var cy = ig.system.getDrawPos(this.center.y - ig.game.screen.y);
		
		var cx2 = cx + len*Math.cos(this.angle);
		var cy2 = cy + len*Math.sin(this.angle);
		
		console.log('drawing at: ' + cx + ',' + cy);
		console.log('drawing to: ' + cx2 + ',' + cy2);
		
		ctx.beginPath();
		ctx.moveTo(cx, cy);
		ctx.lineTo(cx2, cy2);
		ctx.stroke();*/
		
	}
	
});

});