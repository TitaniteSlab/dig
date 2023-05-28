ig.module(
	'game.ui.escape-menu'
)
.requires(
	'terra'
)
.defines(function() {

EscapeMenu = ig.Class.extend({
	
	container: null,
	
	init: function(container, opt) {
		this.container = terra.get$El(container);
		
		// Resume
		var closeButton = this.container.find('#closeEscapeMenu');
		closeButton.click($.proxy(function() {
			this.show(false);
		}, this));
		
		// Save/Quit
		var saveQuitButton = this.container.find('#saveAndQuitGame');
		saveQuitButton.click($.proxy(function() {
			this.show(false);
			//ig.game.saveGame();
			ig.game.quitGame();
		}, this));
	},
	
	show: function(show) {
		show = (show == undefined) ? true : show;		// Default show
		if (show) {
			this.container.show();
		} else {
			this.container.hide();
		}
	},
	
	toggleShow: function() {
		this.show(!this.container.is(':visible'));
	}

});

});