ig.module(
	'game.entities.ship'
)
.requires(
	'impact.entity',
	'game.entities.ship-thruster'
)
.defines(function() {

EntityShip = ig.Entity.extend({
	
	health: 999999999,
	
	// Impact variables
	animSheet: new ig.AnimationSheet('media/ship1.png', 360, 200),
	size: {x: 360, y: 200},
	collides: ig.Entity.COLLIDES.NEVER,
	//type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.NONE,
	flip: false,
	gravityFactor: 0,
	zIndex: 2,
	doTrace: false,
	
	// Game variables
	collisionTilesSet: false,
	playerSpawnOffset: {x: 180, y: 80},
	thrusterDefs: [{
		posOffset: {x: 78, y: 156}
	},{
		posOffset: {x: 201, y: 156}
	},{
		posOffset: {x: 270, y: 156}
	}],
	
	curHitRegion: null,
	prevHitRegion: null,
	hitRegions: [{
		tooltipText: 'Armory',
		posOffset: {x: 80, y: 72},
		size: {x: 40, y: 72},
		color: '#abc',
		onclick: function() {
			ig.game.armory.show();
		}
	}],
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.tooltipTemplate = terra.get$El('[data-template=textTooltip]').clone();
		
		this.addAnim('idle', 1, [0]);
		
		//this.setCollisionTiles();
		this.createThrusters();
	},
	
	update: function() {
		
		if (!this.collisionTilesSet) {
			this.setCollisionTiles();
		}
		
		this.parent();
		
		// Rectangular hit region logic
		this.curHitRegion = null;
		if (
			this.pos.x + this.size.x - ig.game.screen.x > 0 &&
			this.pos.x - ig.game.screen.x < ig.system.width &&
			this.pos.y + this.size.y - ig.game.screen.y > 0 && 
			this.pos.y - ig.game.screen.y < ig.system.realHeight
		) {
			for (var h=0 ; h<this.hitRegions.length ; h++) {
				var region = this.hitRegions[h];
				var screenPos = {
					x: this.pos.x + region.posOffset.x - ig.game.screen.x,
					y: this.pos.y + region.posOffset.y - ig.game.screen.y
				}
				if (
					ig.input.mouse.x > screenPos.x && 
					ig.input.mouse.x < screenPos.x + region.size.x &&
					ig.input.mouse.y > screenPos.y && 
					ig.input.mouse.y < screenPos.y + region.size.y
				) {
					this.curHitRegion = region;
					break;
				}
			}
		}
		
		// Hover
		if (this.curHitRegion) {
			this.tooltipTemplate.text(this.curHitRegion.tooltipText);
			ig.game.tooltip.setContent(this.tooltipTemplate);
			ig.game.tooltip.show();
		
			// Click
			if (ig.input.released('click1')) {
				ig.input.clearPressed();
				ig.game.tooltip.show(false);
				// Slight hack to prevent tooltip on next update
				ig.input.mouse.x = 0;
				ig.input.mouse.y = 0;
				this.curHitRegion.onclick();
			}
		} else if (this.prevHitRegion) {
			ig.game.tooltip.show(false);
		}
		
		this.prevHitRegion = this.curHitRegion;
	},
	
	draw: function() {
		this.parent();
		
		// Draw current hit region if there is one
		if (this.curHitRegion) {
			var ctx = ig.system.context;
			//ctx.save();
			var tempAlpha = ctx.globalAlpha;
			
			ctx.globalAlpha = 0.3;
			ctx.fillStyle = this.curHitRegion.color;
			
			ctx.fillRect(
				ig.system.getDrawPos(this.pos.x + this.curHitRegion.posOffset.x - ig.game.screen.x),
				ig.system.getDrawPos(this.pos.y + this.curHitRegion.posOffset.y - ig.game.screen.y),
				this.curHitRegion.size.x * ig.system.scale,
				this.curHitRegion.size.y * ig.system.scale
			);
			
			ctx.globalAlpha = tempAlpha;
		}
	},
	
	createThrusters: function() {
		for (var t=0 ; t<this.thrusterDefs.length ; t++) {
			var def = this.thrusterDefs[t];
			ig.game.spawnEntity(
				'EntityShipThruster',
				this.pos.x + def.posOffset.x,
				this.pos.y + def.posOffset.y,
				{}
			);
		}
	},
	
	setCollisionTiles: function() {
		var patW = EntityShip.COLLISION[0].length;
		var patH = EntityShip.COLLISION.length;
		var tx = Math.floor(this.pos.x / ig.game.terrainManager.tilesize);
		var ty = Math.floor(this.pos.y / ig.game.terrainManager.tilesize);
		for (var j=0 ; j < patH ; j++) {
			for (var i=0 ; i < patW ; i++) {
				var tile = ig.game.terrainManager.getTileAtIndex(tx+i, ty+j);
				if (tile == null) {
					console.log('Error: Cant set ship collision tile because block isnt populated at ' + (tx+i) + ',' + (ty+j));
					return;
				}
				tile.tileCollision = EntityShip.COLLISION[j][i];
				//tile.health = 99999999;
				tile.indestructable = true;
			}
		}
		this.collisionTilesSet = true;
		
		// Force an update of background/collision maps (this is a bit convoluted)
		ig.game.terrainManager.exportBlocksToImpact();
	},
	
	// Indestructable
	kill: function() {}

});

EntityShip.COLLISION = [
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
	[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
	[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
	[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
	[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0],
	[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],
	[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0,0,0,0,0,12,12,12,12,12,12,12,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

});