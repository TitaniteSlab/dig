ig.module(
	'terra.stretchable-image'
)
.requires(
	'impact.image'
)
.defines(function(){ "use strict";

ig.StretchableImage = ig.Image.extend({
	
	draw: function( targetX, targetY, sourceX, sourceY, width, height, targetWidth, targetHeight ) {
		if( !this.loaded ) { return; }
		
		var scale = ig.system.scale;
		sourceX = sourceX ? sourceX * scale : 0;
		sourceY = sourceY ? sourceY * scale : 0;
		width = (width ? width : this.width) * scale;
		height = (height ? height : this.height) * scale;
		targetWidth = (targetWidth ? targetWidth : this.width) * scale;
		targetHeight = (targetHeight ? targetHeight : this.height) * scale;
		
		ig.system.context.drawImage( 
			this.data, sourceX, sourceY, width, height,
			ig.system.getDrawPos(targetX), 
			ig.system.getDrawPos(targetY),
			targetWidth, targetHeight
		);
		
		ig.Image.drawCount++;
	},
	
	
	drawTile: function( targetX, targetY, tile, tileWidth, tileHeight, flipX, flipY, targetWidth, targetHeight ) {
		tileHeight = tileHeight ? tileHeight : tileWidth;
		
		if( !this.loaded || tileWidth > this.width || tileHeight > this.height ) { return; }
		
		var scale = ig.system.scale;
		var tileWidthScaled = Math.floor(tileWidth * scale);
		var tileHeightScaled = Math.floor(tileHeight * scale);
		var targetWidthScaled = Math.floor(targetWidth * scale);
		var targetHeightScaled = Math.floor(targetHeight * scale);
		
		var scaleX = flipX ? -1 : 1;
		var scaleY = flipY ? -1 : 1;
		
		if( flipX || flipY ) {
			ig.system.context.save();
			ig.system.context.scale( scaleX, scaleY );
		}
		ig.system.context.drawImage( 
			this.data, 
			( Math.floor(tile * tileWidth) % this.width ) * scale,
			( Math.floor(tile * tileWidth / this.width) * tileHeight ) * scale,
			tileWidthScaled,
			tileHeightScaled,
			ig.system.getDrawPos(targetX) * scaleX - (flipX ? targetWidthScaled : 0), 
			ig.system.getDrawPos(targetY) * scaleY - (flipY ? targetHeightScaled : 0),
			targetWidthScaled,
			targetHeightScaled
		);
		if( flipX || flipY ) {
			ig.system.context.restore();
		}
		
		ig.StretchableImage.drawCount++;
	}
});

ig.StretchableImage.drawCount = 0;
ig.StretchableImage.cache = {};
ig.StretchableImage.reloadCache = function() {
	for( var path in ig.StretchableImage.cache ) {
		ig.StretchableImage.cache[path].reload();
	}
};

});