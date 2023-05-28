ig.module(
	'game.entities.player-mech'
)
.requires(
	'game.entities.base-entity',
	'game.entities.player-shield',
	'game.entities.thrust-display',
	'game.entities.weapon',
	'game.entities.weapon-lobbed',
	'game.entities.weapon-rocket',
	'game.entities.weapon-beam',
	'game.entities.weapon-trace',
	
	'game.entities.throwables.flare'
	
	//'game.entities.weapons.machine-gun'
)
.defines(function() {

EntityPlayerMech = BaseEntity.extend({

	// Impact variables
	health: 100,
	maxHealth: 100,
	
	animSheet: new ig.AnimationSheet('media/player_human1.png', 18, 24),
	size: {x: 10, y: 24},
	offset: {x: 4, y: 0},
	
	collides: ig.Entity.COLLIDES.PASSIVE,
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.B,
	friction: {x: 1000, y: 0},
	//slopeStanding: {min: (46).toRad(), max: (134).toRad()},
	maxVel: {x: 80, y: 160},
	bounciness: 0,
	zIndex: 10,
	
	// Game variables
	curZone: 0,
	weapons: {},
	
	moveAccel: 300,
	
	jumpVel: 100,
	thrustGroundBoost: 50,
	baseThrust: 600,
	thrustFactor: 1,
	thrusting: false,
	curThrust: 60,
	maxThrust: 60,
	thrustDrainRate: 5,
	thrustRechargeRate: 6,
	thrustTickTimer: null,
	thrustTickTime: 0.2,
	thrustRechargeDelayTimer: null,
	thrustRechargeDelay: 1,
	thrustDisplay: null,
	
	// Shield
	shield: null,
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.addAnim('idle', 1, [0]);
		this.addAnim('walkRight', 0.1, [1,2,3,4,5,6]);
		this.addAnim('walkLeft', 0.1, [6,5,4,3,2,1]);
		this.addAnim('thrust', 0.1, [7,8,7,9,10,7,9,8,10]);
		
		this.health = this.maxHealth;
		ig.game.healthBar.setPercent(100);
		ig.game.healthBar.setText(this.maxHealth);
		
		this.thrustTickTimer = new ig.Timer();
		this.thrustRechargeDelayTimer = new ig.Timer();
		this.thrustDisplay = ig.game.spawnEntity('EntityThrustDisplay', 0, 0, {
			curThrust: this.maxThrust,
			maxThrust: this.maxThrust
		});
		this.thrustDisplay.updateFromPlayer(this);
		
		this.shield = ig.game.spawnEntity('EntityPlayerShield', 0, 0, {});
		this.shield.updateFromPlayer(this);
	},
	
	//ready: function() {},
	
	update: function() {
		
		// Flip based on mouse
		this.flip = ig.input.mouse.x < ig.system.width / 2;
		this.currentAnim.flip.x = this.flip;
		
		// Compute angle from center to mouse
		//if (this.flip) {
			var dx = (ig.input.mouse.x + ig.game.screen.x) - this.center.x;
			var dy = (ig.input.mouse.y + ig.game.screen.y) - this.center.y;
			this.angleToMouse = Math.atan2(dy, dx);
		//} else {
			
		//}
		
		// Left/Right movement
		if (ig.input.state('left') && !ig.input.state('right')) {
			this.accel.x = -this.moveAccel;
			this.currentAnim = this.flip ? this.anims.walkRight : this.anims.walkLeft;
		} else if (!ig.input.state('left') && ig.input.state('right')) {
			this.accel.x = this.moveAccel;
			this.currentAnim = this.flip ? this.anims.walkLeft : this.anims.walkRight;
		} else {
			this.accel.x = 0;
			this.currentAnim = this.anims.idle;
		}
		
		// Jump/Thrust
		if (ig.input.state('thrust') && this.curThrust > 0) {
			if (!this.thrusting) {
				this.thrusting = true;
				// Boost
				if (this.standing) {
					this.vel.y = this.vel.y - this.thrustGroundBoost;
				}
			}
			
			this.accel.y = -(this.baseThrust * this.thrustFactor);
			this.currentAnim = this.anims.thrust;
			
			if (this.thrustTickTimer.delta() > 0) {
				this.curThrust -= this.thrustDrainRate;
				if (this.curThrust < 0) { this.curThrust = 0; }
				this.thrustTickTimer.set(this.thrustTickTime);
			}
			this.thrustRechargeDelayTimer.set(this.thrustRechargeDelay);
			
		} else {
			this.thrusting = false;
			this.accel.y = 0;
			
			// Recharge thrust if needed and delay is up; uses same tick timer as the draining above, a but different rate
			if (this.curThrust < this.maxThrust && this.thrustRechargeDelayTimer.delta() > 0 && this.thrustTickTimer.delta() > 0) {
				this.curThrust += this.thrustRechargeRate;
				if (this.curThrust > this.maxThrust) { this.curThrust = this.maxThrust; }
				this.thrustTickTimer.set(this.thrustTickTime);
			}
			
			// Jump
			if (ig.input.state('thrust') && this.standing) {
				this.vel.y = -this.jumpVel;
			}
		}
		
		this.thrustDisplay.setThrust(this.curThrust);
		
		// Figure out what zone we're in
		var zx = this.pos.x + this.size.x/2;
		var zy = this.pos.y + this.size.y/2;
		this.curZone = ig.game.terrainManager.getZoneAtPosition(zx, zy);
		
		// Update weapons
		/*if (this.weapons.top) {
			this.weapons.top.updateFromPlayer(this);
		}
		if (this.weapons.bottom) {
			this.weapons.bottom.updateFromPlayer(this);
		}*/
		
		this.parent();
	},
	
	receiveDamage: function(amt, src) {
		if (this.shield && this.shield.receiveDamage(1, this)) {
			console.log('shield absorbed damage');
		} else {
			ig.game.healthBar.setPercent(this.health / this.maxHealth * 100);
			ig.game.healthBar.setText(this.health);
			this.parent(amt, src);
		}
	},
	
	kill: function() {
		this.parent();
		if (this.weapons.top) {
			this.weapons.top.kill();
		}
		if (this.weapons.bottom) {
			this.weapons.bottom.kill();
		}
		if (this.shield) {
			this.shield.kill();
		}
		if (this.thrustDisplay) {
			this.thrustDisplay.kill();
		}
		//ig.game.spawnPlayer();
		console.log('player killed');
	},
	
	setWeapon: function(weaponId, mods) {
		var weaponDef = WeaponDefs[weaponId];
		
		if (this.weapons[weaponDef.mount]) {
			ig.game.removeEntity(this.weapons[weaponDef.mount]);
		}
		
		var entity = ig.game.spawnEntity(weaponDef.entityClass, ig.game.player.pos.x, ig.game.player.pos.y, weaponDef);
		entity.keyBind = weaponDef.mount == 'top' ? 'click2' : 'click1';		// Hacky
		
		this.weapons[weaponDef.mount] = entity;
	},
	
	throwItem: function(itemDef) {
		var bumpY = 10;		// Arbitrary -y offset for throw start
		
		// Throw settings from player
		var settings = {
			angle0: this.angleToMouse,
			flip: this.flip,
		};
		
		// Merge item def for convenience
		ig.merge(settings, itemDef);
		
		// Spawn
		ig.game.spawnEntity(itemDef.entityClassName, this.center.x, this.center.y - bumpY, settings);
	}

});

});