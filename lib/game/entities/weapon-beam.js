ig.module(
	'game.entities.weapon-beam'
)
.requires(
	'impact.entity',
	'game.entities.weapon',
	'game.entities.projectile-beam'
)
.defines(function() {

EntityWeaponBeam = EntityWeapon.extend({

	// Impact variables
	animSheet: new ig.AnimationSheet('media/weapons1.png', 24, 16),
	size: {x: 24, y: 18},
	collides: ig.Entity.COLLIDES.NEVER,
	flip: false,
	gravityFactor: 0,
	
	// Game variables
	beam: null,
	fireCooldown: 0,
	
	init: function(x, y, weaponDef) {
		this.parent(x, y, weaponDef);
	},
	
	update: function() {
		this.parent();
		
		// Update beam angle if it exists
		if (this.beam) {
			this.updateBeam();
		}
		
		// Input
		if (ig.input.state(this.keyBind)) {
			this.fire();
		} else if (this.beam) {
			this.beam.kill();
			this.beam = null;
		}
		
	},
	
	fire: function() {
		this.parent();
		
		if (!this.beam) {
			this.beam = ig.game.spawnEntity('EntityProjectileBeam', 0, 0, {
				angle0: this.computeBeamAngle()
			});
			this.updateBeam();
		}
	},
	
	updateBeam: function() {
		this.beam.angle = this.computeBeamAngle();
		this.beam.pos = this.computeBeamPos();
		this.beam.flip = this.flip;
	},
	
	// TODO The beam is aligned with the weapon pivot point. Should make a separate variable for the projectile pivot.
	computeBeamPos: function() {
		var beamX;
		var beamY = this.pos.y + this.pivot.y + this.projectileOffset * Math.sin(this.computeBeamAngle()) - this.beam.size.y/2;
		if (this.flip) {
			beamX = this.pos.x + this.size.x - this.pivot.x + this.projectileOffset * Math.cos(this.computeBeamAngle());
		} else {
			beamX = this.pos.x + this.pivot.x + this.projectileOffset * Math.cos(this.computeBeamAngle());
		}
		return {x: beamX, y: beamY};
	},
	
	computeBeamAngle: function() {
		var angle;
		if (this.flip) {
			angle = this.currentAnim.angle - Math.PI;
		} else {
			angle = this.currentAnim.angle;
		}
		return angle;
	}

});

});