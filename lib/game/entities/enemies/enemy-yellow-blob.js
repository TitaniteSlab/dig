ig.module(
	'game.entities.enemy-yellow-blob'
)
.requires(
	'game.entities.enemy-blob'
)
.defines(function() {

EntityEnemyYellowBlob = EntityEnemyBlob.extend({

	tileOffset: 8

});

});