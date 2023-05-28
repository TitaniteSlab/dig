ig.module(
	'game.ui.weapon-display'
)
.requires(
	'terra',
	'game.ui.weapon-chooser'
)
.defines(function() {

WeaponDisplay = ig.Class.extend({
	
	container: null,
	
	mount: 'top',
	chooser: null,
	
	sprite: null,
	spriteCvs: null,
	spriteCtx: null,
	
	reloading: false,
	maxAmmo: 6,
	curAmmo: 6,
	
	ammoTileOffset: 0,
	ammoTilesize: {
		x: 16,
		y: 30
	},
	
	init: function(container, opt) {
		
		this.container = terra.get$El(container);
		this.spriteCvs = this.container.find('.weaponImg').get(0);
		this.spriteCtx = this.spriteCvs.getContext('2d');
		
		this.weaponText = this.container.find('span.weaponText');
		this.ammoContainer = this.container.find('.weaponAmmo');
		
		this.mount = this.container.attr('data-mount');
		
		this.container.find('.weaponInfo').click($.proxy(function() {
			ig.game.weaponChooser.rebuildList(this.mount);
			ig.game.weaponChooser.show();
		}, this));
		
	},
	
	setSprite: function(sprite) {
		this.sprite = sprite;
		this.loadSpriteImage(this.sprite);
	},
	
	// Rebuilds DOM
	reset: function() {
		this.ammoContainer.empty();
		for (var i=0 ; i<this.maxAmmo ; i++) {
			var item = $('<div>', {
				"class": "ammoItem filled"
			})
			
			var posX = this.ammoTileOffset * this.ammoTilesize.x;
			var posY = 0;
			item.css('background-position', (-posX) + 'px ' + (-posY) + 'px');
			
			this.ammoContainer.append(item);
			/*if (i < this.curAmmo) {
				item.addClass('filled');
			}*/
		}
		
		this.ammoContainer.width(this.maxAmmo * this.ammoTilesize.x + this.maxAmmo * 4);
	},
	
	spendAmmo: function(amount) {
		amount = amount || 1;
		this.curAmmo -= amount;
		if (this.curAmmo <= 0) {
			this.curAmmo = this.maxAmmo;
			// reload anim
			//this.reloading = true;
			
			this.reset();		// Rebuilds DOM
		} else {
			var lastAmmo = this.ammoContainer.find('> .ammoItem.filled:last')
			
			var posX = this.ammoTileOffset * this.ammoTilesize.x;
			var posY = this.ammoTilesize.y;
			lastAmmo.css('background-position', (-posX) + 'px ' + (-posY) + 'px');
			lastAmmo.removeClass('filled');
		}
		
		//console.log('spent ammo; remaing: ' + this.curAmmo);
	},
	
	show: function(show) {
		show = show == undefined ? true : show;		// Default show
		if (show) {
			this.container.show();
		} else {
			this.container.hide();
		}
	},
	
	// Helper function to load a sprite object into the current item image. Uses a canvas for nearest-neighbor scaling (workaround).
	loadSpriteImage: function(sprite) {
		var sheet = ig.game.armory.weaponSheet;		// Reuse the sheet from Armory
		if (sheet.complete) {
			this.spriteCvs.width = sprite.size.x * 2;
			this.spriteCvs.height = sprite.size.y * 2;
			this.spriteCtx.imageSmoothingEnabled = false;
			this.spriteCtx.drawImage(
				sheet,
				sprite.pos.x, sprite.pos.y,
				sprite.size.x, sprite.size.y,
				0, 0,
				this.spriteCvs.width, this.spriteCvs.height
			);
		}
	}

});

});