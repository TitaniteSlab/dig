ig.module( 
	'game.weapon-defs' 
)
.requires(
	'game.projectile-defs'
)
.defines(function(){

WeaponDefs = {
	
	//
	// Projectile
	//
	GatlingGun: {
		label: 'Gatling Gun',
		desc: 'A fully-automatic machine gun.',
		entityClass: 'EntityWeaponLobbed',
		tileOffset: 12,					// Cell in weapon tileset
		posOffset: {x: 8, y: 8},		// Offset from the player position
		projectileStart: {x: 20, y: 4},
		pivot: {x: 2, y: 2},			// Rotation pivot point offset within weapon sprite
		mount: 'bottom',
		
		terrainDamage: 2,
		
		projectileDef: ProjectileDefs.Bullet,
		
		cost: 2000,
		sprite: {
			url: 'media/weapons1.png',
			size: {x: 25, y: 9},			// Sprite size (px)
			pos: {x: 1, y: 4*16}			// Sprite pos in sheet (px)
		},
		ammoTileOffset: 0,					// Ammo sprite sheet x-offset for weapon display
		
		props: {
			DMG: 5,								// Base damage
			RTE: 14,								// Fire rate (shots per second)
			ACC: (Math.PI / 10).toFixed(2),		// Radian sweep for projectile randomness
			AMO: 6,								// Max ammo
			RLD: 1.5							// Reload time (seconds)
		}
	},
	
	GrenadeLauncher: {
		label: 'Grenade Launcher',
		desc: 'Launches grenades that explode on impact.',
		entityClass: 'EntityWeaponLobbed',
		tileOffset: 9,
		posOffset: {x: -1, y: -7},
		pivot: {x: 9, y: 11},
		projectileStart: {x: 20, y: 5},
		mount: 'top',
		
		projectileDef: ProjectileDefs.BouncyGrenade,
		
		cost: 2000,
		sprite: {
			url: 'media/weapons1.png',
			size: {x: 23, y: 13},
			pos: {x: 1, y: 3*16}
		},
		ammoTileOffset: 0,
		
		props: {
			DMG: 5,
			RTE: 3,
			ACC: 0,	
			AMO: 6,	
			RLD: 1.5
		}
	},
	
	
	//
	// Beam
	//
	LargeLaser: {
		label: 'Large Laser',
		desc: 'Fires a beam of energy.',
		entityClass: 'EntityWeaponBeam',
		tileOffset: 6,
		posOffset: {x: -1, y: 2},
		projectileStart: {x: 7, y: 2},
		pivot: {x: 7, y: 9},
		mount: 'top',
		
		terrainDamageData: [[1,1,1,1]],
		
		cost: 2000,
		sprite: {
			url: 'media/weapons1.png',
			size: {x: 19, y: 11},
			pos: {x: 1, y: 2*16}
		},
		
		props: {
			DMG: 5,
			//RTE: 3,
			ACC: 0,	
			AMO: 6,	
			RLD: 1.5
		}
	},
	
	
	//
	// Trace
	//
	Shotgun: {
		label: 'Shotgun',
		desc: 'Fires a burst of fast-moving bullets.',
		entityClass: 'EntityWeaponTrace',
		tileOffset: 0,
		posOffset: {x: 8, y: 8},
		projectileStart: {x: 22, y: 3},
		pivot: {x: 2, y: 2},
		mount: 'bottom',
		
		terrainDamage: 8,
		
		cost: 2000,
		sprite: {
			url: 'media/weapons1.png',
			size: {x: 19, y: 7},
			pos: {x: 1, y: 0*16}
		},
		ammoTileOffset: 1,
		
		props: {
			DMG: 5,
			RTE: 6,
			ACC: (Math.PI / 9).toFixed(2),	
			AMO: 6,	
			RLD: 1.5,
			CNT: 6		// Shots per round
		}
	},
	
	
	//
	// Rocket
	//
	RocketLauncher: {
		label: 'Rocket Launcher',
		desc: 'Fires rockets that explode on impact.',
		entityClass: 'EntityWeaponRocket',
		tileOffset: 3,
		posOffset: {x: 0, y: -5},
		pivot: {x: 8, y: 11},
		projectileStart: {x: 20, y: 3},
		mount: 'top',
		
		projectileDef: ProjectileDefs.Rocket,
		
		cost: 2000,
		sprite: {
			url: 'media/weapons1.png',
			size: {x: 15, y: 12},
			pos: {x: 1, y: 1*16}
		},
		ammoTileOffset: 2,
		
		props: {
			DMG: 10,
			RTE: 10,
			ACC: (Math.PI / 9).toFixed(2),	
			AMO: 6,	
			RLD: 1.5
		}
	}
	
};

});
