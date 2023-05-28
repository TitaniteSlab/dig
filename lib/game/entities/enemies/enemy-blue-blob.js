ig.module(
	'game.entities.enemy-blue-blob'
)
.requires(
	'game.entities.enemy-blob',
	'game.ai',
	'game.entities.scrap'
)
.defines(function() {

EntityEnemyBlueBlob = EntityEnemyBlob.extend({
	
	killBehaviors: [
		AI.SpawnScrap(5)
	],
	
	tileOffset: 4

});

});