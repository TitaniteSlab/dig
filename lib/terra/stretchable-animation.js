ig.module(
	'terra.stretchable-animation'
)
.requires(
	'impact.animation',
	'impact.timer',
	'terra.stretchable-image' 
)
.defines(function(){ "use strict";

ig.StretchableAnimationSheet = ig.AnimationSheet.extend({
	width: 8,
	height: 8,
	image: null,
	
	init: function( path, width, height ) {
		this.width = width;
		this.height = height;
		
		this.image = new ig.StretchableImage( path );
	}
});



ig.StretchableAnimation = ig.Animation.extend({
	
	draw: function( targetX, targetY, targetWidth, targetHeight ) {
		var bbsize = Math.max(targetWidth, targetHeight);
		
		// On screen?
		if(
		   targetX > ig.system.width || targetY > ig.system.height ||
		   targetX + bbsize < 0 || targetY + bbsize < 0
		) {
			return;
		}
		
		if( this.alpha != 1) {
			ig.system.context.globalAlpha = this.alpha;
		}
		
		if( this.angle == 0 ) {		
			this.sheet.image.drawTile(
				targetX, targetY,
				this.tile, this.sheet.width, this.sheet.height,
				this.flip.x, this.flip.y,
				targetWidth, targetHeight
			);
		}
		else {
			ig.system.context.save();
			ig.system.context.translate(
				ig.system.getDrawPos(targetX + this.pivot.x),
				ig.system.getDrawPos(targetY + this.pivot.y)
			);
			ig.system.context.rotate( this.angle );
			this.sheet.image.drawTile(
				-this.pivot.x, -this.pivot.y,
				this.tile, this.sheet.width, this.sheet.height,
				this.flip.x, this.flip.y,
				targetWidth, targetHeight
			);
			ig.system.context.restore();
		}
		
		if( this.alpha != 1) {
			ig.system.context.globalAlpha = 1;
		}
	}
	
});

});