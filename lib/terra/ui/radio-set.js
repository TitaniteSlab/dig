ig.module(
	'terra.ui.radio-set'
)
.requires(
	'terra.ui',
	'jquery'
)
.defines(function() {

terra.ui.RadioSet = ig.Class.extend({
	
	container: null,
	
	init: function(container, callback, opt) {
		
		this.container = terra.get$El(container);
		
		var buttons = this.container.find('button');
		buttons.click(function(evt) {
			var button = $(evt.currentTarget);
			if (button.hasClass('selected')) { return; }
			buttons.removeClass('selected');
			button.addClass('selected');
			callback(button.attr('data-id'));
		});
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