ig.module(
	'game.ui.armory'
)
.requires(
	'terra',
	'terra.ui.radio-set',
	
	'game.item-defs',
	'game.weapon-defs'
)
.defines(function() {

Armory = ig.Class.extend({
	
	// Sprite sheet Images
	weaponSheet: new Image(),
	itemSheet: new Image(),
	
	// Main elements
	container: null,
	itemsContainer: null,
	itemTemplate: null,
	
	// Backing data for selected item
	curItemId: '',
	curItemType: null,
	curItemCount: 1,
	
	// Selected item elements
	itemInfo: null,
	curItemImgCvs: null,
	curItemImgCtx: null,
	curItemName: null,
	curItemDesc: null,
	
	// Items in stock
	stockItems: [
		{id: 'EnergyNode', count: 2},
		{id: 'SmallRepairKit', count: 5},
		{id: 'LargeRepairKit', count: 2},
		{id: 'ShipTeleporter', count: 1},
		{id: 'SmallFlare', count: 5}
	],
	
	// Weapons in stock
	stockWeapons: [
		{id: 'GatlingGun', count: 1},
		{id: 'Shotgun', count: 1},
		{id: 'GrenadeLauncher', count: 1},
		{id: 'LargeLaser', count: 1},
		{id: 'RocketLauncher', count: 1}
	],
	
	init: function(container, opt) {
		this.container = terra.get$El(container);
		this.itemsContainer = this.container.find('.itemList');
		this.itemTemplate = terra.get$El('[data-template=armoryListItem]');
		this.itemInfo = this.container.find('.itemInfo');
		this.itemProps = this.container.find('.itemProperties');
		this.itemPropTemplate = terra.get$El('[data-template=propTableRow]');
		
		this.curItemName = this.container.find('.itemInfo .itemName');
		this.curItemDesc = this.container.find('.itemInfo .itemDesc');
		
		this.curItemImgCvs = this.container.find('.itemInfo .itemImg').get(0);
		this.curItemImgCtx = this.curItemImgCvs.getContext('2d');
		this.weaponSheet.src = 'media/weapons1.png';
		this.itemSheet.src = 'media/items.png';
		//this.weaponSheet.onload = $.proxy(function() { console.log('weapon sheet loaded'); this.weaponSheetLoaded = true; }, this);
		//this.itemSheet.onload = $.proxy(function() { console.log('item sheet loaded'); this.itemSheetLoaded = true; }, this);
		
		this.buyButton = this.container.find('.itemButtons .buy');
		this.buyButton.click($.proxy(this.buyCurItem, this));
		this.sellButton = this.container.find('.itemButtons .sell');
		this.sellButton.click($.proxy(this.sellCurItem, this));
		
		this.radioSet = new terra.ui.RadioSet(this.container.find('.armoryRadioSet'), $.proxy(function(id) {
			if (id == 'buy') {
				this.rebuildBuyList();
			} else if (id == 'sell') {
				this.rebuildSellList();
			}
		}, this));
		
		this.container.find('.closeDialog').click($.proxy(function() {
			this.show(false);
		}, this));
		
		//this.rebuildBuyList();
		
		// Test add some list items
		/*this.addListItem('EnergyNode', 8);
		this.addListItem('EnergyNode');
		this.addListItem('EnergyNode');
		this.addListItem('EnergyNode');
		this.addListItem('EnergyNode');
		this.addListItem('EnergyNode');
		this.addListItem('EnergyNode');
		this.addListItem('EnergyNode');
		this.addListItem('EnergyNode');*/
	},
	
	show: function(show) {
		show = show == undefined ? true : show;		// Default show
		if (show) {
			this.container.show();
			this.rebuildBuyList();
		} else {
			this.container.hide();
		}
	},
	
	selectFirstListItem: function() {
		this.itemsContainer.children(':first').click();
	},
	
	rebuildBuyList: function() {
		this.clearListItems();
		
		// Add weapons
		for (var i=0 ; i<this.stockWeapons.length ; i++) {
			var weapon = this.stockWeapons[i];
			this.addListWeapon(weapon.id, weapon.count);
		}
		
		// Add items
		for (var i=0 ; i<this.stockItems.length ; i++) {
			var item = this.stockItems[i];
			this.addListItem(item.id, item.count);
		}
		
		this.selectFirstListItem();
	},
	
	rebuildSellList: function() {
		
	},
	
	// Remove all items from list
	clearListItems: function() {
		this.itemsContainer.empty();
	},
	
	// Add an item to the list
	addListItem: function(itemId, count) {
		count = count || 1;
		
		var data = ItemDefs[itemId];
		
		var item = this.itemTemplate.clone();
		item.show();
		item.attr('data-id', itemId);
		item.attr('data-type', Armory.ITEM_TYPE.ITEM);
		
		item.find('.itemName').text(data.label + ' (x' + count + ')');
		item.find('.itemCost').text(data.cost);
		
		var img = item.find('.listItemImg')
		img.css('background', 'url(' + data.sprite.url + ') ' + (-data.sprite.pos.x) + 'px ' + (-data.sprite.pos.y) + 'px');
		img.css('width', data.sprite.size.x);
		img.css('height', data.sprite.size.y);
		
		item.click($.proxy(function() {
			this.curItemType = Armory.ITEM_TYPE.ITEM;
			this.curItemId = itemId;
			this.curItemCount = count;
			
			this.itemInfo.attr('data-type', Armory.ITEM_TYPE.ITEM);
			
			var items = this.itemsContainer.find('.listItem').removeClass('selected');
			item.addClass('selected');
			
			this.curItemName.text(data.label);
			this.curItemDesc.text(data.desc);
			
			this.updateItemProperties(data.props);
			
			this.loadSpriteImage(data.sprite, this.itemSheet);
			
		}, this));
		
		this.itemsContainer.append(item);
	},
	
	// Add an item to the list
	addListWeapon: function(weaponId, count) {
		count = count || 1;
		
		var data = WeaponDefs[weaponId];
		
		var item = this.itemTemplate.clone();
		item.show();
		item.attr('data-id', weaponId);
		item.attr('data-type', Armory.ITEM_TYPE.WEAPON);
		
		item.find('.itemName').text(data.label + ' (x' + count + ')');
		item.find('.itemCost').text(data.cost);
		
		var img = item.find('.listItemImg')
		img.css('background', 'url(' + data.sprite.url + ') ' + (-data.sprite.pos.x) + 'px ' + (-data.sprite.pos.y) + 'px');
		img.css('width', data.sprite.size.x);
		img.css('height', data.sprite.size.y);
		
		item.click($.proxy(function() {
			this.curItemType = Armory.ITEM_TYPE.WEAPON;
			this.curItemId = weaponId;
			this.curItemCount = count;
			
			this.itemInfo.attr('data-type', Armory.ITEM_TYPE.WEAPON);
			
			var items = this.itemsContainer.find('.listItem').removeClass('selected');
			item.addClass('selected');
			
			this.curItemName.text(data.label);
			this.curItemDesc.text(data.desc);
			
			this.updateItemProperties(data.props);
			
			this.loadSpriteImage(data.sprite, this.weaponSheet);
			
		}, this));
		
		this.itemsContainer.append(item);
	},
	
	// Buys the currently selected item
	buyCurItem: function() {
		switch (this.curItemType) {
		case Armory.ITEM_TYPE.ITEM:
			this.removeStock(this.stockItems, this.curItemId, 1);
			ig.game.inventory.addItem(this.curItemId);
			break;
		case Armory.ITEM_TYPE.WEAPON:
			this.removeStock(this.stockWeapons, this.curItemId, 1);
			ig.game.inventory.addWeapon(this.curItemId);
			break;
		}
		
		
		this.rebuildBuyList();
	},
	
	// Sells the currently selected item
	sellCurItem: function() {
		
	},
	
	// Helper function to remove item(s) from a stock list
	removeStock: function(stockList, itemId, count) {
		count = count || 1;
		for (var i=stockList.length-1 ; i>=0 ; i--) {
			var stockItem = stockList[i];
			if (stockItem.id == itemId) {
				stockItem.count -= count;
				if (stockItem.count <= 0) {
					stockList.splice(i, 1);
				}
				break;
			}
		}
	},
	
	// Helper function to set item properties
	updateItemProperties: function(props) {		
		this.itemProps.empty();
		if (props) {
			for (var p in props) {
				var prop = this.itemPropTemplate.clone();
				
				prop.find('.propLabel').text(Armory.PROP_LABELS[p]);
				prop.find('.propValue').text(props[p]);
				
				this.itemProps.append(prop);
			}
		}
	},
	
	// Helper function to load a sprite object into the current item image. Uses a canvas for nearest-neighbor scaling (workaround).
	loadSpriteImage: function(sprite, sheet) {
		this.curItemImgCvs.width = sprite.size.x * 2;
		this.curItemImgCvs.height = sprite.size.y * 2;
		if (this.itemSheet.complete) {
			this.curItemImgCtx.imageSmoothingEnabled = false;
			this.curItemImgCtx.drawImage(
				sheet,
				sprite.pos.x, sprite.pos.y,
				sprite.size.x, sprite.size.y,
				0, 0,
				this.curItemImgCvs.width, this.curItemImgCvs.height
			);
		}
	}

});

Armory.ITEM_TYPE = {
	ITEM: 'item',
	WEAPON: 'weapon',
	MOD: 'mod',
	ATTACH: 'attach'
};

Armory.PROP_LABELS = {
	DMG: 'Damage',
	RTE: 'Fire Rate',
	ACC: 'Accuracy',
	RLD: 'Reload Speed',
	AMO: 'Max Ammo'
};

});