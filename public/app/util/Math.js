Ext.define('NU.util.Math', {
	// TODO: parameterize dependencies
	metaball: function () {
		this.addHistory();
		var size = Math.pow(2, this.self.LutBitsPerColor);
		var pointCloud = [];
		var lut = this.getLookup();
		var target = this.getTarget();
		var typeId = this.self.Target[target];
		var bounds = {
			y: {
				min: Infinity,
				max: -Infinity
			},
			cb: {
				min: Infinity,
				max: -Infinity
			},
			cr: {
				min: Infinity,
				max: -Infinity
			}
		};

		for (var y = 0; y < size; y++) {
			for (var cb = 0; cb < size; cb++) {
				for (var cr = 0; cr < size; cr++) {
					var index = (y << 14) + (cb << 7) + cr; // TODO: probably method this
					if (lut[index] == typeId) {
						var point = [y, cb, cr];
						pointCloud.push(point);
						if (y > bounds.y.max) {
							bounds.y.max = y;
						}
						if (y < bounds.y.min) {
							bounds.y.min = y;
						}
						if (cb > bounds.cb.max) {
							bounds.cb.max = cb;
						}
						if (cb < bounds.cb.min) {
							bounds.cb.min = cb;
						}
						if (cr > bounds.cr.max) {
							bounds.cr.max = cr;
						}
						if (cr < bounds.cr.min) {
							bounds.cr.min = cr;
						}
					}
				}
			}
		}

		var threshold = 2;
		var a = 2;

		for (var y = bounds.y.min; y <= bounds.y.max; y++) {
			for (var cb = bounds.cb.min; cb <= bounds.cb.max; cb++) {
				for (var cr = bounds.cr.min; cr <= bounds.cr.max; cr++) {
					var point = [y, cb, cr];
					var sum = 0;
					for (var i = 0; i < pointCloud.length; i++) {
						var targetPoint = pointCloud[i];
						var dist = Math.sqrt(Math.pow(point[0] - targetPoint[0], 2) + Math.pow(point[1] - targetPoint[1], 2) + Math.pow(point[2] - targetPoint[2], 2));
						sum += Math.exp(-a * (dist - 1));
					}
					if (sum >= threshold) {
						var index = (y << 14) + (cb << 7) + cr; // TODO: probably method this
						lut[index] = typeId;
					}
				}
			}
		}

		this.updateClassifiedData();
	},
	isPointInConvexHull: function (point, pointCloud) {
		return !this.isLinearlySeparable(pointCloud, [point]);
	},
	isLinearlySeparable: function (A, B) {
		// ported from: http://www.joyofdata.de/blog/testing-linear-separability-linear-programming-r-glpk/
		var num = numeric;
		var N1 = A.length;
		var N2 = B.length;
		if (N1 <= 0 || N2 <= 0) {
			return undefined;
		}
		var DIM = A[0].length;
		var P = num.clone(A).concat(num.clone(B));
		P.forEach(function (row, i) {
			row.push(i < N1 ? 1 : -1);
		});
		var b1 = num.rep([DIM], -1).concat([1]);
		var b2 = num.rep([DIM], 1).concat([1]);
		var M = num.rep([N1], b1).concat(num.rep([N2], b2));
		var A = num.mul(P, M);
		var obj = num.rep([DIM + 1], 0);
		var b = num.rep([N1 + N2], -1);
		var r = num.solveLP(obj, A, b);
		if (r.message !== "") {
			return false;
		} else {
			return true;
		}
	},
	convexHull3: function () {
		this.addHistory();
		var size = Math.pow(2, this.self.LutBitsPerColor);
		var pointCloud = [];
		var lut = this.getLookup();
		var target = this.getTarget();
		var typeId = this.self.Target[target];
		var bounds = {
			y: {
				min: Infinity,
				max: -Infinity
			},
			cb: {
				min: Infinity,
				max: -Infinity
			},
			cr: {
				min: Infinity,
				max: -Infinity
			}
		};

		var lower_left_point = null;
		for (var y = 0; y < size; y++) {
			for (var cb = 0; cb < size; cb++) {
				for (var cr = 0; cr < size; cr++) {
					var index = (y << 14) + (cb << 7) + cr; // TODO: probably method this
					if (lut[index] == typeId) {
						var point = [y, cb, cr];
						pointCloud.push(point);
						if (lower_left_point === null) {
							lower_left_point = point;
						}
						if (y > bounds.y.max) {
							bounds.y.max = y;
						}
						if (y < bounds.y.min) {
							bounds.y.min = y;
						}
						if (cb > bounds.cb.max) {
							bounds.cb.max = cb;
						}
						if (cb < bounds.cb.min) {
							bounds.cb.min = cb;
						}
						if (cr > bounds.cr.max) {
							bounds.cr.max = cr;
						}
						if (cr < bounds.cr.min) {
							bounds.cr.min = cr;
						}
					}
				}
			}
		}

		var left_point = lower_left_point;
		var right_point = left_point;
		var left = true;
		var cr_min = bounds.cr.min;
		var cr_max = bounds.cr.max;

		console.log('lower_left', lower_left_point);
		console.log('bounds', bounds.y, bounds.cb, bounds.cr);
		for (var y = bounds.y.min; y <= bounds.y.max; y++) {
			left_point[0] = y;
			right_point[0] = y;
			for (var cb = bounds.cb.min; cb <= bounds.cb.max; cb++) {
				left_point[1] = cb;
				right_point[1] = cb;
				// left
				var inHull = this.isPointInConvexHull(left_point, pointCloud);
				if (inHull) {
					// left until out +1
					if (left_point[2] !== cr_min) {
						do {
							left_point[2]--;
						} while (left_point[2] !== cr_min && this.isPointInConvexHull(left_point, pointCloud))
						if (left_point[2] !== cr_min) {
							left_point[2]++;
						}
					}
				} else {
					// right until in
					do {
						left_point[2]++;
					} while (left_point[2] !== cr_max && !this.isPointInConvexHull(left_point, pointCloud))
				}
				// right
				var inHull = this.isPointInConvexHull(right_point, pointCloud);
				if (inHull) {
					// right until out -1
					if (right_point[2] !== cr_max) {
						do {
							right_point[2]++;
						} while (right_point[2] !== cr_max && this.isPointInConvexHull(right_point, pointCloud))
						if (right_point[2] !== cr_max) {
							right_point[2]--;
						}
					}
				} else {
					// left until in
					do {
						right_point[2]--;
					} while (right_point[2] !== cr_min && !this.isPointInConvexHull(right_point, pointCloud))
				}

				console.log(y, cb, 'left', left_point, 'right', right_point);
			}
			break;
		}
	},
	convexHull2: function () {
		this.addHistory();
		var size = Math.pow(2, this.self.LutBitsPerColor);
		var pointCloud = [];
		var lut = this.getLookup();
		var target = this.getTarget();
		var typeId = this.self.Target[target];
		var bounds = {
			y: {
				min: Infinity,
				max: -Infinity
			},
			cb: {
				min: Infinity,
				max: -Infinity
			},
			cr: {
				min: Infinity,
				max: -Infinity
			}
		};

		for (var y = 0; y < size; y++) {
			for (var cb = 0; cb < size; cb++) {
				for (var cr = 0; cr < size; cr++) {
					var index = (y << 14) + (cb << 7) + cr; // TODO: probably method this
					if (lut[index] == typeId) {
						pointCloud.push([y, cb, cr]);
						if (y > bounds.y.max) {
							bounds.y.max = y;
						}
						if (y < bounds.y.min) {
							bounds.y.min = y;
						}
						if (cb > bounds.cb.max) {
							bounds.cb.max = cb;
						}
						if (cb < bounds.cb.min) {
							bounds.cb.min = cb;
						}
						if (cr > bounds.cr.max) {
							bounds.cr.max = cr;
						}
						if (cr < bounds.cr.min) {
							bounds.cr.min = cr;
						}
					}
				}
			}
		}

		console.log(bounds);
		for (var y = bounds.y.min; y <= bounds.y.max; y++) {
			var found = false;
			for (var cb = bounds.cb.min; cb <= bounds.cb.max; cb++) {
				var cr_min = bounds.cr.min;
				var cr_max = bounds.cr.max;
				var width = cr_max - cr_min + 1; // +1 as end points inclusive
				// grid search for starting point
				var cr = null;
				var cache = {};
				for (var n = 1; n <= width; n++) {
					var cr_values = numeric.round(numeric.linspace(cr_min, cr_max, n));
					cr_values.forEach(function (cr_test) {
						var point = [y, cb, cr_test];
						if (cache[cr_test] !== false && this.isPointInConvexHull(point, pointCloud)) {
							cr = cr_test;
							return false;
						} else {
							cache[cr_test] = false;
						}
					}, this);
					if (cr !== null) {
						found = true;
						break;
					}
				}
				if (cr === null) {
					// not found on this slice
					continue;
				}
				var point = [y, cb, cr];

//				console.log('found', point);

				var cr_in_min = null;
				var cr_in_max = null;

				var cr_min = bounds.cr.min;
				var cr_max = cr;

				while (cr_max >= cr_min) {
					var cr_mid = Math.round((cr_max + cr_min) / 2);
					var point = [y, cb, cr_mid];
					var inHull = this.isPointInConvexHull(point, pointCloud);
					if (!inHull) {
						var point2 = [y, cb, cr_mid + 1];
						var inHull2 = this.isPointInConvexHull(point2, pointCloud);
						if (inHull2) {
							// boundary point
//							console.log('left boundary point', point2);
							cr_in_min = point2[2];
							break;
						} else {
							// on the right
							cr_min = cr_mid + 1;
						}
					} else if (cr_mid === 0 || cr_mid === bounds.cr.max) {
//						console.log('left boundary point', point);
						cr_in_min = point[2];
						break;
					} else {
						// on the left
						cr_max = cr_mid - 1;
					}
				}

				var cr_min = cr;
				var cr_max = bounds.cr.max;

				while (cr_max >= cr_min) {
					var cr_mid = Math.round((cr_max + cr_min) / 2);
					var point = [y, cb, cr_mid];
					var inHull = this.isPointInConvexHull(point, pointCloud);
					if (!inHull) {
						var point2 = [y, cb, cr_mid - 1];
						var inHull2 = this.isPointInConvexHull(point2, pointCloud);
						if (inHull2) {
							// boundary point
//							console.log('right boundary point', point);
							cr_in_max = point[2];
							break;
						} else {
							// on the left
							cr_max = cr_mid - 1;
						}
					} else if (cr_mid === 0 || cr_mid === bounds.cr.max) {
//						console.log('right boundary point', point);
						cr_in_max = point[2];
						break;
					} else {
						// on the right
						cr_min = cr_mid + 1;
					}
				}

				for (var cr = cr_in_min; cr <= cr_in_max; cr++) {
					var point = [y, cb, cr];
					var index = (y << 14) + (cb << 7) + cr; // TODO: probably method this
					lut[index] = typeId;
				}
			}
			if (!found) {
				console.log('not found on plane, not possible!')
			}
		}
		this.updateClassifiedData();

	},
	convexHull: function () {
		// TODO: this is super really bad inefficient - needs a lot of research on optimization methods, or an entirely different approach
		// see: http://mathoverflow.net/questions/165559/calculate-the-discrete-set-of-points-b-which-are-in-the-convex-hull-of-the-set-o
		this.addHistory();
		var size = Math.pow(2, this.self.LutBitsPerColor);
		var pointCloud = [];
		var lut = this.getLookup();
		var target = this.getTarget();
		var typeId = this.self.Target[target];
		var bounds = {
			y: {
				min: Infinity,
				max: -Infinity
			},
			cb: {
				min: Infinity,
				max: -Infinity
			},
			cr: {
				min: Infinity,
				max: -Infinity
			}
		};

		for (var y = 0; y < size; y++) {
			for (var cb = 0; cb < size; cb++) {
				for (var cr = 0; cr < size; cr++) {
					var index = (y << 14) + (cb << 7) + cr; // TODO: probably method this
					if (lut[index] == typeId) {
						pointCloud.push([y, cb, cr]);
						if (y > bounds.y.max) {
							bounds.y.max = y;
						}
						if (y < bounds.y.min) {
							bounds.y.min = y;
						}
						if (cb > bounds.cb.max) {
							bounds.cb.max = cb;
						}
						if (cb < bounds.cb.min) {
							bounds.cb.min = cb;
						}
						if (cr > bounds.cr.max) {
							bounds.cr.max = cr;
						}
						if (cr < bounds.cr.min) {
							bounds.cr.min = cr;
						}
					}
				}
			}
		}

		console.log(bounds);
		var count = 0;
		var limit = 1000000;
		var total = (bounds.y.max - bounds.y.min + 1) * (bounds.cb.max - bounds.cb.min + 1) * (bounds.cr.max - bounds.cr.min + 1); // +1 as endpoints are inclusive
		for (var y = bounds.y.min; y <= bounds.y.max; y++) {
			for (var cb = bounds.cb.min; cb <= bounds.cb.max; cb++) {
				for (var cr = bounds.cr.min; cr <= bounds.cr.max; cr++) {
					var point = [y, cb, cr];
					if (this.isPointInConvexHull(point, pointCloud)) {
						var index = (y << 14) + (cb << 7) + cr; // TODO: probably method this
						lut[index] = typeId;
					}
					count++;
					if (count % 500 == 0) {
						console.log(count, total, (count / total * 100) + "%");
						console.log(y, cb, cr);
					}

					if (count >= limit) {
						break;
					}
				}
				if (count >= limit) {
					break;
				}
			}
			if (count >= limit) {
				break;
			}
		}

		this.updateClassifiedData();
	}
});
