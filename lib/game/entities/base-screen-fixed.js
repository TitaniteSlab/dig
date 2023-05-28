ig.module(
	'game.entities.base-screen-fixed'
)
.requires(
	'game.entities.ai-entity',
	'game.ai'
)
.defines(function() {

// For these entities, screenPos is the fixed position on screen (in game coordinates), 
//  which is converted to in-game pos on each update
// vel is used to move the entity across the screen
EntityBaseScreenFixed = AIEntity.extend({

	updateBehaviors: [
		AI.PlayerDistanceLifetime(600)		// Might make a new one for screen distance
	],
	
	// Impact variables
	flip: false,
	
	collides: ig.Entity.COLLIDES.NEVER,
	gravityFactor: 0,
	doTrace: false,
	
	// Game variables
	screenPos: { x: 0, y: 0 },
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
	},
	
	update: function() {
		this.parent();
		
		this.screenPos.x += this.vel.x * ig.system.tick;
		this.screenPos.y += this.vel.y * ig.system.tick;
		
		this.pos.x = ig.game.screen.x + this.screenPos.x;
		this.pos.y = ig.game.screen.y + this.screenPos.y;
		this.center.x = this.pos.x + this.size.x/2;
		this.center.y = this.pos.y + this.size.y/2;
		
		if( this.currentAnim ) {
			this.currentAnim.update();
		}
	},
	
	draw: function() {
		this.parent();
	}

});

});