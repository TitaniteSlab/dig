ig.module(
	'game.climate'
)
.requires(
	'game.entities.cloud'
)
.defines(function() {

Climate = ig.Class.extend({
	
	clouds: [],
	numClouds: 17,
	
	init: function() {
		
		// Spawn clouds to start
		this.clouds = [];
		for (var i=0 ; i<this.numClouds ; i++) {
			this.spawnCloud();
		}
		
	},
	
	update: function() {
		
		// Purge killed clouds
		for (var i=this.clouds.length ; i>=0 ; i--) {
			if (this.clouds[i]._killed) {
				this.clouds.splice(i, 1);
			}
		}
		
		// Spawn 1 cloud per update if we're short of target
		if (this.clouds.length < this.numClouds) {
			this.spawnCloud();
		}
		
	},
	
	spawnCloud: function() {
		this.clouds.push(ig.game.spawnBackgroundEntity('EntityCloud', 0, 0, {}));
	}
	
	
});

});