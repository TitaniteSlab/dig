ig.module(
	'terra.ui.slide-panel'
)
.requires(
	'terra.ui'
)
.defines(function() {

terra.ui.SlidePanel = ig.Class.extend({
	
	container: null,
	side: 'left',
	size: {min: 38, max: 262},
	speed: 160,
	hideOnCollapse: false,
	expanded: false,
	
	init: function(container, opt) {
		
		this.container = terra.get$El(container);
		
		// Side from class
		if (this.container.hasClass('left')) {
			this.side = 'left';
		} else if (this.container.hasClass('top')) {
			this.side = 'top';
		} else if (this.container.hasClass('right')) {
			this.side = 'right';
		} else if (this.container.hasClass('bottom')) {
			this.side = 'bottom';
		}
		
		this.expand(false);
	},
	
	expand: function(expand) {
		this.expanded = expand == undefined ? true : expand;		// Default expand
		
		var toSize = this.expanded ? this.size.max : this.size.min;
		
		var propName;
		if (this.side == 'left' || this.side == 'right') {
			propName = 'width';
		} else {
			propName = 'height';
		}
		
		var animProps = {};
		animProps[propName] = toSize + 'px';
		
		if (this.expanded) {
			this.container.show();
		}
		
		this.container.animate(animProps, this.speed, $.proxy(function() {
			if (!this.expanded && this.hideOnCollapse) {
				this.container.hide();
			}
		}, this));
	}

});

});