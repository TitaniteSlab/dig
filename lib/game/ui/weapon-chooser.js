ig.module(
	'game.ui.weapon-chooser'
)
.requires(
	'terra',
	'game.weapon-defs'
)
.defines(function() {

WeaponChooser = ig.Class.extend({
	
	container: null,
	curMount: null,
	
	init: function(container, opt) {
		this.container = terra.get$El(container);
		//this.weaponList = this.container.find('.weaponList');
		this.weaponItemTemplate = terra.get$El('[data-template=weaponChooserItem]');
	},
	
	rebuildList: function(mount) {
		this.container.empty();
		
		for (var w=0 ; w<ig.game.inventory.curWeapons.length ; w++) {
			var weaponData = ig.game.inventory.curWeapons[w];
			var weaponDef = WeaponDefs[weaponData.id];
			//var mods...
			
			// TODO continue? if weapon is equipped
			
			if (mount && weaponDef.mount != mount) { continue; }
			this.curMount = mount;
			
			var el = this.weaponItemTemplate.clone();
			
			el.find('.weaponName').text(weaponDef.label);
			
			// Image canvas setup
			var sheet = ig.game.armory.weaponSheet;		// Reuse the sheet from Armory
			if (sheet.complete) {
				var cvs = el.find('.weaponImg').get(0);
				cvs.width = weaponDef.sprite.size.x * 2;
				cvs.height = weaponDef.sprite.size.y * 2;
				
				var ctx = cvs.getContext('2d');
				ctx.imageSmoothingEnabled = false;
				ctx.drawImage(
					sheet,
					weaponDef.sprite.pos.x, weaponDef.sprite.pos.y,
					weaponDef.sprite.size.x, weaponDef.sprite.size.y,
					0, 0,
					cvs.width, cvs.height
				);
			}
			//cvs.css('background', 'url(' + weaponDef.sprite.url + ') ' + (-weaponDef.sprite.pos.x) + 'px ' + (-weaponDef.sprite.pos.y) + 'px');
			//cvs.css('width', weaponDef.sprite.size.x);
			//cvs.css('height', weaponDef.sprite.size.y);
			
			el.click($.proxy(function() {
				this.onWeaponClick(weaponData.id);
				this.show(false);
			}, this));
			
			this.container.append(el);
		}
		
	},
	
	onWeaponClick: function(weaponId) {
		ig.game.player.setWeapon(weaponId);
	},
	
	show: function(show) {
		show = show == undefined ? true : show;		// Default show
		if (show) {
			this.container.show();
			var thisClick = true;
			$(document.body).click($.proxy(function() {
				if (!thisClick) {
					this.show(false);
				}
				thisClick = false;
				$(document.body).off('click');
			}, this));
			
		} else {
			this.container.hide();
		}
	}

});

});