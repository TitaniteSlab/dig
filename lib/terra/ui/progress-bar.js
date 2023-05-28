ig.module(
	'terra.ui.progress-bar'
)
.requires(
	'terra.ui',
	'jquery'
)
.defines(function() {

terra.ui.ProgressBar = ig.Class.extend({
	
	container: null,
	center: null,
	text: null,
	
	init: function(container, opt) {
		
		this.container = terra.get$El(container);
		this.center = this.container.find('.taProgressBarCenter');
		this.text = this.container.find('.taProgressBarText');
	},
	
	setPercent: function(pct) {
		this.center.css('width', pct + '%');
	},
	
	setText: function(text) {
		this.text.text(text);
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