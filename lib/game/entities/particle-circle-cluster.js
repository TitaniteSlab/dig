ig.module(
	'game.entities.particle-circle-cluster'
)
.requires(
	'game.entities.base-entity',
	'game.lighting',
	
	'xcolor',
	
	'impact.entity-pool'
)
.defines(function() {

EntityParticleCircleCluster = BaseEntity.extend({
	
	pos: {x: 0, y: 0},
	radius: 10,
	startRadiusRange: {min: 1, max: 6},
	endRadiusRange: {min: 10, max: 16},
	minCircles: 3,
	maxCircles: 3,
	startColor: '#ff4',
	endColor: '#c72626',
	startAlpha: 0.9,
	endAlpha: 0.3,
	
	timer: null,
	spawnPeriod: 0.06,
	circleDuration: 0.16,
	
	circles: [],
	
	light: null,
	
	// Impact variables
	vel: {x: 0, y: 0},
	
	collides: ig.Entity.COLLIDES.NEVER,
	gravityFactor: 0,
	zIndex: 12,
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.timer = new ig.Timer(this.spawnPeriod);
		
		this.numCircles = Math.random().map(0, 2, this.minCircles, this.maxCircles);
		
		for (var c=0 ; c<this.numCircles ; c++) {
			var r = Math.random().map(0, 1, 1, this.radius);
			var th = Math.random().map(0, 1, 0, 2*Math.PI);
			var circle = {
				startTime: Math.random().map(0, 1, -this.spawnPeriod, 0),
				startRadius: Math.random().map(0, 1, this.startRadiusRange.min, this.startRadiusRange.max),
				endRadius: Math.random().map(0, 1, this.endRadiusRange.min, this.endRadiusRange.max),
				pos: {
					x: this.pos.x + r*Math.cos(th),
					y: this.pos.y + r*Math.sin(th)
				}
			};
			this.circles.push(circle);
		}
		
		this.light = {
			type: Lighting.TYPE.POINT,
			pos: {
				x: this.pos.x,
				y: this.pos.y
			},
			radius: (this.radius + this.endRadiusRange.max) * 2.0
		};
		ig.game.lighting.addSource(this.light);
		
		//console.log(this.circles);
	},
	
	reset: function(x, y, settings) {
		this.parent(x, y, settings);
		
		this.light = {
			type: Lighting.TYPE.POINT,
			pos: {
				x: this.pos.x,
				y: this.pos.y
			},
			radius: (this.radius + this.endRadiusRange.max) * 2.0
		};
		ig.game.lighting.addSource(this.light);
		
	},
	
	update: function() {
		
		this.light.pos.x = this.pos.x;
		this.light.pos.y = this.pos.y;
		
		if (this.timer.delta() > this.circleDuration) {
			this.kill();
		}
	},
	
	draw: function() {
	
		var ctx = ig.system.context;
		//ctx.save();
		var tempAlpha = ctx.globalAlpha;
		//ctx.globalAlpha = this.alpha;
		
		
		for (var c=0 ; c<this.circles.length ; c++) {
			var circle = this.circles[c];
			
			var delta = this.timer.delta();
			
			// Not spawned yet
			if (delta < circle.startTime) { continue; }
			
			// Already finished
			if (delta - circle.startTime > this.circleDuration) { continue; }
			
			// Compute progression params
			var pct = (this.timer.delta() - circle.startTime) / this.circleDuration;
			var color = xColor.colorGradient(this.startColor, this.endColor, pct);
			var alpha = pct.map(0, 1, this.startAlpha, this.endAlpha);
			var radius = pct.map(0, 1, circle.startRadius, circle.endRadius);
			
			ctx.fillStyle = color;
			ctx.globalAlpha = alpha;
			
			// Draw circle
			ctx.beginPath();
			ctx.arc(
				ig.system.getDrawPos(circle.pos.x - ig.game.screen.x), 
				ig.system.getDrawPos(circle.pos.y - ig.game.screen.y), 
				radius * ig.system.scale, 
				0, 2*Math.PI, false
			);
			ctx.fill();
		}
		
		
		ctx.globalAlpha = tempAlpha;
		//ctx.restore();
		
	},
	
	kill: function() {
		this.parent();
		ig.game.lighting.removeSource(this.light);
	}
	
});

});