ig.module(
	'game.entities.enemy-big-blob'
)
.requires(
	'game.entities.enemy-blob',
	'game.entities.enemy-blue-blob'
)
.defines(function() {

EntityEnemyBigBlob = EntityEnemyBlob.extend({
	
	killBehaviors: [AI.SpawnEntity('EntityEnemyBlueBlob', 4)],
	
	health: 100,
	damage: 15,
	
	animSheet: new ig.AnimationSheet('media/enemy_bigblobs.png', 24, 24),
	size: {x: 20, y: 20},
	offset: {x: 2, y: 2},
	tileOffset: 0,
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.addAnim('attack', 0.12, [
			this.tileOffset+2,
			this.tileOffset+3,
			this.tileOffset+4,
			this.tileOffset+3
		]);
	}
	
});

});