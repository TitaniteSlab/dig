ig.module(
	'game.ui.resource-display'
)
.requires(
	'terra'
)
.defines(function() {

ResourceDisplay = ig.Class.extend({
	
	container: null,
	scrapCount: null,
	oreCount: null,
	
	init: function(container, opt) {
		this.container = terra.get$El(container);
		this.oreCount = this.container.find('.resourceCount.ore');
		this.scrapCount = this.container.find('.resourceCount.scrap');
	},
	
	show: function(show) {
		show = show == undefined ? true : show;		// Default show
		if (show) {
			this.container.show();
		} else {
			this.container.hide();
		}
	},
	
	setOre: function(count) {
		this.oreCount.text(count);
	},
	
	setScrap: function(count) {
		this.scrapCount.text(count);
	}

});

});