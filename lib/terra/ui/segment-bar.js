ig.module(
	'terra.ui.segment-bar'
)
.requires(
	'terra.ui',
	'jquery'
)
.defines(function() {

terra.ui.SegmentBar = ig.Class.extend({
	
	container: null,
	segmentsContainer: null,
	
	numSegments: 3,
	curSegments: 3,
	
	padding: 2,
	
	init: function(container, opt) {
		
		ig.merge(this, opt);
		
		this.container = terra.get$El(container);
		this.segmentsContainer = this.container.find('.taSegments');
		
		this.curSegments = this.numSegments;
		
		this.rebuild();
	},
	
	setNumSegments: function(num) {
		this.numSegments = num;
		this.rebuild();
	},
	
	subtractSegments: function(num) {
		num = num || 1;
		this.curSegments -= num;
		
		if (this.curSegments > 0) {
			this.segmentsContainer.find('.taSegment.filled:last').removeClass('filled');
		}
	},
	
	rebuild: function() {
		
		// Computed segment size
		console.log(this.segmentsContainer.width());
		var segWidth = Math.floor((this.segmentsContainer.width() - 2 * this.padding * this.numSegments) / this.numSegments);
		
		this.segmentsContainer.empty();
		
		for (var i=0 ; i<this.numSegments ; i++) {
			var seg = $('<div>');
			seg.addClass('taSegment');
			
			seg.css('width', segWidth);
			seg.css('margin-left', this.padding + 'px');
			seg.css('margin-right', this.padding + 'px');
			
			if (i < this.curSegments) {
				seg.addClass('filled');
			}
			
			this.segmentsContainer.append(seg);
		}
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