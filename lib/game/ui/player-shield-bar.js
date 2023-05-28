ig.module(
	'game.ui.player-shield-bar'
)
.requires(
	'terra'
)
.defines(function() {

PlayerShieldBar = ig.Class.extend({
	
	container: null,
	
	reloading: false,
	_maxAmmo: 6,
	curAmmo: 6,
	
	ammoItemWidth: 10,
	
	init: function(container, opt) {
		
		this.container = terra.get$El(container);
		this.weaponImg = this.container.find('img.weaponImg');
		this.weaponText = this.container.find('span.weaponText');
		this.ammoContainer = this.container.find('.weaponAmmo');
	},
	
	setIconUrl: function(url) {
		this.iconUrl = url;
		this.weaponImg.attr('src', url);
	},
	
	setMaxAmmo: function(max) {
		this._maxAmmo = max;
		
		this.ammoContainer.empty();
		for (var i=0 ; i<this._maxAmmo ; i++) {
			var item = $('<div>', {
				"class": "ammoItem filled"
			})
			this.ammoContainer.append(item);
			/*if (i < this.curAmmo) {
				item.addClass('filled');
			}*/
		}
		
		this.ammoContainer.width(this._maxAmmo * this.ammoItemWidth);
	},
	
	spendAmmo: function(amount) {
		amount = amount || 1;
		this.curAmmo -= amount;
		if (this.curAmmo <= 0) {
			this.curAmmo = this._maxAmmo;
			// reload anim
			//this.reloading = true;
			
			this.setMaxAmmo(this._maxAmmo);		// Rebuilds DOM
		} else {
			this.ammoContainer.find('> .ammoItem.filled:last').removeClass('filled');
		}
	},
	
	show: function(show) {
		show = show == undefined ? true : show;		// Default show
		if (show) {
			this.container.show();
		} else {
			this.container.hide();
		}
	}

});

});