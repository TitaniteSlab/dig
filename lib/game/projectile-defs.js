ig.module( 
	'game.projectile-defs' 
)
.requires(
	
)
.defines(function(){

ProjectileDefs = {
	
	Bullet: {
		size: {x: 3, y: 3},
		offset: {x: 2, y: 2},
		tileOffset: 0,
		terrainDamageData: 8,
		explosionRadius: 0,
		vel0: 400,
		angle0: 0,
		gravityFactor: 0,
		timeToDie: 0
	},
	
	BouncyGrenade: {
		tileOffset: 3,
		terrainDamageData: [
			[2,4,4,2],
			[4,8,8,4],
			[4,8,8,4],
			[2,4,4,2]
		],
		explosionRadius: 18,
		bounciness: 0.6,
		vel0: 260,
		angle0: 0,
		gravityFactor: 1,
		timeToDie: 2
	},
	
	Rocket: {
		tileOffset: 0,
		terrainDamageData: [
			[2,4,4,2],
			[4,8,8,4],
			[4,8,8,4],
			[2,4,4,2]
		],
		explosionRadius: 18,
		bounciness: 0,
		vel0: 220,
		angle0: 0,
		gravityFactor: 0,
		timeToDie: 0,
		
		wobbleAngle: Math.PI / 6,		// Range of angles for random wobble
		maxWobbleAngle: Math.PI / 10,	// Max delta from angle0 due to wobble
		wobbleFrequency: 12				// Milliseconds between angle changes
	}
	
};
	
});
