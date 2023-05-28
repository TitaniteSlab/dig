ig.module(
	'game.ui.solar-system'
)
.requires(
	'terra',
	'perlin',
	'impact.impact',
	'impact.timer'
)
.defines(function() {

SolarSystem = ig.Class.extend({
	
	clock: null,
	running: true,
	
	mouse: {x: 0, y: 0},
	
	canvas: null,
	context: null,
	
	width: 400,
	height: 300,
	tilesize: 48,
	planetCanvasSize: 48*12,
	
	mouseEnabled: true,
	hoverPlanet: null,
	activePlanet: null,
	hitRegionSize: 60,
	hitRegionImg: null,
	hitRegionImgPath: 'media/planet_brackets.png',
	
	planetInfo: null,
	
	
	planetImg: null,
	planetImgPath: 'media/planets.png',
	
	backgroundCanvas: null,
	orbitCanvas: null,
	
	numStars: 200,
	planetDistance: 90,		// distance between planet ellipses in the x direction
	orbitRatio: 0.5,		// y:x orbit ellipse ratio
	orbitColor: '#888',
	
	// TODO Add a reference to the corresponding level (LevelDefs) for loading
	planets: [{
		name: 'Sun',
		tileOffset: 0,
		orbitSpeed: 0,
		orbitStart: 0,
		effects: [{
			type: 'flare',
			width: 14,
			height: 360,
			innerColor: 'rgba(150,150,30,0.8)',
			outerColor: 'rgba(0,0,0,0)'
		},{
			type: 'glow',
			radius: 0,
			glowRadius: 50,
			count: 1,
			innerColor: 'rgba(200,200,30,0.7)',
			outerColor: 'rgba(0,0,0,0)'
		}/*,{
			type: 'glow',
			radius: 0,
			glowRadius: 500,
			count: 1,
			innerColor: 'rgba(200,200,200,0.2)',
			outerColor: 'rgba(0,0,0,0)'
		}*/]
	},{
		name: 'Toxic',
		levelId: 'Toxic',
		tileOffset: 4,
		orbitSpeed: Math.random().map(0, 1, 0.002, 0.016),
		orbitStart: Math.random().map(0, 1, 0, 2*Math.PI),
		effects: [{
			type: 'glow',
			radius: 0,
			glowRadius: 30,
			count: 1,
			innerColor: 'rgba(20,150,20,0.9)',
			outerColor: 'rgba(0,0,0,0)'
		}],
	},{
		name: 'Terran',
		levelId: 'Terran',
		tileOffset: 2,
		orbitSpeed: Math.random().map(0, 1, 0.002, 0.016),
		orbitStart: Math.random().map(0, 1, 0, 2*Math.PI),
		effects: [{
			type: 'glow',
			radius: 0,
			glowRadius: 22,
			count: 1,
			innerColor: 'rgba(107,209,237,0.9)',
			outerColor: 'rgba(107,209,237,0)'
		}]
	},{
		name: 'Desert',
		levelId: 'Desert',
		tileOffset: 5,
		orbitSpeed: Math.random().map(0, 1, 0.002, 0.016),
		orbitStart: Math.random().map(0, 1, 0, 2*Math.PI),
	},{
		name: 'Freo',
		levelId: 'Freo',
		tileOffset: 3,
		orbitSpeed: Math.random().map(0, 1, 0.002, 0.016),
		orbitStart: Math.random().map(0, 1, 0, 2*Math.PI),
		effects: [{
			type: 'glow',
			radius: 0,
			glowRadius: 60,
			count: 1,
			innerColor: 'rgb(140,140,140)',
			outerColor: 'rgba(0,0,0,0)'
		},{
			type: 'particles',
			radius: 40,
			count: 100,
			color: '#FFFFFF'
		}]
	},{
		name: 'Magma',
		levelId: 'Magma',
		tileOffset: 1,
		orbitSpeed: Math.random().map(0, 1, 0.002, 0.016),
		orbitStart: Math.random().map(0, 1, 0, 2*Math.PI),
		effects: [{
			type: 'glow',
			radius: 28,
			glowRadius: 22,
			count: 18,
			innerColor: 'rgba(50,15,15,0.6)',
			outerColor: 'rgba(0,0,0,0)'
		}]
	}],
	
	
	init: function(cvs, settings) {
		console.log('SolarSystem init');
		ig.merge(this, settings);
		
		// Init elements
		this.canvas = terra.getEl(cvs);
		if (!this.canvas) { return; }
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.context = this.canvas.getContext('2d');
		
		// Planet info dialog
		this.planetInfo = terra.get$El('#planetInfo');
		
		// Load planet tileset image
		this.planetImg = new Image();
		var self = this;
		this.planetImg.onload = function() {
			self.planetImgOnload.apply(self);
		};
		this.planetImg.onerror = function() {};
		this.planetImg.src = this.planetImgPath;
		
		// Load hover/active image
		this.hitRegionImg = new Image();
		this.hitRegionImg.src = this.hitRegionImgPath;
		
		// Create stuff
		//this.computePlanetPositions();
		this.createBackgroundCanvas();
		//this.createPlanetCanvases();
		
		// Begin update loop
		this.clock = new ig.Timer();
		var frame = function(time) {
			
			// Update
			self.update.apply(self);
			
			// Draw
			self.draw.apply(self);
			
			// Queue next frame
			if (self.running) {
				window.requestAnimationFrame(frame);
			}
		};
		window.requestAnimationFrame(frame);
		
		// Mouse move
		this.canvas.addEventListener('mousemove', function(evt) {
			if (!self.mouseEnabled) { return; }
			
			self.mouse.x = evt.clientX;
			self.mouse.y = evt.clientY;
		});
		
		// Mouse click
		this.canvas.addEventListener('click', function(evt) {
			if (!self.mouseEnabled) { return; }
			
			if (self.hoverPlanet) {
				self.activePlanet = self.hoverPlanet;
				self.setPlanetInfo.call(self, self.activePlanet);
				self.planetInfo.show();
			} else {
				self.activePlanet = null;
				self.planetInfo.hide();
			}
		});
		
		this.show();
	},
	
	update: function() {
		this.computePlanetPositions();
		this.sortPlanets();
		
		// Hit regions
		this.hoverPlanet = null;
		if (this.mouseEnabled) {
			for (var p=this.planets.length-1 ; p>=0 ; p--) {
				var planet = this.planets[p];
				
				if (planet.levelId == undefined) { continue; }
				
				var rectPos = {
					x: planet.center.x - this.hitRegionSize/2,
					y: planet.center.y - this.hitRegionSize/2
				};
				//console.log(rectPos.x + ' vs ' + this.mouse.x);
				if (
					this.mouse.x > rectPos.x && 
					this.mouse.x < rectPos.x + this.hitRegionSize &&
					this.mouse.y > rectPos.y && 
					this.mouse.y < rectPos.y + this.hitRegionSize
				) {
					this.hoverPlanet = planet;
					//console.log(this.hoverPlanet);
					break;
				}
			}
		}
		
		// Update planet info position
		if (this.activePlanet && this.planetInfo.is(':visible')) {
			// Hard-coded offsets
			this.planetInfo.css('left', this.activePlanet.center.x + 60);
			this.planetInfo.css('top', this.activePlanet.center.y - parseInt(this.planetInfo.css('height'))/2);
		}
	},
	
	draw: function() {
		
		if (!this.planetImg.complete) { return; }
		
		// Clear
		this.context.fillStyle = 'rgb(1,1,1)';
		this.context.fillRect(0, 0, this.width, this.height);
		
		// Background
		this.context.drawImage(this.backgroundCanvas, 0, 0, this.width, this.height, 0, 0, this.width, this.height);
		
		// Global center
		var center = {
			x: Math.floor(this.width / 2),
			y: Math.floor(this.height / 2)
		};
			
		// Planet orbits
		this.context.lineWidth = 1;
		for (var p=1 ; p<this.planets.length ; p++) {
			this.drawEllipseBezier(
				this.context,
				center.x, 
				center.y,
				p * this.planetDistance,
				p * this.planetDistance * this.orbitRatio,
				//this.orbitColor
				'#' + (7-p) + (7-p) + (7-p)
			);
		}
		
		// Planets
		for (var p=0 ; p<this.planets.length ; p++) {
			var planet = this.planets[p];
			if (!planet.canvas) { continue; }
			//console.log(planet.pos);
			//debugger;
			this.context.drawImage(
				planet.canvas,
				0,
				0,
				planet.canvas.width,
				planet.canvas.height,
				planet.pos.x,
				planet.pos.y,
				planet.canvas.width,
				planet.canvas.height
			);
		}
		
		// HitRegions
		if (this.activePlanet) {
			this.drawPlanetBrackets(
				this.context,
				this.activePlanet.center.x - this.hitRegionSize/2,
				this.activePlanet.center.y - this.hitRegionSize/2,
				1.0
			);
			
			
		}
		if (this.hoverPlanet && this.hoverPlanet != this.activePlanet) {
			this.drawPlanetBrackets(
				this.context,
				this.hoverPlanet.center.x - this.hitRegionSize/2,
				this.hoverPlanet.center.y - this.hitRegionSize/2,
				0.3
			);
			/*this.context.lineWidth = 2;
			this.context.strokeStyle = '#0f0';
			this.context.strokeRect(
				this.hoverPlanet.center.x - this.hitRegionSize/2,
				this.hoverPlanet.center.y - this.hitRegionSize/2,
				this.hitRegionSize,
				this.hitRegionSize
			);*/
		}
	},
	
	setPlanetInfo: function(planet) {
		this.planetInfo.find('.planetName').text(planet.name);
	},
	
	planetImgOnload: function() {
		this.createPlanetCanvases();
		//this.draw();
	},
	
	sortPlanets: function() {
		this.planets.sort(function(a, b) {
			return a.center.y > b.center.y;
		});
	},
	
	computePlanetPositions: function() {
		var center = {
			x: Math.floor(this.width / 2),
			y: Math.floor(this.height / 2)
		};
		
		for (var p=0 ; p<this.planets.length ; p++) {
			var planet = this.planets[p];
			
			if (planet.offset == undefined) {
				planet.offset = p * this.planetDistance;
			}
			
			// Start in the global center
			planet.pos = {x: center.x - this.planetCanvasSize/2, y: center.y - this.planetCanvasSize/2};
			planet.center = {x: center.x, y: center.y};
			
			if (planet.orbitSpeed > 0) {
				
				// Compute position
				var t = planet.orbitStart + planet.orbitSpeed * this.clock.delta();
				planet.curT = t;
				
				// Don't start at 90 degrees since planets can overlap
				/*var high = 3*Math.PI/2 + Math.PI/8;
				var low = 3*Math.PI/2 - Math.PI/8;
				while (t > low && t < high) {
					t = Math.random() * Math.PI * 2;
				}*/
				
				// Position on ellipse
				var ellipse = {
					x: planet.offset * Math.cos(t),
					y: planet.offset * this.orbitRatio * Math.sin(t)
				};
				
				planet.pos = {
					x: center.x + ellipse.x - this.planetCanvasSize/2,
					y: center.y + ellipse.y - this.planetCanvasSize/2
				};
				planet.center = {
					x: planet.pos.x + this.planetCanvasSize/2,
					y: planet.pos.y + this.planetCanvasSize/2
				};
			}
		}
	},
	
	createBackgroundCanvas: function() {
		
		this.backgroundCanvas = document.createElement('canvas');
		this.backgroundCanvas.width = this.width;
		this.backgroundCanvas.height = this.height;
		
		var context = this.backgroundCanvas.getContext('2d');
		
		// Clear
		context.fillStyle = 'rgb(0,0,0)';
		context.fillRect(0, 0, this.width, this.height);
		
		// Filaments (background)
		this.drawFilament(context);
		
		// 1x1 px stars
		for (var i=0 ; i<this.numStars ; i++) {
			var x = Math.floor(Math.random() * this.width);
			var y = Math.floor(Math.random() * this.height);
			context.fillStyle = 'rgb(230,230,230)';
			context.fillRect(x, y, 1, 1);
		}
		
		// 3x3 px stars
		for (var i=0 ; i<this.numStars ; i++) {
			var x = Math.floor(Math.random() * this.width);
			var y = Math.floor(Math.random() * this.height);
			context.fillStyle = 'rgb(230,230,230)';
			context.fillRect(x, y, 1, 1);
			context.fillStyle = 'rgb(110,160,110)';
			context.fillRect(x, y-1, 1, 1);
			context.fillRect(x-1, y, 1, 1);
			context.fillRect(x+1, y, 1, 1);
			context.fillRect(x, y+1, 1, 1);
		}
		
		// 5x5 px stars
		for (var i=0 ; i<this.numStars ; i++) {
			var x = Math.floor(Math.random() * this.width);
			var y = Math.floor(Math.random() * this.height);
			context.fillStyle = 'rgb(230,230,230)';
			context.fillRect(x, y, 1, 1);
			context.fillStyle = 'rgb(110,110,160)';
			context.fillRect(x, y-1, 1, 1);
			context.fillRect(x-1, y, 1, 1);
			context.fillRect(x+1, y, 1, 1);
			context.fillRect(x, y+1, 1, 1);
			context.fillStyle = 'rgb(50,50,80)';
			context.fillRect(x, y-2, 1, 1);
			context.fillRect(x-2, y, 1, 1);
			context.fillRect(x+2, y, 1, 1);
			context.fillRect(x, y+2, 1, 1);
		}
		
	},
	
	createPlanetCanvases: function(ctx, planet) {
		for (var p=0 ; p<this.planets.length ; p++) {
			var planet = this.planets[p];
			this.createPlanetCanvas(planet);
		}
	},
	
	createPlanetCanvas: function(planet) {
		
		// Create canvas/context
		planet.canvas = document.createElement('canvas');
		planet.canvas.width = this.planetCanvasSize;
		planet.canvas.height = this.planetCanvasSize;
		planet.context = planet.canvas.getContext('2d');
		
		planet.context.fillStyle = 'rgba(0,0,0,0)';
		planet.context.fillRect(0, 0, planet.canvas.width, planet.canvas.height);
		
		// Planet effects
		var effects = planet.effects || [];
		
		for (var e=0 ; e<effects.length ; e++) {
			var effect = effects[e];
			switch (effect.type) {
			case 'glow':
				this.drawPlanetGlow(
					planet.context,
					this.planetCanvasSize/2, 
					this.planetCanvasSize/2, 
					effect.radius, 
					effect.glowRadius, 
					effect.count, 
					effect.innerColor, 
					effect.outerColor
				);
				break;
			case 'particles':
				this.drawPlanetParticles(
					planet.context,
					this.planetCanvasSize/2, 
					this.planetCanvasSize/2, 
					effect.radius,
					effect.count, 
					effect.color
				);
				break;
			case 'flare':
				this.drawPlanetFlare(
					planet.context,
					this.planetCanvasSize/2, 
					this.planetCanvasSize/2, 
					effect.width,
					effect.height,
					effect.innerColor,
					effect.outerColor
				);
			default:
			}
		}
		
		// Planet image
		planet.context.drawImage(
			this.planetImg,
			planet.tileOffset * this.tilesize,
			0,
			this.tilesize,
			this.tilesize,
			this.planetCanvasSize/2 - this.tilesize/2,
			this.planetCanvasSize/2 - this.tilesize/2,
			this.tilesize,
			this.tilesize
		);
	},
	
	show: function(show) {
		show = show == undefined ? true : show;		// Default show
		if (show) {
			this.canvas.classList.remove('hidden');
		} else {
			this.canvas.classList.add('hidden');
			this.planetInfo.hide();
		}
	},
	
	setResolution: function(x, y) {
		this.width = x;
		this.height = y;
		this.canvas.width = x;
		this.canvas.height = y;
		//this.computePlanetPositions();
		//this.draw();
	},
	
	destroy: function() {
		//this.canvas.parentNode.removeChild(this.canvas);
		this.running = false;
		this.show(false);
	},
	
	drawPlanetBrackets: function(context, x, y, alpha) {
		if (!this.hitRegionImg.complete) { return; }
		
		var tmpAlpha = this.context.globalAlpha;
		context.globalAlpha = alpha;
		
		context.drawImage(
			this.hitRegionImg,
			0,
			0,
			this.hitRegionSize,
			this.hitRegionSize,
			x,
			y,
			this.hitRegionSize,
			this.hitRegionSize
		);
		
		context.globalAlpha = tmpAlpha;
	},
	
	drawEllipseBezier: function(context, cx, cy, rx, ry, stroke, fill) {
		
		var kappa = .5522848,
			ox = rx * kappa, // control point offset horizontal
			oy = ry * kappa, // control point offset vertical
			x = cx - rx,
			y = cy - ry,
			xe = cx + rx,           // x-end
			ye = cy + ry;           // y-end

		context.save();
		context.beginPath();
		context.moveTo(x, cy);
		context.bezierCurveTo(x, cy - oy, cx - ox, y, cx, y);
		context.bezierCurveTo(cx + ox, y, xe, cy - oy, xe, cy);
		context.bezierCurveTo(xe, cy + oy, cx + ox, ye, cx, ye);
		context.bezierCurveTo(cx - ox, ye, x, cy + oy, x, cy);
		if (stroke) {
			context.strokeStyle = stroke;
			context.stroke();
		}
		if (fill) {
			context.fillStyle = fill;
			context.fill();
		}
		context.restore();
	},
	
	drawPlanetGlow: function(context, x, y, r, dr, count, innerColor, outerColor) {
		context.save();
		
		for (var i=0 ; i<count ; i++) {
			
			var ang = 2 * Math.PI * Math.random();
			var len = r * Math.random();
			
			var gx = x + len * Math.cos(ang);
			var gy = y + len * Math.sin(ang);
			
			var gradient = context.createRadialGradient(gx, gy, 0, gx, gy, dr);
			gradient.addColorStop(0, innerColor);
			gradient.addColorStop(1, outerColor);
			
			context.globalCompositeOperation = 'lighter';
			
			context.beginPath();
			context.arc(gx, gy, dr, 0, 2 * Math.PI);
			context.fillStyle = gradient;
			context.fill();
			
		}
		
		context.restore();
	},
	
	drawPlanetParticles: function(context, x, y, r, count, style) {
		context.save();
		context.fillStyle = style;
		
		for (var i=0 ; i<count ; i++) {
			
			var ang = 2 * Math.PI * Math.random();
			var len = r * Math.random();
			
			context.fillRect(x + len * Math.cos(ang), y + len * Math.sin(ang), 2, 2);
		}
		context.restore();
	},
	
	drawPlanetFlare: function(context, x, y, width, height, innerColor, outerColor) {
		context.save();
		
		context.setTransform(width/height, 0, 0, 1, x-x*width/height, 0);
		
		var r = Math.max(width, height);
		
		var gradient = context.createRadialGradient(x, y, 0, x, y, r);
		gradient.addColorStop(0, innerColor);
		gradient.addColorStop(1, outerColor);
		
		context.globalCompositeOperation = 'lighter';
		
		context.beginPath();
		context.arc(x, y, r, 0, 2 * Math.PI);
		context.fillStyle = gradient;
		context.fill();
			
		
		context.restore();
	},
	
	drawFilament: function(context) {
		context.save();
		
		noise.seed(Math.random() * 9999999);
		
		var distance = 80;
		for (var y=-distance*2 ; y<this.height+distance*2 ; y+=distance) {
			for (var x=-distance*2 ; x<this.width+distance*2 ; x+=distance) {
			
				var n = noise.perlinFBM2(
					(x + 1) / this.width, 
					(y + 1) / this.width,
					'quintic', 
					1, 
					1, 
					4
				);
				
				if (Math.abs(n) < 0.14) {
					n = Math.abs(n);
					n = n < 0.0001 ? 0.0001 : n;
					
					var r = 340;
					
					var gradient = context.createRadialGradient(x, y, 0, x, y, r);
					gradient.addColorStop(0, 'rgba(19,27,69,' + n*0.8 + ')');
					gradient.addColorStop(1, 'rgba(0,0,0,0)');
					
					context.globalCompositeOperation = 'lighter';
					
					context.beginPath();
					context.arc(x, y, r, 0, 2 * Math.PI);
					context.fillStyle = gradient;
					context.fill();
				}
			}
		}
		
		context.restore();
	}

});

});