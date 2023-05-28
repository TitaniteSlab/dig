ig.module(
	'game.entities.weapon'
)
.requires(
	'game.entities.base-entity'
)
.defines(function() {

EntityWeapon = BaseEntity.extend({

	// Impact variables
	animSheet: new ig.AnimationSheet('media/weapons1.png', 32, 16),
	size: {x: 32, y: 16},
	collides: ig.Entity.COLLIDES.NEVER,
	flip: false,
	gravityFactor: 0,
	zIndex: 11,
	
	// Game variables
	display: null,
	keyBind: 'fireWeapon1',
	angle: 0,		// radians; 0 to -PI top half; 0 to PI bottom half
	normAngle: 0,	// radians; 0 to 2PI clockwise from east
	cooldown: 0.333,
	cooldownTimer: null,
	
	curAmmo: 0,
	
	init: function(x, y, weaponDef) {
		this.parent(x, y, weaponDef);
		
		// Initialize weapon properties
		this.damage = this.props.DMG;
		this.cooldown = 1 / this.props.RTE;
		console.log('weapon cooldown: ' + this.cooldown);
		this.cooldownTimer = new ig.Timer();
		
		this.addAnim('idle', 1, [this.tileOffset]);
		this.anims.idle.pivot = {
			x: this.pivot.x,
			y: this.pivot.y
		};
		
		this.addAnim('fire', this.cooldown / 2, [this.tileOffset+1, this.tileOffset], true);
		this.anims.fire.pivot = {
			x: this.pivot.x,
			y: this.pivot.y
		};
		this.anims.fire.loop = false;
		
		// Update display
		this.display = ig.game.weaponDisplays[this.mount];
		this.display.setSprite(this.sprite);
		this.display.ammoTileOffset = this.ammoTileOffset;
		this.display.maxAmmo = this.props.AMO;
		this.display.reset();
	},
	
	update: function() {
		
		// Compute position and rotation
		var player = ig.game.player;
		if (player) {
			this.updateFromPlayer(player);
		}
		
		// Fire with cooldown (this needs to be overwritten for beam weapons...)
		//console.log(this.keyBind + ':  ' + ig.input.state('fireWeapon1') + '/' + ig.input.state('fireWeapon2'));
		if (!ig.game.ship.curHitRegion && ig.input.state(this.keyBind) && this.cooldownTimer.delta() > 0) {
			this.fire();
			this.cooldownTimer.set(this.cooldown);
		}
			
		
		this.parent();
	},
	
	updateFromPlayer: function(player) {
		var mouse = ig.input.mouse;
		
		this.flip = player.flip;
		this.currentAnim.flip.x = this.flip;
		this.pos.y = player.pos.y + this.posOffset.y
		
		if (this.flip) {
			this.pos.x = player.pos.x + player.size.x - this.size.x - this.posOffset.x;
			
			var pivotX = this.size.x - this.pivot.x;
			this.currentAnim.pivot.x = pivotX;
			
			var dx = (mouse.x + ig.game.screen.x) - (this.pos.x + pivotX);
			var dy = (mouse.y + ig.game.screen.y) - (this.pos.y + this.pivot.y);
			this.angle = Math.atan2(dy, dx);
			
			/*if (this.angle < 0 && this.angle > -Math.PI/2) {
				this.angle = -Math.PI/2;
			} else if (this.angle > 0 && this.angle < Math.PI/2) {
				this.angle = Math.PI/2;
			}*/
			this.currentAnim.angle = this.angle + Math.PI;
			
		} else {
			this.pos.x = player.pos.x + this.posOffset.x;
			this.currentAnim.pivot.x = this.pivot.x;
	
			var dx = (mouse.x + ig.game.screen.x) - this.pos.x;
			var dy = (mouse.y + ig.game.screen.y) - this.pos.y;
			this.angle = Math.atan2(dy, dx);
			
			/*if (this.angle > Math.PI/2) {
				this.angle = Math.PI/2;
			} else if (this.angle < -Math.PI/2) {
				this.angle = -Math.PI/2;
			}*/
			this.currentAnim.angle = this.angle;
		}
		this.normAngle = this.angle < 0 ? 2*Math.PI + this.angle : this.angle;
	},
	
	fire: function() {
		this.currentAnim = this.anims.fire.rewind();
		this.curAmmo--;
		ig.game.weaponDisplays[this.mount].spendAmmo();
	}

});

});