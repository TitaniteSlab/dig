ig.module(
	'game.entities.weapon-rocket'
)
.requires(
	'impact.entity',
	'game.entities.weapon',
	'game.entities.projectile-rocket'
)
.defines(function() {

EntityWeaponRocket = EntityWeapon.extend({

	// Impact variables
	
	// Game variables
	
	init: function(x, y, weaponDef) {
		this.parent(x, y, weaponDef);
	},
	
	update: function() {
		this.parent();
	},
	
	fire: function() {
		this.parent();
		
		
		// Vector from pivot to projectileStart
		var vec = {
			x: this.projectileStart.x - this.pivot.x,
			y: this.projectileStart.y - this.pivot.y
		};
			
		// Compute projectile start position
		var projStart;
		if (this.flip) {
			
			// Rotate
			//console.log(vec);
			//console.log(this.angle.toDeg());
			vec = terra.rotateVector2d(vec, -this.angle - Math.PI);
			//console.log(vec);
			
			projStart = {
				x: this.pos.x + this.size.x - this.pivot.x - vec.x,
				y: this.pos.y + this.pivot.y + vec.y
			};
			
		} else {
		
			// Rotate
			//console.log(vec);
			//console.log(this.angle.toDeg());
			vec = terra.rotateVector2d(vec, this.angle);
			//console.log(vec);
			
			projStart = {
				x: this.pos.x + this.pivot.x + vec.x,
				y: this.pos.y + this.pivot.y + vec.y
			};
		}
		//console.log(projStart);
		
		
		this.projectileDef.angle0 = this.angle;
		
		var projectile = ig.game.spawnEntity('EntityProjectileRocket', projStart.x, projStart.y, this.projectileDef);
		
		// Transfer properties
		projectile.damage = this.props.DMG;
	}

});

});