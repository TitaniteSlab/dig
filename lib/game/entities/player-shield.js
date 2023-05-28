ig.module(
	'game.entities.player-shield'
)
.requires(
	'impact.entity'
)
.defines(function() {

EntityPlayerShield = ig.Entity.extend({
	
	health: 3,
	maxHealth: 3,
	
	// Impact variables
	animSheet: new ig.AnimationSheet('media/player_shield.png', 32, 32),
	size: {x: 32, y: 32},
	collides: ig.Entity.COLLIDES.NEVER,
	flip: false,
	gravityFactor: 0,
	zIndex: 12,
	
	// Game variables
	rechargeTimer: null,
	rechargeTime: 3,
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.addAnim('idle', 1, [0]);
		this.addAnim('recharge', 0.1, [2,1,0]);
		this.anims.recharge.stop = true;
		
		this.rechargeTimer = new ig.Timer();
	},
	
	update: function() {
		this.parent();
		
		if (this.health < this.maxHealth && this.rechargeTimer.delta() > 0) {
			if (this.health <= 0) {
				this.currentAnim = this.anims.recharge.rewind();
			}
			this.health++;
			this.rechargeTimer.set(this.rechargeTime);		// Set the next recharge; will get cleared if damage is received
			console.log('shield recharged 1 health');
		}
		
		var player = ig.game.player;
		if (player) {
			this.updateFromPlayer(player);
		};
	},
	
	updateFromPlayer: function(player) {
		this.pos.x = player.pos.x + player.size.x/2 - this.size.x/2;
		this.pos.y = player.pos.y + player.size.y/2 - this.size.y/2 - 2;
	},
	
	// Returns true if the shield could absorb the damage; false if shield is empty
	receiveDamage: function(amt, src) {
		amt = amt || 1;
		if (this.health > 0) {
			this.health -= amt;
			this.rechargeTimer.set(this.rechargeTime);		// Reset the current recharge
			return true;
		}
		return false;
	},
	
	draw: function() {
		if (this.health > 0) {
			this.parent();
		}
	}

});


});