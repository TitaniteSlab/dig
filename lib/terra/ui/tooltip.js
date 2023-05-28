ig.module(
	'terra.ui.tooltip'
)
.requires(
	'terra.ui',
	'jquery'
)
.defines(function() {

terra.ui.Tooltip = ig.Class.extend({
	
	container: null,
	screenMargin: 20,
	mouseOffset: 20,
	visible: true,
	mouse: {x: 0, y: 0},
	
	init: function(opt) {
		
		this.container = $('<div>', {
			'class': 'taTooltip pxBorder2',
			'style': 'display: none;'
		});
		$(document.body).append(this.container);
		
		$(document.body).mousemove($.proxy(function(evt) {
			this.mouse.x = evt.clientX;
			this.mouse.y = evt.clientY;
			if (this.visible) {
				this.setPosition(this.mouse.x, this.mouse.y);
			}
		}, this));
	},
	
	setPosition: function(x, y) {
		this.container.css('left', x + this.mouseOffset);
		this.container.css('top', y + this.mouseOffset);
	},
	
	setContent: function(content) {
		this.container.empty();
		this.container.append(content);
	},
	
	show: function(show) {
		show = show == undefined ? true : show;		// Default show
		this.visible = show;
		if (show) {
			this.container.show();
		} else {
			this.container.hide();
		}
		this.setPosition(this.mouse.x, this.mouse.y);
		//console.log('tooltip show ' + show);
	}


});

});