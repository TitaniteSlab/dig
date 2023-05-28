ig.module(
	'terra'
)
.requires(
	'jquery'
)
.defines(function() {

	window.terra = {
		
		getEl: function(el) {
			if (typeof el === 'string') {
				el = (el.trim().charAt(0) == '#') ? document.getElementById(el.substr(1)) : document.getElementById(el);
			}
			return el;
		},
		
		get$El: function(el) {
			return $(el);
		},
		
		debounce: function(fn, timeout) {
		   var timeoutID , timeout = timeout || 200;
		   return function () {
			  var scope = this , args = arguments;
			  clearTimeout( timeoutID );
			  timeoutID = setTimeout( function () {
				  fn.apply( scope , Array.prototype.slice.call( args ) );
			  } , timeout );
		   }
		},

		
		randInt: function(max) {
			return Math.round(Math.random() * max);
		},
		
		rotateVector2d: function(vec, angle) {
			return {
				x: vec.x * Math.cos(angle) - vec.y * Math.sin(angle),
				y: vec.x * Math.sin(angle) + vec.y * Math.cos(angle)
			};
		}
		
		
		
	};

});