ig.module(
	'game.entities.ai-entity'
)
.requires(
	'game.entities.base-entity',
	'game.ai'
)
.defines(function() {

AIEntity = BaseEntity.extend({
	
	initBehaviors: [],
	updateBehaviors: [],
	drawBehaviors: [],
	hurtBehaviors: [],
	killBehaviors: [],
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		for (var b=0 ; b<this.initBehaviors.length ; b++) {
			this.initBehaviors[b].apply(this);
		}
	},
	
	update: function() {
		this.parent();
		
		for (var b=0 ; b<this.updateBehaviors.length ; b++) {
			this.updateBehaviors[b].apply(this);
		}
	},
	
	receiveDamage: function(amt, src) {
		this.parent(amt, src);
		
		for (var b=0 ; b<this.hurtBehaviors.length ; b++) {
			this.hurtBehaviors[b].apply(this);
		}
	},
	
	kill: function() {
		for (var b=0 ; b<this.killBehaviors.length ; b++) {
			this.killBehaviors[b].apply(this);
		}
		
		this.parent();
	}
	
});

});