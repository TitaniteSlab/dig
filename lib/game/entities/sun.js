ig.module(
	'game.entities.sun'
)
.requires(
	'game.entities.base-screen-fixed'
)
.defines(function() {

EntitySun = EntityBaseScreenFixed.extend({

	// Impact variables
	animSheet: new ig.AnimationSheet('media/sun1.png', 36, 36),
	tileOffset: 0,
	size: {x: 36, y: 36},
	zIndex: 1,
	
	light: null,
	lightRadius: 500,
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.addAnim('idle', 1, [this.tileOffset]);
		
		// Quick hacks for spawn point
		this.screenPos.y = Math.random().map(0, 1, 30, 60);
		
		if (Math.random() > 0.5) {
			this.screenPos.x = 80;
			this.vel.x = 0.3;
		} else {
			this.screenPos.x = ig.system.width - 80;
			this.vel.x = -0.3;
		}
		
		/*this.light = {
			type: Lighting.TYPE.POINT,
			pos: {
				x: this.center.x,
				y: this.center.y
			},
			radius: this.lightRadius,
			flicker: 0
		};
		ig.game.lighting.addSource(this.light);*/
	},
	
	update: function() {
		this.parent();
		
		/*this.light.pos.x = this.pos.x;
		this.light.pos.y = this.pos.y;*/
	},
	
	draw: function() {		
		
		// Glow
		var ctx = ig.system.context;
		ctx.save();
		
		var drawPos = {
			x: ig.system.getDrawPos(this.pos.x + this.size.x/2 - ig.game.screen.x),
			y: ig.system.getDrawPos(this.pos.y + this.size.y/2 - ig.game.screen.y)
		};
		var sunGradient = ctx.createRadialGradient(drawPos.x, drawPos.y, this.innerRadius, drawPos.x, drawPos.y, this.outerRadius);
		
		sunGradient.addColorStop(0, this.innerColor);
		sunGradient.addColorStop(1, this.outerColor);
		
		ctx.globalCompositeOperation = 'soft-light';
		
		ctx.beginPath();
		ctx.arc(drawPos.x, drawPos.y, this.radius, 0, 2 * Math.PI);
		ctx.fillStyle = sunGradient;
		ctx.fill();
		
		ctx.restore();
		
		this.parent();
	},
	
	kill: function() {
		this.parent();
		
		//ig.game.lighting.removeSource(this.light);
	}

});

});