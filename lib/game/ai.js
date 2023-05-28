ig.module(
	'game.ai'
)
.requires(
	
)
.defines(function() {

AI = {
	
	// Mindless forward walk
	Walk: function(accel) {
		return function() {
			if (this.accel.x == 0) {
				this.accel.x = accel;
			} 
		};
	},
	
	// Sets aggro if within dist of ig.game.player
	// sets: aggro
	AggroPlayer: function(dist) {
		return function() {
			if (ig.game.player == null) { 
				this.aggro = false;
				return;
			}
			this.aggro = this.distanceTo(ig.game.player) <= dist;
		};
	},
	
	// Calls attack() if aggro; no debouncing!
	// requires: aggro
	AggroAttack: function() {
		return function() {
			if (this.aggro) {
				this.attack();
			}
		};
	},
	
	// Patrol walk; reverse x-accel if standing and zero x-vel while NOT aggro
	// requires: aggro
	Patrol: function(accel) {
		return function() {
			if (!this.aggro) {
				if (this.accel.x == 0) {
					this.accel.x = this.flip ? -accel : accel;
				} else if (this.standing && this.vel.x == 0) {
					this.accel.x = -this.accel.x;
				}
			}
		};
	},
	
	// Patrol walk; reverse x-accel if zero x-vel while NOT aggro
	// requires: aggro
	FlyPatrol: function(accel) {
		return function() {
			if (!this.aggro) {
				if (this.accel.x == 0) {
					this.accel.x = this.flip ? -accel : accel;
				} else if (this.vel.x == 0) {
					this.accel.x = -this.accel.x;
				}
			}
		};
	},
	
	// Set y-vel to vel if standing and zero x-vel while aggro
	// requires: aggro
	AggroJumpWhenStuck: function(vel) {
		return function() {
			if (this.aggro && this.standing && this.vel.x == 0) {
				this.vel.y = vel;
			}
		};
	},
	
	// Mindless walk to player if aggro
	// requires: aggro
	AggroWalkToPlayer: function(accel) {
		return function() {
			if (this.aggro) {
				if (ig.game.player.pos.x < this.pos.x) {
					this.flip = true;
					this.accel.x = -accel;
				} else {
					this.flip = false;
					this.accel.x = accel;
				}
			}
		};
	},
	
	AggroHoverAbovePlayer: function(targetHeight, accel) {
		return function() {
			if (this.aggro) {
				var height = ig.game.player.pos.y - this.pos.y;
				if (Math.abs(height - targetHeight) < targetHeight * 0.1) {
					this.accel.y = 0;
					this.vel.y = 0;
				} else {
					if (height < targetHeight) {
						this.accel.y = -accel;
					} else {
						this.accel.y = accel;
					}
				}
			} else {
				this.accel.y = 0;
				this.vel.y = 0;
			}
		};
	},
	
	// Spawn count of entityName entities
	SpawnEntity: function(entityName, count) {
		return function() {
			count = count || 1;
			for (var i=0 ; i<count ; i++) {
				var ent = ig.game.spawnEntity(entityName, this.center.x, this.center.y);
				ent.randomizeVelocity();
			}
		};
	},
	
	// Spawn count of entityName entities
	SpawnScrap: function(value, count) {
		return function() {
			count = count || 1;
			for (var i=0 ; i<count ; i++) {
				ig.game.spawnEntity('EntityScrap', this.center.x, this.center.y, {
					value: value
				});
			}
		};
	},
	
	// Spawn count of entityName entities
	SpawnParticles: function(style, count, size) {
		return function() {
			count = count || 1;
			size = size || {x: 1, y: 1};
			for (var i=0 ; i<count ; i++) {
				// Randomize particle location over entity sprite
				// TODO consider offset as well?
				var pos = {
					x: this.pos.x + Math.random().map(0, 1, 0, this.size.x),
					y: this.pos.y + Math.random().map(0, 1, 0, this.size.y)
				};
				var ent = ig.game.spawnEntity('EntityParticleRect', pos.x, pos.y, {
					fillStyle: style,
					size: size
				});
			}
		};
	},
	
	// Accelerates toward player at the given distance
	// Soft-kills when player is reached
	// Used for ore, items, scrap
	PlayerVacuum: function(dist, accel) {
		return function() {
			if (this.gravityFactor == 0) { return; }		// Quick hack to make entities non-vacuumable when fixed
			
			var player = ig.game.player;
			if (!player) { return; }
			
			var curDist = this.distanceTo(player);
			if (curDist <= dist) {
				this.doTrace = false;
				//this.gravityFactor = 0;
				
				var angle = this.angleTo(player);
				this.accel.x = accel * Math.cos(angle);
				this.accel.y = accel * Math.sin(angle);
				
				// Hard-coded 'collect' distance from player
				if (curDist <= 20) {
					this.kill();
				}
			}
		};
	},
	
	// Accelerates toward player; tracks player; used with regular collisions
	// Used for enemy projectiles
	PlayerHoming: function(accel) {
		return function() {
			var player = ig.game.player;
			if (!player) { return; }
			
			var angle = this.angleTo(player);
			this.angle = angle;
			this.accel.x = accel * Math.cos(angle);
			this.accel.y = accel * Math.sin(angle);
		};
	},
	
	// Accelerates toward initial player position; doesn't track player
	// Used for enemy projectiles
	// sets: trajectoryTarget
	PlayerTrajectory: function(accel) {
		return function() {
			if (!this.trajectoryTarget) {
				var player = ig.game.player;
				if (!player) { return; }
				
				this.trajectoryTarget = {
					x: player.center.x,
					y: player.center.y
				};
			}
			
			var dx = this.trajectoryTarget.x - this.center.x;
			var dy = this.trajectoryTarget.y - this.center.y;
			var angle = Math.atan2(dy, dx);
			this.accel.x = accel * Math.cos(angle);
			this.accel.y = accel * Math.sin(angle);
		};
	},
	
	// Hard kill if dist away from player
	PlayerDistanceLifetime: function(dist) {
		return function() {
			if (!ig.game.player) { return; }
			if (this.distanceTo(ig.game.player) > dist) { 
				this.killNow();
			}
		};
	},
	
	// Soft kill after time seconds
	// sets: lifeTimer
	TemporalLifetime: function(time) {
		return function() {
			if (!this.lifeTimer) {
				this.lifeTimer = new ig.Timer(time);
			} else if (this.lifeTimer.delta() > 0) {
				this.kill();
			}
		};
	},
	
	// Hard-kills if outside of TerrainManager's blocks currently loaded in impact
	// Generally used for terrain tile-bound entities like doodads and ore
	LoadedBlockLifetime: function() {
		return function() {
			var tm = ig.game.terrainManager;
			if (
				this.blockIndex.x < tm.curGlobalBlockIndex.x - tm.blockLoadDistance ||
				this.blockIndex.x > tm.curGlobalBlockIndex.x + tm.blockLoadDistance ||
				this.blockIndex.y < tm.curGlobalBlockIndex.y - tm.blockLoadDistance ||
				this.blockIndex.y > tm.curGlobalBlockIndex.y + tm.blockLoadDistance
			) {
				this.killNow();
			}
		};
	},
	
	FacePlayer: function() {
		return function() {
			if (!ig.game.player) { return; }
			if (this.center.x < ig.game.player.center.x) {
				this.flip = false;
			} else {
				this.flip = true;
			}
		}
	}
	
};

});