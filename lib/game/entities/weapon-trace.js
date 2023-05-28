ig.module(
	'game.entities.weapon-trace'
)
.requires(
	'impact.entity',
	'game.entities.weapon',
	'game.entities.projectile-trace-line',
	
	'polyk'
)
.defines(function() {

EntityWeaponTrace = EntityWeapon.extend({

	// Impact variables
	
	// Game variables
	
	init: function(x, y, weaponDef) {
		this.parent(x, y, weaponDef);
	},
	
	update: function() {
		this.parent();
	},
	
	fire: function() {
		this.parent();
		
		// Vector from pivot to projectileStart
		var vec = {
			x: this.projectileStart.x - this.pivot.x,
			y: this.projectileStart.y - this.pivot.y
		};
			
		// Compute projectile start position
		var traceStart;
		if (this.flip) {
			
			// Rotate
			//console.log(vec);
			//console.log(this.angle.toDeg());
			vec = terra.rotateVector2d(vec, -this.angle - Math.PI);
			//console.log(vec);
			
			traceStart = {
				x: this.pos.x + this.size.x - this.pivot.x - vec.x,
				y: this.pos.y + this.pivot.y + vec.y
			};
			
		} else {
		
			// Rotate
			//console.log(vec);
			//console.log(this.angle.toDeg());
			vec = terra.rotateVector2d(vec, this.angle);
			//console.log(vec);
			
			traceStart = {
				x: this.pos.x + this.pivot.x + vec.x,
				y: this.pos.y + this.pivot.y + vec.y
			};
		}
		//console.log(traceStart);
		
		for (var shot=0 ; shot < this.props.CNT ; shot++) {
			
			var v = 800;
			var rand = (Math.random() * 2) - 1;
			
			
			var angle = this.angle + rand * this.props.ACC / 2;
			//console.log('trace angle: ' + angle.toDeg());
			
			var traceVel = {
				x: v * Math.cos(angle),
				y: v * Math.sin(angle)
			};
			
			// Trace end, either entity or collision map
			var traceLength = 2000;
			
			// Check entity collisions
			var entityCollision = null;
			var collisions = this.checkEntities(traceStart, angle);
			
			//console.log('entities hit with trace: ' + collisions.length);
			
			// Get nearest collision
			if (collisions.length > 0) {
				var nearest = collisions[0];
				var curDistance = 2000;
				for (var c=0 ; c<collisions.length ; c++) {
					var col = collisions[c];
					//var distance = Math.sqrt(Math.pow(ent.center.x - traceStart.x, 2) + Math.pow(ent.center.y - traceStart.y, 2));
					if (col.dist < curDistance) {
						curDistance = col.dist;
						entityCollision = col;
					}
				}
				//console.log('entity trace collision; distance: ' + curDistance);
			}
			
			// Trace against collision map
			var trace = ig.game.collisionMap.trace(
				traceStart.x, traceStart.y, 
				traceVel.x, traceVel.y, 
				1, 1,
				true
			);
			
			if (entityCollision || trace.collision.x || trace.collision.y || trace.collision.slope) {
				
				// Terrain hit
				if (trace.collision.x || trace.collision.y || trace.collision.slope) {
					
					trace.pos.x += traceVel.x * ig.system.tick;
					trace.pos.y += traceVel.y * ig.system.tick;
					
					//console.log(traceStart);
					//console.log(trace.pos);
					
					// Get distance to hit tile
					var dx = trace.pos.x - traceStart.x;
					var dy = trace.pos.y - traceStart.y;
					//console.log('terrain trace length: ' + dx + ',' + dy);
					var traceDist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
					
					// If also entity hit, resolve nearest
					if (entityCollision) {
					
						//var edx = colEntity.center.x - traceStart.x;
						//var edy = colEntity.center.y - traceStart.y;
						//var entDist = Math.sqrt(Math.pow(edx, 2) + Math.pow(edy, 2));
						
						//console.log('distance to terrain: ' + traceDist);
						//console.log('distance to entity: ' + entDist);
						//console.log(colEntity.center);
						//console.log(traceStart);
						
						if (entityCollision.dist <= traceDist) {
							traceLength = entityCollision.dist;
							entityCollision.entity.receiveDamage(this.damage);
						} else {
							traceLength = traceDist;
							
							var index = ig.game.terrainManager.mapIndexToGlobalIndex(trace.tileIndex.x, trace.tileIndex.y);
							ig.game.terrainManager.damageTileAtIndex(
								index.x, 
								index.y,
								this.terrainDamage
							);
						}
					} 
					// Only terrain hit
					else {
						traceLength = traceDist;
						
						var index = ig.game.terrainManager.mapIndexToGlobalIndex(trace.tileIndex.x, trace.tileIndex.y);
						ig.game.terrainManager.damageTileAtIndex(
							index.x, 
							index.y,
							this.terrainDamage
						);
					}
				} 
				// Only entity hit
				else if (entityCollision) {
					traceLength = entityCollision.dist;
					entityCollision.entity.receiveDamage(this.damage, this);
				}
				
				// Tracer entity
				ig.game.spawnEntity('EntityProjectileTraceLine', traceStart.x, traceStart.y, {
					angle: angle,
					length: traceLength
				});
				//console.log('trace tile: ' + trace.tileIndex.x + ',' + trace.tileIndex.y);
				
			}
		}
	},
	
	// Angular
	checkEntities: function(pos, angle) {
		var collisions = [];
		for(var e = 0; e < ig.game.entities.length; e++) {
			var ent = ig.game.entities[e];
			if (ent == this) { continue; }
			
			// Skip anything that isn't an active collision enemy (type B that collides with type A)
			if(
				ent.type != ig.Entity.TYPE.B ||
				!ent.enemy
			) {
				continue;
			}
			
			// Clockwise starting from bottom right
			// Note this is technically counter-clockwise since the y-axis is flipped
			var vertices = [
				ent.pos.x + ent.size.x, 	ent.pos.y + ent.size.y,
				ent.pos.x, 					ent.pos.y + ent.size.y,
				ent.pos.x, 					ent.pos.y,
				ent.pos.x + ent.size.x, 	ent.pos.y
			];
			
			var res = PolyK.Raycast(
				vertices, 
				pos.x, 
				pos.y,
				9999*Math.cos(angle),
				9999*Math.sin(angle)
			);

			//console.log(res);
			
			if (res) {
				res.entity = ent
				collisions.push(res);
			}
			
			/* Bad algorithm below
			
			var vertices = [
				{x: ent.pos.x, y: ent.pos.y},
				{x: ent.pos.x + ent.size.x, y: ent.pos.y},
				{x: ent.pos.x, y: ent.pos.y + ent.size.y},
				{x: ent.pos.x + ent.size.x, y: ent.pos.y + ent.size.y}
			];
			
			//console.log('new check');
			
			var lessThan = undefined;
			for (var i=0 ; i<vertices.length ; i++) {
				var v = vertices[i];
				
				var angleTo = Math.atan2(v.y - pos.y, v.x - pos.x);
				angleTo = angleTo < 0 ? 2*Math.PI + angleTo : angleTo;
				
				//console.log(angleTo.toDeg() + ' vs ' + angle.toDeg());
				// Skip entities behind the trace
				//if (angleTo - angle > Math.PI/2) { continue; }
				
				// Hitting a vertex is a collision
				if (angle == angleTo) {
					colEntities.push(ent);
					break;
				}
				
				// Rotating more than PI is a collision (close or inside)
				/*if (Math.abs(angle - angleTo) >= Math.PI) {
					colEntities.push(ent);
					break;
				}*
				
				// Collide if we crossed a vertex
				//console.log('prev lessThan: ' + lessThan);
				//console.log('cur lessThan: ' + (angleTo < angle));
				if (lessThan == undefined) {
					lessThan = angleTo < angle;
				} else if (lessThan != (angleTo < angle)) {
					colEntities.push(ent);
					break;
				}
			}*/
		}
		return collisions;
	}

});

});