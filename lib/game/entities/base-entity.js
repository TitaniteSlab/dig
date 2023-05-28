ig.module(
	'game.entities.base-entity'
)
.requires(
	'impact.entity'
)
.defines(function() {

BaseEntity = ig.Entity.extend({
	
	center: {x: 0, y: 0},
	doTrace: true,
	flip: false,
	
	init: function(x, y, settings) {
		this.parent(x, y, settings);
		this.center = {
			x: this.pos.x + this.size.x/2,
			y: this.pos.y + this.size.y/2
		};
	},
	
	update: function() {
	
		this.last.x = this.pos.x;
		this.last.y = this.pos.y;
		this.vel.y += ig.game.gravity * ig.system.tick * this.gravityFactor;
		
		this.vel.x = this.getNewVelocity( this.vel.x, this.accel.x, this.friction.x, this.maxVel.x );
		this.vel.y = this.getNewVelocity( this.vel.y, this.accel.y, this.friction.y, this.maxVel.y );
		
		// We don't need to trace entities that don't collide with terrain
		if (this.doTrace) {
			var mx = this.vel.x * ig.system.tick;
			var my = this.vel.y * ig.system.tick;
			var res = ig.game.collisionMap.trace( 
				this.pos.x, this.pos.y, mx, my, this.size.x, this.size.y
			);
			this.handleMovementTrace( res );
		} else {
			this.pos.x += this.vel.x * ig.system.tick;
			this.pos.y += this.vel.y * ig.system.tick;
		}
		
		this.center.x = this.pos.x + this.size.x/2;
		this.center.y = this.pos.y + this.size.y/2;
		
		if( this.currentAnim ) {
			this.currentAnim.update();
		}
		
	},
	
	// 'Soft Kill' behavior to be overwritten (play anim or sound, spawn particles, etc)
	kill: function() {
		this.killNow();
	},
	
	// 'Hard Kill' removes entity from game immediately
	// Remember to implement this, since some of the AI behaviors call it instead of kill()
	killNow: function() {
		ig.game.removeEntity(this);
	},
	
	randomizeVelocity: function() {
		this.vel.x = Math.random() * this.vel.x;
		this.vel.y = Math.random() * this.vel.y;
	},
	
	centerify: function() {
		this.pos.x -= this.size.x / 2;
		this.pos.y -= this.size.y / 2;
	}
	
});

// Flawed circle-rectangle collision routine (only checks if vertices are in circle)
BaseEntity.collideRadial = function(entity, radius) {
	var pos = entity.center;
	var colEntities = [];
	for(var e=0 ; e<ig.game.entities.length ; e++) {
		var other = ig.game.entities[e];
		if (other == entity) { continue; }
		
		// Skip anything that isn't an active collision enemy (type B that collides with type A)
		if(
			!other.enemy ||
			other.type != ig.Entity.TYPE.B
		) {
			continue;
		}
		
		var vertices = [
			{x: other.pos.x, y: other.pos.y},
			{x: other.pos.x + other.size.x, y: other.pos.y},
			{x: other.pos.x, y: other.pos.y + other.size.y},
			{x: other.pos.x + other.size.x, y: other.pos.y + other.size.y}
		];
		
		for (var i=0 ; i<vertices.length ; i++) {
			var v = vertices[i];
			
			var distanceTo = Math.sqrt(Math.pow(v.y - pos.y, 2) + Math.pow(v.x - pos.x, 2));
			
			// Inside circle radius collision
			if (distanceTo <= radius) {
				colEntities.push(other);
				break;
			}
		}
	}
	return colEntities;
};

});