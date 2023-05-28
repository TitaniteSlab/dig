ig.module(
	'game.ui.hotbar'
)
.requires(
	'terra'
)
.defines(function() {

Hotbar = ig.Class.extend({
	
	container: null,
	
	init: function(container, opt) {
		this.container = terra.get$El(container);
		
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