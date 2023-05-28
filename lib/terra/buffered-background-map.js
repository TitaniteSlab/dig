ig.module(
	'terra.buffered-background-map'
)
.requires(
	'terra',
	'impact.background-map'
)
.defines(function(){ "use strict";

terra.BufferedBackgroundMap = ig.BackgroundMap.extend({	
	screen: {x: 0, y: 0},
	_retile: true,
	buffer: ig.$new('canvas'),
	bufferContext: null,
	lightingEnabled: false,
	
	init: function( tilesize, data, tileset ) {
		this.parent( tilesize, data, tileset );
		
		this.bufferContext = this.buffer.getContext('2d');
		ig.System.scaleMode(this.buffer, this.bufferContext);
	},
	
	setScreenPos: function( x, y ) {
		if (this.screen.x != x || this.screen.y != y) {
			this._retile = true;
		}
		this.screen = {x: x, y: y};
		
		this.parent(x, y);
	},
	
	drawTiled: function() {	
		
		if (this._retile) {
		
			var tile = 0,
				anim = null,
				tileOffsetX = (this.scroll.x / this.tilesize).toInt(),
				tileOffsetY = (this.scroll.y / this.tilesize).toInt(),
				pxOffsetX = this.scroll.x % this.tilesize,
				pxOffsetY = this.scroll.y % this.tilesize,
				pxMinX = -pxOffsetX - this.tilesize,
				pxMinY = -pxOffsetY - this.tilesize,
				pxMaxX = ig.system.width + this.tilesize - pxOffsetX,
				pxMaxY = ig.system.height + this.tilesize - pxOffsetY;
			
		
			this.buffer.width = ig.system.width * ig.system.scale;
			this.buffer.height = ig.system.height * ig.system.scale;
			
			var screenContext = ig.system.context;
			ig.system.context = this.bufferContext;
			
			ig.system.clear('rgba(0,0,0,0)');
			
			
			// FIXME: could be sped up for non-repeated maps: restrict the for loops
			// to the map size instead of to the screen size and skip the 'repeat'
			// checks inside the loop.
			for( var mapY = -1, pxY = pxMinY; pxY < pxMaxY; mapY++, pxY += this.tilesize) {
				var tileY = mapY + tileOffsetY;
					
				// Repeat Y?
				if( tileY >= this.height || tileY < 0 ) {
					if( !this.repeat ) { continue; }
					tileY = (tileY%this.height + this.height) % this.height;
				}
				
				for( var mapX = -1, pxX = pxMinX; pxX < pxMaxX; mapX++, pxX += this.tilesize ) {
					var tileX = mapX + tileOffsetX;
					
					// Repeat X?
					if( tileX >= this.width || tileX < 0 ) {
						if( !this.repeat ) { continue; }
						tileX = (tileX%this.width + this.width) % this.width;
					}
					
					// Draw!
					tile = this.data[tileY][tileX];
					
					if (tile > 0) {
						// Lighting thrown in here; consider refactoring this into a new subclass perhaps?
						var brightness = 1;
						
						if (this.lightingEnabled) {
							//var gt = ig.game.terrainManager.mapIndexToGlobalIndex(tileX, tileY);
							brightness = ig.game.lighting.data[tileY][tileX];
						}
						
						if (brightness != undefined && brightness != 0) {
						
							if( (anim = this.anims[tile-1]) ) { 
								anim.draw( this.offset.x + pxX, this.offset.y + pxY );
								//ig.game.font.draw(pxX, pxX, pxY);
							}
							else {
								this.tiles.drawTile( pxX, pxY, tile-1, this.tilesize );
								//ig.game.font.draw(pxX + ":" + pxY, pxX, pxY);
							}
						}
					}
				} // end for x
			} // end for y
			
			ig.system.context = screenContext;
			
			this._retile = false;
		}
		
		ig.system.context.drawImage(this.buffer, 0, 0);
	}
});

});