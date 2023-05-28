ig.module(
	'game.entities.scrap'
)
.requires(
	'game.entities.ai-entity',
	'game.ai',
	'impact.entity-pool'
)
.defines(function() {

EntityScrap = AIEntity.extend({

	updateBehaviors: [
		AI.PlayerDistanceLifetime(1500),
		AI.PlayerVacuum(50, 1200)
	],

	// Impact variables
	animSheet: new ig.AnimationSheet('media/scrap.png', 8, 8),
	size: {x: 8, y: 8},
	offset: {x: 1, y: 1},
	friction: {x: 100, y: 100},
	maxVel: {x: 180, y: 180},
	
	collides: ig.Entity.COLLIDES.NEVER,
	gravityFactor: 1,
	zIndex: 10,
	doTrace: true,
	
	// Game variables
	tileOffset: 0,
	value: 5,
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		var anim = this.addAnim('idle', 1, [this.tileOffset + terra.randInt(5)]);
		anim.flip.x = Math.random() > 0.5;
		anim.flip.y = Math.random() > 0.5;
		//anim.angle = Math.random().map(0, 1, 0, Math.PI);			// This looks a little weird because of nearest-neighbor scaling
	},
	
	reset: function(x, y, settings) {
		this.parent(x, y, settings);
	},
	
	kill: function() {
		this.parent();
		ig.game.inventory.addScrap(this.value);
	}
	
});


});