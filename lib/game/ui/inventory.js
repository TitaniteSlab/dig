ig.module(
	'game.ui.inventory'
)
.requires(
	'impact.impact',
	'game.item-defs',
	'game.weapon-defs',
	
	'terra.ui.slide-panel'
)
.defines(function() {

Inventory = ig.Class.extend({
	
	numItemSlots: 70,
	
	// Elements
	slidePanel: null,
	
	curOre: 0,
	curScrap: 0,
	
	curWeapons: [],
	
	// Testing starting items; load these later
	curItems: [{
		id: 'SmallRepairKit',
		count: 2
	},{
		id: 'LargeRepairKit',
		count: 2
	},{
		id: 'SmallFlare',
		count: 30
	},{
		id: 'LargeFlare',
		count: 30
	},{
		id: 'StickyFlare',
		count: 30
	}],
	
	init: function(container) {
		
		// Input
		ig.input.bind(ig.KEY._1, 'item1');
		ig.input.bind(ig.KEY._2, 'item2');
		ig.input.bind(ig.KEY._3, 'item3');
		ig.input.bind(ig.KEY._4, 'item4');
		ig.input.bind(ig.KEY._5, 'item5');
		ig.input.bind(ig.KEY._6, 'item6');
		ig.input.bind(ig.KEY._7, 'item7');
		ig.input.bind(ig.KEY._8, 'item8');
		ig.input.bind(ig.KEY._9, 'item9');
		ig.input.bind(ig.KEY._0, 'item0');
		
		// Elements
		this.container = terra.get$El(container);
		this.hotbarItemsContainer = this.container.find('#hotbar');
		this.itemsContainer = this.container.find('.inventoryItems');
		this.slidePanel = new terra.ui.SlidePanel(container);
		this.itemTooltipTemplate = terra.get$El('[data-template=itemTooltip]');
		this.itemTemplate = terra.get$El('[data-template=inventoryItem]');
		
		this.container.find('#hotbar').click($.proxy(function() { this.expand(!this.slidePanel.expanded) }, this));
		
		this.rebuildItemList();
	},
	
	update: function() {
		if (ig.input.pressed('item1')) {
			this.useItem(0);
		} else if (ig.input.pressed('item2')) {
			this.useItem(1);
		} if (ig.input.pressed('item3')) {
			this.useItem(2);
		} if (ig.input.pressed('item4')) {
			this.useItem(3);
		} if (ig.input.pressed('item5')) {
			this.useItem(4);
		} if (ig.input.pressed('item6')) {
			this.useItem(5);
		} if (ig.input.pressed('item7')) {
			this.useItem(6);
		} if (ig.input.pressed('item8')) {
			this.useItem(7);
		} if (ig.input.pressed('item9')) {
			this.useItem(8);
		} if (ig.input.pressed('item0')) {
			this.useItem(9);
		} 
	},
	
	addScrap: function(amt) {
		this.curScrap += amt;
		ig.game.resourceDisplay.setScrap(this.curScrap);
	},
	
	addOre: function(amt, type) {
		this.curOre += amt;
		ig.game.resourceDisplay.setOre(this.curOre);
	},
	
	addItem: function(itemId, count) {
		count = count || 1;
		
		// Find existing stack
		var item = this.findItemById(itemId);
		if (item) {
			item.count += count;
		} else {
			// TODO find inner slot
			this.curItems.push({ id: itemId, count: count });
		}
		
		this.rebuildItemList();
	},
	
	addWeapon: function(weaponId, mods) {
		this.curWeapons.push({ id: weaponId, mods: mods });
	},
	
	findFreeSlot: function() {
		
	},
	
	findItemById: function(itemId) {
		var invItem = null;
		for (var i=0 ; i<this.numItemSlots ; i++) {
			var item = this.curItems[i];
			if (item.id == itemId) {
				invItem = item;
				break;
			}
		}
		return invItem;
	},
	
	clearItemList: function() {
		this.hotbarItemsContainer.empty();
		this.itemsContainer.empty();
	},
	
	rebuildItemList: function() {
		this.clearItemList();
		
		for (var i=0 ; i<this.numItemSlots ; i++) {
			var data = this.curItems[i];
			
			var item = this.itemTemplate.clone();
			item.attr('data-slotnum', i);
			
			// First 10 go in hotbar
			var container = this.itemsContainer;
			if (i <= 9) {
				container = this.hotbarItemsContainer;
				//item.addClass('hotbarSlot');
				item.find('.hotbarSlotNum').text(i == 9 ? 0 : i+1);
			}
			
			if (data) {
				var itemDef = ItemDefs[data.id];
				
				item.attr('data-itemid', data.id);
				item.find('.itemCount').text(data.count > 0 ? data.count : '');
				
				// Image
				var itemImg = $('<div>');
				itemImg.addClass('itemImg');
				itemImg.css('background', 'url(' + itemDef.sprite.url + ') ' + (-itemDef.sprite.pos.x) + 'px ' + (-itemDef.sprite.pos.y) + 'px');
				item.prepend(itemImg);
				
				// Tooltip
				item.mouseenter($.proxy(function(evt) {
					itemDef = ItemDefs[$(evt.currentTarget).attr('data-itemid')];
					var content = this.itemTooltipTemplate;
					content.find('.itemName').text(itemDef.label);
					ig.game.tooltip.setContent(content);
					ig.game.tooltip.show();
				}, this));
				item.mouseleave(function() {
					ig.game.tooltip.show(false);
				});
				
				// Click/Use item
				/*item.click($.proxy(function() {
					this.useItem(data.id);
				}, this));*/
			}
			
			container.append(item);
		}
	},
	
	useItem: function(slotNum) {
		var data = this.curItems[slotNum];
		if (!data) { return; }
		
		var itemDef = ItemDefs[data.id];
		
		if (itemDef.consumable) {
			this.removeItemById(data.id)
		}
		
		itemDef.use(ig.game.player);
	},
	
	removeItemById: function(itemId, count) {
		count = count || 1;
		for (var i=this.numItemSlots-1 ; i>=0 ; i--) {
			var data = this.curItems[i];
			if (!data) { continue; }
			
			if (data.id == itemId) {
				data.count -= count;
				if (data.count <= 0) {
					console.log('removing item ' + i + ' completely');
					this.curItems[i] = undefined;
				}
				break;
			}
		}
		this.rebuildItemList();
	},
	
	show: function(show) {
		show = show == undefined ? true : show;		// Default show
		if (show) {
			this.container.show();
		} else {
			this.container.hide();
		}
	},
	
	expand: function(expand) {
		this.slidePanel.expand(expand);
	}
	
});


});