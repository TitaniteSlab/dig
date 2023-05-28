ig.module( 
	'game.item-defs' 
)
.requires(
	//'game.buffs'
)
.defines(function() {

ItemDefs = {
	
	EnergyNode: {
		label: 'Energy Node',
		desc: 'A dense store of energy. Used to upgrade mechs and weapons.',
		//entityClassName: 'EntityBaseItem',
		cost: 300,
		
		sprite: {
			url: 'media/items.png',
			size: {x: 16, y: 16},			// Sprite size (px)
			pos: {x: 0, y: 0}				// Sprite index in sheet
		}
	},
	
	SmallRepairKit: {
		label: 'Small Repair Kit',
		desc: 'Restores 50 armor over 5 seconds.',
		//entityClassName: 'EntityBaseItem',
		cost: 40,
		
		sprite: {
			url: 'media/items.png',
			size: {x: 16, y: 16},			// Sprite size (px)
			pos: {x: 0*16, y: 1*16}			// Sprite index in sheet
		},
		
		consumable: true,
		use: function() {
			console.log('use small repair kit');
			//this.addBuff(Buffs.HealthRegen(
		}
	},
	
	LargeRepairKit: {
		label: 'Large Repair Kit',
		desc: 'Restores 50 armor over 5 seconds.',
		//entityClassName: 'EntityBaseItem',
		cost: 40,
		
		sprite: {
			url: 'media/items.png',
			size: {x: 16, y: 16},			// Sprite size (px)
			pos: {x: 1*16, y: 1*16}			// Sprite index in sheet
		},
		
		consumable: true,
		use: function() {
			console.log('use large repair kit');
			//this.addBuff(Buffs.HealthRegen(
		}
	},
	
	ShipTeleporter: {
		label: 'Ship Teleporter',
		desc: 'Beams your mech back to the ship after a short delay.',
		//entityClassName: 'EntityBaseItem',
		cost: 200,
		
		sprite: {
			url: 'media/items.png',
			size: {x: 16, y: 16},			// Sprite size (px)
			pos: {x: 2*16, y: 1*16}			// Sprite index in sheet
		},
		
		consumable: true,
		use: function() {
			//this.addBuff(Buffs.HealthRegen(
		}
	},
	
	SmallFlare: {
		label: 'Small Flare',
		desc: 'A small emergency flare. Lights a small area for 30 seconds.',
		cost: 80,
		
		sprite: {
			url: 'media/items.png',
			size: {x: 16, y: 16},			// Sprite size (px)
			pos: {x: 3*16, y: 1*16}			// Sprite index in sheet
		},
		tileOffset: 0,
		
		consumable: true,
		use: function(player) {
			player.throwItem(this);
		},
		
		entityClassName: 'EntityFlare',
		lightRadius: 120
	},
	
	LargeFlare: {
		label: 'Large Flare',
		desc: 'An industrial mining flare. Lights a large area for 30 seconds.',
		cost: 160,
		
		sprite: {
			url: 'media/items.png',
			size: {x: 16, y: 16},			// Sprite size (px)
			pos: {x: 4*16, y: 1*16}			// Sprite index in sheet
		},
		tileOffset: 8,
		
		consumable: true,
		use: function(player) {
			player.throwItem(this);
		},
		
		entityClassName: 'EntityFlare',
		lightRadius: 180
	},
	
	StickyFlare: {
		label: 'Adhesive Flare',
		desc: 'A flare covered in glue. Sticks to surfaces and lights a medium area for 30 seconds.',
		cost: 160,
		
		sprite: {
			url: 'media/items.png',
			size: {x: 16, y: 16},			// Sprite size (px)
			pos: {x: 5*16, y: 1*16}			// Sprite index in sheet
		},
		tileOffset: 16,
		
		consumable: true,
		use: function(player) {
			player.throwItem(this);
		},
		
		entityClassName: 'EntityFlare',
		lightRadius: 160,
		sticky: true
	}
	
	
};
	
});
