Ext.define('NU.controller.Classifier', {
	extend: 'NU.controller.Display',
	config: {
		rawContext: null,
		classifiedContext: null,
		frozen: false,
		lookup: null,
		lookupBackwardHistory: null,
		lookupForwardHistory: null,
		lookupHistoryLength: 15,
		previewLookup: null,
		overwrite: false,
		selectionTool: 'magic_wand',
		polygonPoints: null,
		startPoint: null,
		rawImageData: null,
		rawImageComponents: null,
		classifiedImageData: null,
		mouseX: 0,
		mouseY: 0,
		imageWidth: 320,
		imageHeight: 240,
		leftMouseDown: false,
		range: 10,
		tolerance: 50,
		renderZoom: false,
		renderRawUnderlay: false,
		rawUnderlayOpacity: 0.5,
		magicWandPoints: null,
		magicWandColours: null,
		target: 'Field',
		centerEllipse: false,
		lastDraw: 0,
		renderYUV: false,
		renderCube: false
	},
	statics: {
		Target: {
			'Unclassified': 'u'.charCodeAt(0),
			'Line': 'w'.charCodeAt(0),
			'Field': 'g'.charCodeAt(0),
			'Goal': 'y'.charCodeAt(0),
			'Ball': 'o'.charCodeAt(0),
			'Cyan': 'c'.charCodeAt(0),
			'Magenta': 'm'.charCodeAt(0)
		},
		Tool: {
			'Point': 0,
			'MagicWand': 1,
			'Polygon': 2
		},
		LutBitsPerColorY: 4,
		LutBitsPerColorCb: 5,
		LutBitsPerColorCr: 4
	},
	control: {
		'rawImage': true,
		'classifiedImage': true,
		'undo': {
			click: function () {
				this.undoHistory();
			}
		},
		'redo': {
			click: function () {
				this.redoHistory();
			}
		},
		'toolPoint': {
			click: function () {
				this.setSelectionTool('point');
			}
		},
		'toolMagicWand': {
			toggle: function (btn, pressed) {
				if (pressed) {
					this.setSelectionTool('magic_wand');
				} else {
					this.setMagicWandPoints([]);
					this.setMagicWandColours([]);
					this.renderImages();
				}
			}
		},
		'toolPolygon': {
			toggle: function (btn, pressed) {
				if (pressed) {
					this.setSelectionTool('polygon');
				} else {
					this.setPolygonPoints([]);
					this.renderImages();
				}
			}
		},
		'toolRectangle': {
			toggle: function (btn, pressed) {
				if (pressed) {
					this.setSelectionTool('rectangle');
				} else {
					this.setStartPoint(null);
					this.renderImages();
				}
			}
		},
		'toolEllipse': {
			toggle: function (btn, pressed) {
				if (pressed) {
					this.setSelectionTool('ellipse');
				} else {
					this.setStartPoint(null);
					this.renderImages();
				}
			}
		},
		'toolZoom': {
			toggle: function (btn, pressed) {
				this.setRenderZoom(pressed);
				this.renderImages();
			}
		},
		'targetGreen': {
			click: function () {
				this.setTarget('Field');
			}
		},
		'targetYellow': {
			click: function () {
				this.setTarget('Goal');
			}
		},
		'targetCyan': {
			click: function () {
				this.setTarget('Cyan');
			}
		},
		'targetMagenta': {
			click: function () {
				this.setTarget('Magenta');
			}
		},
		'targetWhite': {
			click: function () {
				this.setTarget('Line');
			}
		},
		'targetBlack': {
			click: function () {
				this.setTarget('Unclassified');
			}
		},
		'targetOrange': {
			click: function () {
				this.setTarget('Ball');
			}
		},
		'reset': {
			click: function () {
				this.addHistory();
				this.resetLUT();
				this.updateClassifiedData();
				this.renderClassifiedImage();
			}
		},
		'download': {
			click: function () {
				this.download();
			}
		},
		'upload': {
			click: function () {
				this.upload();
			}
		},
		'uploadSave': {
			click: function () {
				this.upload(true);
			}
		},
		'refresh': {
			click: function () {
				this.updateClassifiedData();
				this.renderClassifiedImage();
			}
		},
		'snapshot': {
			change: function (checkbox, newValue, oldValue, eOpts) {
				this.setFrozen(newValue);
			}
		},
		'toolOverwrite': {
			toggle: function (btn, pressed) {
				this.setOverwrite(pressed);
			}
		},
		'rangeValue': {
			change: function (checkbox, newValue, oldValue, eOpts) {
				this.setRange(newValue);
			}
		},
		'toleranceValue': {
			change: function (checkbox, newValue, oldValue, eOpts) {
				this.setTolerance(newValue);
			}
		},
		'rawUnderlay': {
			change: function (checkbox, newValue, oldValue, eOpts) {
				this.setRenderRawUnderlay(newValue);
				this.renderClassifiedImage();
			}
		},
		'rawUnderlayOpacity': {
			change: function (checkbox, newValue, oldValue, eOpts) {
				if (checkbox.isValid()) {
					this.setRawUnderlayOpacity(newValue);
					this.renderClassifiedImage();
				}
			}
		},
		'renderYUVBox': {
			change: function (checkbox, newValue, oldValue, eOpts) {
				if (checkbox.isValid()) {
					this.setRenderYUV(newValue);
					this.refreshScatter();
				}
			}
		},
		'renderCubeBox': {
			change: function (checkbox, newValue, oldValue, eOpts) {
				if (checkbox.isValid()) {
					this.setRenderCube(newValue);
					this.refreshScatter();
				}
			}
		},
		/*'metaball': {
			click: function (btn) {
				this.metaball();
			}
		},
		'convexhull': {
			click: function (btn) {
				this.convexHull2();
			}
		},*/
		'rawValue': true,
		'classifiedValue': true,
		'scatter3d': true
	},
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

//				debugger;
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
	},
	init: function () {
		// these must initialized here so there is an object per-controller
		this.resetLUT();
		this.setLookupForwardHistory([]);
		this.setLookupBackwardHistory([]);
		this.setPreviewLookup({});
		this.setPolygonPoints([]);
		this.setMagicWandPoints([]);
		this.setMagicWandColours([]);

		NU.util.Network.on('image', Ext.bind(this.onImage, this));
		NU.util.Network.on('lookup_table', Ext.bind(this.onLookUpTable, this));
		this.callParent(arguments);

		var rawElCanvas = this.getRawImage().getEl();
		var rawCanvas = rawElCanvas.dom;
		this.setRawContext(rawCanvas.getContext('2d'));

		var classifiedElCanvas = this.getClassifiedImage().getEl();
		var classifiedCanvas = classifiedElCanvas.dom;
		var ctx = classifiedCanvas.getContext('2d');
		this.setClassifiedContext(ctx);
		this.setClassifiedImageData(ctx.getImageData(0, 0, 320, 240));

		function clickBind(callback, preventDefault) {
			return function (e, element) {
				if (preventDefault === undefined || preventDefault) {
					e.preventDefault();
				}

				var el = Ext.get(element);
				var x = e.getX() - el.getLeft();
				var y = e.getY() - el.getTop();

				callback.call(this, x, y, e);
			};
		}

		[rawElCanvas, classifiedElCanvas].forEach(function (element) {
			this.mon(element, {
				click: clickBind(this.onImageClick),
				dblclick: clickBind(this.onImageDblClick),
				contextmenu: clickBind(this.onImageRightClick),
				mousemove: clickBind(this.onImageMouseMove),
				mousedown: function (e) {
					e.preventDefault();
					if (e.button === 0) {
						this.setLeftMouseDown(true);
						switch (this.getSelectionTool()) {
							case 'point':
								this.addHistory();
								break;
						}
					}
				},
				mouseup: function (e) {
					e.preventDefault();
					if (e.button === 0) {
						this.setLeftMouseDown(false);
					}
				},
				scope: this
			});
		}, this);

		this.testDrawImage();
	},
	refreshScatter: function () {

		var data = [];
		var lut = this.getLookup();

		function getColour(typeId) {
//			var rgb = this.getRGBfromType(typeId);
//			return new THREE.Color(rgb[0], rgb[1], rgb[2]);
			switch (typeId) {
				case this.self.Target.Unclassified:
//					return new THREE.Color("#000000");
					return null;
				case this.self.Target.Line:
					return new THREE.Color("#ffffff");
				case this.self.Target.Field:
					return new THREE.Color("#00ff00");
				case this.self.Target.Goal:
					return new THREE.Color("#ffff00");
				case this.self.Target.Ball:
					return new THREE.Color("#ff9000");
				case this.self.Target.Cyan:
					return new THREE.Color("#00ffff");
				case this.self.Target.Magenta:
					return new THREE.Color("#ff00ff");
				default:
					throw new Error('Unknown classification: ' + typeId);
			}
		}

		function scale(value) {
			// scale from [0, 255] to [-1, 1]
			return (100 * value) / 255 - 50;
		}

		var index;
		var min = 0;
		var max = 255;
		var numSteps = Math.pow(2, Math.max(this.self.LutBitsPerColorY, this.self.LutBitsPerColorCb, this.self.LutBitsPerColorCr));
		var step = (max - min) / numSteps;
		for (var z = min; z <= max; z += step) {
			for (var y = min; y <= max; y += step) {
				for (var x = min; x <= max; x += step) {
					if (this.getRenderCube() && (z === 0 || z === 255 || y === 0 || y === 255 || x === 0 || x === 255)) {
						var colour = new THREE.Color();
						var rgb = this.getRGBfromCYBRCR(x, y, z);
						colour.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
						data.push([scale(z), scale(x), scale(y), colour]);
					} else {
						index = this.getLUTIndex([x, y, z]);
						if (lut[index] !== this.self.Target.Unclassified) {
							var colour;
							if (this.getRenderYUV()) {
								colour = new THREE.Color();
								var rgb = this.getRGBfromCYBRCR(x, y, z);
								colour.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
							} else {
								colour = getColour.call(this, lut[index]);
							}
							// swap y/z since axes change in threejs
							data.push([scale(z), scale(x), scale(y), colour]);
						}
					}
				}
			}
		}

		this.getScatter3d().setData(data);
		this.getScatter3d().updatePlot();

	},
	resetLUT: function () {
		var lut = new Uint8ClampedArray(Math.pow(2, 3 * this.self.LutBitsPerColorY + this.self.LutBitsPerColorCb + this.self.LutBitsPerColorCr));
		for (var i = 0; i < lut.length; i++) {
			lut[i] = this.self.Target.Unclassified;
		}
		this.setLookup(lut); // TODO: make constant or something
	},
	download: function () {
		var message = new API.Message();
		message.setUtcTimestamp(Date.now() / 1000);
		message.setType(API.Message.Type.COMMAND);
		var command = new API.Message.Command();
		command.setCommand("download_lut");
		message.setCommand(command);
		NU.util.Network.send(this.getRobotIP(), message);
	},
	upload: function (save) {
		save = !!save; // convert to bool
		var message = new API.Message();
		message.setUtcTimestamp(Date.now() / 1000);
		message.setType(API.Message.Type.LOOKUP_TABLE);
		var lookupTable = new API.Vision.LookUpTable();
		lookupTable.setTable(this.getLookup());
		lookupTable.setBitsY(this.self.LutBitsPerColorY);
		lookupTable.setBitsCb(this.self.LutBitsPerColorCb);
		lookupTable.setBitsCr(this.self.LutBitsPerColorCr);
		lookupTable.setSave(save);
		message.setLookupTable(lookupTable);
		NU.util.Network.send(this.getRobotIP(), message);
	},
	getLUTIndex: function (ycbcr) {
		var bitsY = this.self.LutBitsPerColorY;
		var bitsCb = this.self.LutBitsPerColorCb;
		var bitsCr = this.self.LutBitsPerColorCr;
		var bitsRemovedY = 8 - bitsY;
		var bitsRemovedCb = 8 - bitsCb;
		var bitsRemovedCr = 8 - bitsCr;


		var index = 0;
		index |= ycbcr[0] >> bitsRemovedY;
		index <<= bitsCb;
		index |= ycbcr[1] >> bitsRemovedCb;
		index <<= bitsCr;
		index |= ycbcr[2] >> bitsRemovedCr;

		return index;
	},
	getLUTIndex2: function (ycbcr) {
		return ((ycbcr[0] >> 1) << 14) | ((ycbcr[1] >> 1) << 7) | (ycbcr[2] >> 1);
	},
	addHistory: function () {
		var backwardHistory = this.getLookupBackwardHistory();
		var lookup = new Uint8ClampedArray(this.getLookup());
		backwardHistory.push(lookup);
		this.setLookupForwardHistory([]);
	},
	undoHistory: function () {
		var backwardHistory = this.getLookupBackwardHistory();
		var forwardHistory = this.getLookupForwardHistory();
		if (backwardHistory.length > 0) {
			forwardHistory.push(this.getLookup());
			this.setLookup(backwardHistory.pop());
			this.updateClassifiedData();
			this.renderClassifiedImage();
			if (forwardHistory.length > this.getLookupHistoryLength()) {
				forwardHistory.shift();
			}
		}
	},
	redoHistory: function () {
		var backwardHistory = this.getLookupBackwardHistory();
		var forwardHistory = this.getLookupForwardHistory();
		if (forwardHistory.length > 0) {
			backwardHistory.push(this.getLookup());
			this.setLookup(forwardHistory.pop());
			this.updateClassifiedData();
			this.renderClassifiedImage();
			if (backwardHistory.length > this.getLookupHistoryLength()) {
				backwardHistory.shift();
			}
		}
	},
	onLookUpTable: function (robotIP, api_message) {

		// TODO: remove
		if (robotIP !== this.robotIP) {
			return;
		}

		var table = api_message.getLookupTable().getTable();

		// TODO: validate?
		var lut = new Uint8ClampedArray(table.toArrayBuffer());
		this.setLookup(lut);
		this.updateClassifiedData();
		this.renderClassifiedImage();
	},
	onImage: function (robotIP, api_message) {

		// TODO: remove
		if (robotIP !== this.robotIP) {
			return;
		}

		var image = api_message.image;

		if (image) {
			var now = Date.now();
			if (!this.getFrozen() && now - this.getLastDraw() >= 500) {
				this.drawImage(image, function (ctx) {
					this.setRawImageData(ctx.getImageData(0, 0, 320, 240));
					this.updateClassifiedData();
					this.renderImages();
					this.setLastDraw(now);
				}, this);
			}
		}

	},
	onImageMouseMove: function (x, y, e) {
		this.setMouseX(x);
		this.setMouseY(y);
		this.renderRawImage();
		this.renderClassifiedImage();

		switch (this.getSelectionTool()) {
			case 'point':
				if (this.getLeftMouseDown()) {
					this.classifyPoint(x, y);
				}
				break;
			case 'ellipse':
				this.setCenterEllipse(e.altKey);
				break;
		}

		var rgba = this.getPointRGBA(x, y, this.getRawImageData().data);
		this.getRawValue().update("(" + x + ", " + y + ") = rgb(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2] + ")");

		var rgba = this.getPointRGBA(x, y, this.getClassifiedImageData().data);
		this.getClassifiedValue().update("(" + x + ", " + y + ") = rgb(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2] + ")");
	},
	onImageClick: function (x, y) {
		switch (this.getSelectionTool()) {
			case 'point':
				this.addHistory();
				this.classifyPoint(x, y);
				break;
			case 'magic_wand':
				this.magicWandSelect(x, y);
				break;
			case 'rectangle':
				if (this.getStartPoint() === null) {
					this.setStartPoint([x, y]);
				} else {
					this.addHistory();
					this.classifyRectangle(x, y);
				}
				break;
			case 'ellipse':
				if (this.getStartPoint() === null) {
					this.setStartPoint([x, y]);
				} else {
					this.addHistory();
					this.classifyEllipse(x, y);
				}
				break;
			case 'polygon':
				this.polygonAddPoint(x, y);
				break;
		}
	},
	onImageDblClick: function (x, y) {
		switch (this.getSelectionTool()) {
			case 'point':
			case 'magic_wand':
			case 'rectangle':
			case 'ellipse':
				this.onImageClick(x, y);
				break;
			case 'polygon':
				this.addHistory();
				this.classifyPolygon();
				break;
		}
	},
	onImageRightClick: function (x, y) {
		switch (this.getSelectionTool()) {
			case 'point':
				// temporarily turn override on and restore after
				var overwrite = this.getOverwrite();
				this.setOverwrite(true);
				this.addHistory();
				this.classifyPoint(x, y, 'Unclassified');
				this.setOverwrite(overwrite);
				break;
			case 'magic_wand':
				this.addHistory();
				this.magicWandClassify(x, y);
				break;
			case 'rectangle':
			case 'ellipse':
				this.setStartPoint(null);
				this.renderImages();
				break;
			case 'polygon':
				this.polygonRemovePoint(x, y);
				break;
		}
	},
	polygonAddPoint: function (x, y) {
		var points = this.getPolygonPoints();
		points.push([x, y]);
		this.renderImages();
	},
	polygonRemovePoint: function (x, y) {
		var points = this.getPolygonPoints();
		if (points.length > 0) {
			points.pop();
			this.renderImages();
		}
	},
	magicWandSelect: function (x, y, tolerance) {
		var points = [];
		var colours = [];
		var queue = [];
		var checked = {};
		var map = {};
		queue.push([x, y]);
		if (tolerance === undefined) {
			tolerance = this.getTolerance();
		}
		var ycbcr = this.getYCBCR(x, y);
		colours.push(ycbcr);
		while (queue.length > 0) {
			var point = queue.shift();
			for (var dy = -1; dy <= 1; dy++) {
				for (var dx = -1; dx <= 1; dx++) {
					var neighbourX = point[0] + dx;
					var neighbourY = point[1] + dy;
					if ((dy === 0 && dx === 0) || neighbourX < 0 || neighbourX >= 320 || neighbourY < 0 || neighbourY >= 240) {
						break;
					}
					// ycbcr = this.getYCBCR(point[0], point[1]);
					var neighbourYcbcr = this.getYCBCR(neighbourX, neighbourY);
					var dist = Math.pow(ycbcr[0] - neighbourYcbcr[0], 2) + Math.pow(ycbcr[1] - neighbourYcbcr[1], 2) + Math.pow(ycbcr[2] - neighbourYcbcr[2], 2);
					var newPoint = [neighbourX, neighbourY];
					var hash = this.hashPoint(newPoint);
					// avoided using sqrt for speed
					if (dist <= Math.pow(tolerance, 2) && checked[hash] === undefined) {
						queue.push(newPoint);
						points.push(newPoint);
						var index = this.getLUTIndex(neighbourYcbcr);
						if (map[index] === undefined) {
							colours.push(neighbourYcbcr);
							map[index] = true;
						}
					}
					checked[hash] = true;
				}
			}
		}
		this.setMagicWandColours(colours);
		this.setMagicWandPoints(points);
	},
	hashPoint: function (point) {
		return point[0] + "," + point[1];
	},
	magicWandClassify: function (x, y) {
		var points = this.getMagicWandPoints();
		points.forEach(function (point) {
			this.classifyPoint(point[0], point[1], undefined, false);
		}, this);
		this.updateClassifiedData();
		this.renderClassifiedImage();
//		console.time("classify");
//		var colours = this.getMagicWandColours();
//		this.classifyPoints(colours);
//		console.timeEnd("classify");
		this.setMagicWandPoints([]);
		this.setMagicWandColours([]);
	},
	classifyRectangle: function (x, y) {
		var start = this.getStartPoint();
		var end = [x, y];

		var minX = Math.min(start[0], end[0]);
		var maxX = Math.max(start[0], end[0]);
		var minY = Math.min(start[1], end[1]);
		var maxY = Math.max(start[1], end[1]);

		for (var y = minY; y <= maxY; y++) {
			for (var x = minX; x <= maxX; x++) {
				this.classifyPoint(x, y, undefined, false);
			}
		}

		this.updateClassifiedData();
		this.renderClassifiedImage();
		this.setStartPoint(null);
	},
	classifyEllipse: function (x, y) {
		// TODO: since an ellipse is convex, further optimization could be gained
		// by first classifying the inner fitting rectangle, and then only testing
		// points between this rectangle and the bounding box
		var start = this.getStartPoint();
		var end = [x, y];

		var minX = Math.min(start[0], end[0]);
		var maxX = Math.max(start[0], end[0]);
		var minY = Math.min(start[1], end[1]);
		var maxY = Math.max(start[1], end[1]);

		if (this.getCenterEllipse()) {
			var h = minX;
			var k = minY;
			var rx = Math.floor((maxX - minX) / 2);
			var ry = Math.floor((maxY - minY) / 2);
		} else {
			var h = Math.floor((maxX + minX) / 2);
			var k = Math.floor((maxY + minY) / 2);
			var rx = maxX - h;
			var ry = maxY - k;
		}

		// taken from http://math.stackexchange.com/a/76463
		for (var y = k - ry; y <= k + ry; y++) {
			for (var x = h - rx; x <= h + rx; x++) {
				if (Math.pow(x - h, 2) / (rx * rx) + Math.pow(y - k, 2) / (ry * ry) <= 1) {
					this.classifyPoint(x, y, undefined, false);
				}
			}
		}

		this.updateClassifiedData();
		this.renderClassifiedImage();
		this.setStartPoint(null);
	},
	classifyPolygon: function () {
		var points = this.getPolygonPoints();
		// complete polygon
		if (points.length === 0) {
			return;
		}
		points[points.length] = points[0];
		var boundingBox = this.findBoundingBox(points);
		var start = boundingBox[0];
		var end = boundingBox[1];

		for (var x = start[0]; x < end[0]; x++) {
			for (var y = start[1]; y < end[1]; y++) {
				if (this.isPointInPolygon(x, y, points, boundingBox)) {
					this.classifyPoint(x, y, undefined, false);
				}
			}
		}
		this.updateClassifiedData();
		this.renderClassifiedImage();
		this.setPolygonPoints([]);
	},
	isPointInPolygon: function (x, y, points, boundingBox) {
		if (boundingBox === undefined) {
			boundingBox = this.findBoundingBox(points);
		}
		var start = boundingBox[0];
		var end = boundingBox[1];
		if (x < start[0] || x > end[0] || y < start[1] || y > end[1]) {
			// point is not in the bounding box, definitely not in the polygon
			return false;
		}

		// uses the ray casting method
		// ported from http://geomalgorithms.com/a03-_inclusion.html
		var cn = 0; // the crossing number counter
		// loop through all edges of the polygon
		for (var i = 0; i < points.length - 1; i++) {
			// an upward crossing
			if (
				((points[i][1] <= y) && (points[i+1][1] > y))
				|| ((points[i][1] > y) && (points[i+1][1] <= y)) // a downward crossing
				) {
				// compute the actual edge-ray intersect x-coordinate
				var vt = (y  - points[i][1]) / (points[i+1][1] - points[i][1]);
				// P.x < intersect
				if (x <  points[i][0] + vt * (points[i+1][0] - points[i][0])) {
					// a valid crossing of y = P.y right of P.x
					cn++;
				}
			}
		}
		return (cn & 1); // 0 if even (out), and 1 if  odd (in)
	},
	findBoundingBox: function (points) {
		var minX = Number.MAX_VALUE;
		var maxX = Number.MIN_VALUE;
		var minY = Number.MAX_VALUE;
		var maxY = Number.MIN_VALUE;
		points.forEach(function (point) {
			var x = point[0];
			var y = point[1];

			if (x < minX) {
				minX = x;
			}
			if (x > maxX) {
				maxX = x;
			}
			if (y < minY) {
				minY = y;
			}
			if (y > maxY) {
				maxY = y;
			}
		});

		return [
			[minX, minY],
			[maxX, maxY]
		];
	},
	classifyPoints: function (points, target, doRender, range) {
		if (target === undefined) {
			target = this.getTarget();
		}
		if (range === undefined) {
			range = this.getRange();
		}

		// create sphere 'lookup table'
		var rangeSqr = range * range;
		var pointDiffs = [];
		for (var y = -range; y <= range; y+=2) {
			for (var cb = -range; cb <= range; cb+=2) {
				for (var cr = -range; cr <= range; cr+=2) {
					var pointDiff = [y, cb, cr];
					var dist = y * y + cb * cb + cr * cr;
					if (dist <= rangeSqr) {
						pointDiffs.push(pointDiff);
					}
				}
			}
		}

		var overwrite = this.getOverwrite();
		var targetId = this.self.Target[target];
		var lookup = this.getLookup();
		var min = 0;
		var max = Math.pow(2, 8) - 1;
		var map = {};
		var unclassified = this.self.Target.Unclassified;
		for (var i = 0; i < points.length; i++) {
			var point = points[i];
			for (var x = 0; x < pointDiffs.length; x++) {
				var pointDiff = pointDiffs[x];
				var newPoint = [point[0] + pointDiff[0], point[1] + pointDiff[1], point[2] + pointDiff[2]];
				if (newPoint[0] < min || newPoint[0] > max || newPoint[1] < min || newPoint[1] > max || newPoint[2] < min || newPoint[2] > max) {
					continue;
				}
//				var index = this.getLUTIndex(newPoint);
				var index = ((newPoint[0] >> 1) << 14) | ((newPoint[1] >> 1) << 7) | (newPoint[2] >> 1);
				if (map[index] === undefined) {
					if (overwrite || lookup[index] === unclassified) {
						lookup[index] = targetId;
					}
					map[index] = true;
				}
			}
		}

		if (doRender === undefined || doRender) {
			this.updateClassifiedData();
			this.renderClassifiedImage();
		}
	},
	classifyPoints2: function (coordPoints, target, doRender, range) {

		if (target === undefined) {
			target = this.getTarget();
		}
		if (range === undefined) {
			range = this.getRange();
		}
		// iterate bounding box with a border margin of range
		// check if point is within range of any point
		// use quicktest to remove negatives, use better test to confirm positive
		// if positive, move point to start of points array as nearby points are likely within range

		var points = [];
		var map = {};
		var bounds = { y: { min: Infinity, max: -Infinity }, cb: { min: Infinity, max: -Infinity }, cr: { min: Infinity, max: -Infinity } };
		for (var i = 0; i < coordPoints.length; i++) {
			var coordPoint = coordPoints[i];
			var ycbcr = this.getYCBCR(coordPoint[0], coordPoint[1]);
			var y = ycbcr[0];
			var cb = ycbcr[1];
			var cr = ycbcr[2];

			if ( y > bounds.y.max)  { bounds.y.max  = y;  }
			if ( y < bounds.y.min)  { bounds.y.min  = y;  }
			if (cb > bounds.cb.max) { bounds.cb.max = cb; }
			if (cb < bounds.cb.min) { bounds.cb.min = cb; }
			if (cr > bounds.cr.max) { bounds.cr.max = cr; }
			if (cr < bounds.cr.min) { bounds.cr.min = cr; }

			// cache points
			// TODO: only add non-duplicates

			var index = this.getLUTIndex(ycbcr);
			if (map[index] === undefined) {
				points.push(ycbcr);
				map[index] = true;
			}
//			points.push(ycbcr);
		}
		var min = 0;
		var max = Math.pow(2, 8) - 1;
		// add margin border
		bounds.y.max = Math.min(max, bounds.y.max + range);
		bounds.y.min = Math.max(min, bounds.y.min - range);
		bounds.cb.max = Math.min(max, bounds.cb.max + range);
		bounds.cb.min = Math.max(min, bounds.cb.min - range);
		bounds.cr.max = Math.min(max, bounds.cr.max + range);
		bounds.cr.min = Math.max(min, bounds.cr.min - range);

		var overwrite = this.getOverwrite();
		var targetId = this.self.Target[target];
		var lookup = this.getLookup();
		var step = 1;//1 << (8 - this.self.LutBitsPerColor);
		var rangeSqr = Math.pow(range, 2);
		for (var y = bounds.y.min; y <= bounds.y.max; y += step) {
			for (var cb = bounds.cb.min; cb <= bounds.cb.max; cb += step) {
				for (var cr = bounds.cr.min; cr <= bounds.cr.max; cr += step) {
					var testPoint = [y, cb, cr];
					for (var i = 0; i < points.length; i++) {
						var point = points[i];
						// use rough test first
//						var maxDist = Math.abs(testPoint[0] - point[0]) + Math.abs(testPoint[1] - point[1]) + Math.abs(testPoint[2] - point[2]);
//						if (maxDist > range) {
//							continue;
//						} else {
							// use proper test if testPoint passes rough test
							var dist = Math.pow(testPoint[0] - point[0], 2) + Math.pow(testPoint[1] - point[1], 2) + Math.pow(testPoint[2] - point[2], 2);
							if (dist <= rangeSqr) {
								// definitely in the range!
								var index = this.getLUTIndex(testPoint);
								if (overwrite || lookup[index] === this.self.Target.Unclassified) {
									lookup[index] = targetId;
								}
								if (i > 0) {
									// move point to the top for next test!
									for (var x = i; x >= 1; x--) {
										points[x] = points[x - 1];
									}
									points[0] = point;
								}
								break;
							}
//						}
					}
				}
			}
		}

		if (doRender === undefined || doRender) {
			this.updateClassifiedData();
			this.renderClassifiedImage();
		}
	},
	classifyPoint: function (x, y, target, doRender, range) {
		var ycbcr = this.getYCBCR(x, y);
		if (target === undefined) {
			target = this.getTarget();
		}
		this.addLookupColour(ycbcr, target, range);
		if (doRender === undefined || doRender) {
			this.updateClassifiedData();
			this.renderClassifiedImage();
		}
	},
	getPointRGBA: function (x, y, data) {
		var offset = 4 * y * 320 + 4 * x;
		if (data === undefined) {
			data = this.getRawImageData().data;
		}
		return data.slice(offset, offset + 4);
	},
	addLookupColour: function (ycbcr, type, range) {
		var lookup = this.getLookup();
		if (range === undefined) {
			range = this.getRange();
		}
		var step = 1 << (8 - Math.max(this.self.LutBitsPerColorY, this.self.LutBitsPerColorCb, this.self.LutBitsPerColorCr));
		var min = 0;
		var max = Math.pow(2, 8) - 1;
		// checks all points in a bounding box around the point and classifies if it is within a sphere of radius 'range'
		// Note: By design, a range of 0 still classifies the original point
		var overwrite = this.getOverwrite();
		for (var dy = -range; dy <= range; dy += step) {
			for (var dcb = -range; dcb <= range; dcb += step) {
				for (var dcr = -range; dcr <= range; dcr += step) {
					// cap it
					var y = ycbcr[0] + dy;
					var cb = ycbcr[1] + dcb;
					var cr = ycbcr[2] + dcr;
					if (y < min || y > max || cb < min || cb > max || cr < min || cr > max) {
						continue;
					}
					var dist = Math.pow(ycbcr[0] - y, 2) + Math.pow(ycbcr[1] - cb, 2) + Math.pow(ycbcr[2] - cr, 2);
					if (dist <= Math.pow(range, 2)) {
						var nearYcbcr = [
							y,
							cb,
							cr,
						];
						var index = this.getLUTIndex(nearYcbcr);
						var typeId = this.self.Target[type];
						if (overwrite || lookup[index] === this.self.Target.Unclassified) {
							lookup[index] = typeId;
						}
					}
				}
			}
		}
	},
//    getYCBCRfromRGB: function (r, g, b) {
//        var ycc = [];
//        // http://en.wikipedia.org/wiki/YCbCr#JPEG_conversion
//        ycc[0] = Math.floor(      0.299    * r + 0.587    * g + 0.114    * b);
//        ycc[1] = Math.floor(128 - 0.168736 * r - 0.331264 * g + 0.5      * b);
//        ycc[2] = Math.floor(128 + 0.5      * r - 0.418688 * g + 0.081312 * b);
//
//       ycc[0] = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
//       ycc[1] = Math.floor(-0.14713 * r + -0.28886 * g + 0.436 * b);
//       ycc[2] = Math.floor(0.615 * r + -0.51499 * g + -0.10001 * b);
//
//       r /= 255;
//       g /= 255;
//       b /= 255;
//
//       ycc[0] = Math.floor(16  + (65.481 * r + 128.553 * g + 24.966 * b));
//       ycc[1] = Math.floor(128 + (-37.797 * r - 74.203 * g + 112 * b));
//       ycc[2] = Math.floor(128 + (112 * r - 93.786 * g - 18.214 * b));
//        return ycc;
//    },
	getRGBfromCYBRCR: function (y, cb, cr) {
		var r = y + 1.402 * (cr - 128);
		var g = y - 0.34414 * (cb - 128) - 0.71414 * (cr - 128)
		var b = y + 1.772 * (cb - 128);
		return [r, g, b]
	},
	hash: function (ycc) {
		return ycc[0] + '.' + ycc[1] + '.' + ycc[2];
	},
	renderImages: function () {
		this.renderRawImage();
		this.renderClassifiedImage();
	},
	renderRawImage: function () {
		var ctx = this.getRawContext();
		ctx.putImageData(this.getRawImageData(), 0, 0);
		this.renderEllipseOverlay(ctx);
		this.renderRectangleOverlay(ctx);
		this.renderPolygonOverlay(ctx);
		this.renderMagicWandOverlay(ctx);
		if (this.getRenderZoom()) {
			this.renderZoomOverlay(ctx, this.getRawImageData());
		}
	},
	renderClassifiedImage: function () {
		var ctx = this.getClassifiedContext();
		ctx.putImageData(this.getClassifiedImageData(), 0, 0);
		if (this.getRenderRawUnderlay()) {
			this.renderImageUnderlay(ctx, this.getRawImageData());
		}
		this.renderEllipseOverlay(ctx);
		this.renderRectangleOverlay(ctx);
		this.renderPolygonOverlay(ctx);
		this.renderMagicWandOverlay(ctx);
		if (this.getRenderZoom()) {
			this.renderZoomOverlay(ctx, this.getClassifiedImageData());
		}
	},
	renderImageUnderlay: function (ctx, rawImageData) {
		var data = ctx.getImageData(0, 0, 320, 240);
		var rawData = rawImageData.data;
		var rawOpacity = this.getRawUnderlayOpacity();
		var classifiedOpacity = 1 - this.getRawUnderlayOpacity();
		for (var y = 0; y < 240; y++) {
			for (var x = 0; x < 320; x++) {
				var offset = 4 * 320 * y + 4 * x;
				data.data[offset] = Math.round(data.data[offset] * classifiedOpacity + rawData[offset] * rawOpacity);
				data.data[offset + 1] = Math.round(data.data[offset + 1] * classifiedOpacity + rawData[offset + 1] * rawOpacity);
				data.data[offset + 2] = Math.round(data.data[offset + 2] * classifiedOpacity + rawData[offset + 2] * rawOpacity);
				data.data[offset + 3] = 255;
			}
		}
		ctx.putImageData(data, 0, 0);
	},
	renderPolygonOverlays: function () {
		this.renderPolygonOverlay(this.getClassifiedContext());
		this.renderPolygonOverlay(this.getRawContext());
	},
	renderRectangleOverlay: function (ctx) {
		if (this.getSelectionTool() !== 'rectangle') {
			return; // TODO: improve
		}
		var start = this.getStartPoint();
		var end = [this.getMouseX(), this.getMouseY()];
		if (start !== null) {
			ctx.strokeStyle = '#fff';
			//ctx.lineWidth = 2;
			ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
			ctx.beginPath();
			ctx.rect(start[0], start[1], end[0] - start[0], end[1] - start[1]);
			ctx.fill();
			ctx.stroke();
		}
	},
	renderEllipseOverlay: function (ctx) {
		if (this.getSelectionTool() !== 'ellipse') {
			return; // TODO: improve
		}
		var start = this.getStartPoint();
		var end = [this.getMouseX(), this.getMouseY()];
		if (start !== null) {

			var x = start[0];
			var y = start[1];
			var w = end[0] - start[0];
			var h = end[1] - start[1];

			if (this.getCenterEllipse()) {
				x -= w / 2;
				y -= h / 2;
			}

			// taken from http://stackoverflow.com/a/2173084/868679
			var kappa = .5522848, // 4 * ((âˆš(2) - 1) / 3)
				ox = (w / 2) * kappa, // control point offset horizontal
				oy = (h / 2) * kappa, // control point offset vertical
				xe = x + w,           // x-end
				ye = y + h,           // y-end
				xm = x + w / 2,       // x-middle
				ym = y + h / 2;       // y-middle

			ctx.strokeStyle = '#fff';
			//ctx.lineWidth = 2;
			ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
			ctx.beginPath();
			ctx.moveTo(x, ym);
			ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
			ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
			ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
			ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
	},
	renderPolygonOverlay: function (ctx) {
		var points = this.getPolygonPoints();
		if (points.length > 0) {
			var firstPoint = points[0];
			ctx.strokeStyle = '#fff';
			//ctx.lineWidth = 2;
			ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
			ctx.beginPath();
			ctx.moveTo(firstPoint[0], firstPoint[1]);
			points.forEach(function (point) {
				ctx.lineTo(point[0], point[1]);
			});
			ctx.lineTo(this.getMouseX(), this.getMouseY());
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
		}
	},
	renderMagicWandOverlay: function (ctx) {
		var data = ctx.getImageData(0, 0, 320, 240);
		var points = this.getMagicWandPoints();
//		var colours = [];
		points.forEach(function (point) {
			var x = point[0];
			var y = point[1];
			var offset = 4 * 320 * y + 4 * x;
//			colours.push([
//				data.data[offset + 0],
//				data.data[offset + 1],
//				data.data[offset + 2],
//				data.data[offset + 3]
//			]);

			data.data[offset] = 255;
			data.data[offset + 1] = 0;
			data.data[offset + 2] = 0;
			data.data[offset + 3] = 255;
		}, this);

		// TODO: make this more efficient
//		for (var y = 0; y < 240; y++) {
//			for (var x = 0; x < 320; x++) {
//				colours.forEach(function (colour) {
//					var offset = 4 * 320 * y + 4 * x;
//					if (
//						   colour[0] == data.data[offset + 0]
//						&& colour[1] == data.data[offset + 1]
//						&& colour[2] == data.data[offset + 2]
//						&& colour[3] == data.data[offset + 3]
//					) {
//						data.data[offset] = 255;
//						data.data[offset + 1] = 0;
//						data.data[offset + 2] = 0;
//						data.data[offset + 3] = 255;
//					}
//				});
//			}
//		}
		ctx.putImageData(data, 0, 0);
	},
	renderZoomOverlay: function (ctx, imageData) {
		var data = ctx.getImageData(0, 0, 320, 240);
		var originalData = imageData.data;
		var mouseX = this.getMouseX();
		var mouseY = this.getMouseY();
		var zoom = 3; // must be an odd integer
		var width = zoom * 43; // should be divisible by zoom and odd
		var height = zoom * 21; // should be divisible by zoom and odd
		var minX = 0;
		var minY = 0;
		var maxX = 320;
		var maxY = 240;
		var pxSize = 4;

		var row = -Math.floor(height / 2 / zoom);
		var col = -Math.floor(width / 2 / zoom);
		var zoomDiff = Math.floor(zoom / 2);
		// loop though pixels of zoomed image
		for (var y = maxY - height + zoomDiff; y < maxY - zoomDiff; y += zoom) {
			for (var x = maxX - width + zoomDiff; x < maxX - zoomDiff; x += zoom) {
				// calculate the real coordinates
				var realX = mouseX + col;
				var realY = mouseY + row;
				var realOffset = pxSize * maxX * realY + pxSize * realX;

				for (var zy = -zoomDiff; zy <= zoomDiff; zy++) {
					for (var zx = -zoomDiff; zx <= zoomDiff; zx++) {
						var zoomX = x + zx;
						var zoomY = y + zy;
						var zoomOffset = pxSize * maxX * zoomY + pxSize * zoomX;
						if (realX < minX || realX >= maxX || realY < minY || realY >= maxY) {
							data.data[zoomOffset] = 0;
							data.data[zoomOffset + 1] = 0;
							data.data[zoomOffset + 2] = 0;
							data.data[zoomOffset + 3] = 255;
						} else {
							data.data[zoomOffset] = originalData[realOffset];
							data.data[zoomOffset + 1] = originalData[realOffset + 1];
							data.data[zoomOffset + 2] = originalData[realOffset + 2];
							data.data[zoomOffset + 3] = originalData[realOffset + 3];
						}
					}
				}

				col++;
			}
			row++;
			col = -Math.floor(width / 2 / zoom);
		}
		// draw border
		var borderOpacity = 0.5;
		for (var y = maxY - height - 1; y < maxY; y++) {
			for (var x = maxX - width - 1; x < maxX; x++) {
				if (y === maxY - height - 1 || x === maxX - width - 1) {
					var offset = pxSize * maxX * y + pxSize * x;
					data.data[offset] = Math.round(data.data[offset] * (1 - borderOpacity) + 255 * borderOpacity);
					data.data[offset + 1] = Math.round(data.data[offset + 1] * (1 - borderOpacity) + 255 * borderOpacity);
					data.data[offset + 2] = Math.round(data.data[offset + 2] * (1 - borderOpacity) + 255 * borderOpacity);
					data.data[offset + 3] = 255;
				}
			}
		}
		// draw crosshair
		var zoomCenterY = maxY - Math.floor(height / 2) - 1;
		var zoomCenterX = maxX - Math.floor(width / 2) - 1;
		for (var zy = -1; zy <= 1; zy++) {
			for (var zx = -1; zx <= 1; zx++) {
				if (zy !== 0 && zx !== 0) {
					continue;
				}
				var offset = 4 * maxX * (zoomCenterY + zy) + 4 * (zoomCenterX + zx);
				data.data[offset] = 255;
				data.data[offset + 1] = 255;
				data.data[offset + 2] = 255;
				data.data[offset + 3] = 255;
			}
		}
		ctx.putImageData(data, 0, 0);
	},
	updateClassifiedData: function () {
		this.setClassifiedImageData(this.generateClassifiedData());
		this.refreshScatter();
	},
	generateClassifiedData: function () {
		var rawData = this.getRawImageData();

		var classifiedCtx = this.getClassifiedContext();
		var classifiedData = classifiedCtx.createImageData(320, 240);

		var lookup = this.getLookup();
		for (var row = 0; row < 240; row++) {
			for (var col = 0; col < 320; col++) {
				var offset = 4 * row * 320 + 4 * col;
				var ycbcr = this.getYCBCR(col, row);
				var index = this.getLUTIndex(ycbcr);
				if (lookup[index] !== this.self.Target.Unclassified) {
					var rgb = this.getRGBfromType(lookup[index]);
					classifiedData.data[offset + 0] = rgb[0];
					classifiedData.data[offset + 1] = rgb[1];
					classifiedData.data[offset + 2] = rgb[2];
					classifiedData.data[offset + 3] = 255;
				} else {
					classifiedData.data[offset + 0] = 0;
					classifiedData.data[offset + 1] = 0;
					classifiedData.data[offset + 2] = 0;
					classifiedData.data[offset + 3] = 255;
				}
			}
		}
		return classifiedData;
	},
	getYCBCR: function (x, y) {
		var components = this.getRawImageComponents();

		x = 320 - x - 1;
		y = 240 - y - 1;

		var l = components[0].lines[y][x];
		// divide cb and cr by 2 as it's using YUV422 so there is half the cb/cr
		var cb = components[1].lines[y][Math.floor(x / 2)];
		var cr = components[2].lines[y][Math.floor(x / 2)];

		return [l, cb, cr];
	},
	getRGBfromType: function (typeId) {
		var Target = this.self.Target;
		switch (typeId) {
			case Target.Unclassified:
				return [0, 0, 0];
			case Target.Line:
				return [255, 255, 255];
			case Target.Ball:
				return [255, 144, 0];
			case Target.Field:
				return [0, 255, 0];
			case Target.Goal:
				return [255, 255, 0];
			case Target.Cyan:
				return [0, 255, 255];
			case Target.Magenta:
				return [255, 0, 255];
			default:
				return [0, 0, 0];
		}
	},
	drawImage: function (image, callback, thisArg) {
		//this.drawImageB64(image, callback, thisArg);
		this.drawImageB64YUV(image, callback, thisArg);
	},
	drawImageB64: function (image, callback, thisArg) {
		var data = String.fromCharCode.apply(null, new Uint8ClampedArray(image.data.toArrayBuffer()));
		var uri = 'data:image/jpeg;base64,' + btoa(data);
		var imageObj = new Image();
		var ctx = this.getRawContext();
		imageObj.src = uri;
		imageObj.onload = function () {
			ctx.drawImage(imageObj, 0, 0, image.width, image.height);
			callback.call(thisArg, ctx);
		};
	},
	drawImageB64YUV: function (image, callback, thisArg) {
		var me = this;
//        var data = String.fromCharCode.apply(null, new Uint8ClampedArray(image.data.toArrayBuffer()));
		var d2 = new Uint8ClampedArray(image.data.toArrayBuffer());
//        var uri = 'data:image/jpeg;base64,' + btoa(data);
		var imageObj = new JpegImage();
		imageObj.parse(d2);
		var ctx = me.getRawContext();
		var data = ctx.getImageData(0, 0, 320, 240);
		imageObj.copyToImageData(data);
		ctx.putImageData(data, 0, 0);
		ctx.save();
		ctx.scale(-1, -1);
		ctx.drawImage(ctx.canvas, -320, -240, 320, 240);
		ctx.restore();
		data = ctx.getImageData(0, 0, 320, 240);
		me.setRawImageData(data);
		me.setRawImageComponents(imageObj.components);
		me.renderImages();
	},
	testDrawImage: function () {
		var uri = 'resources/images/test_image2.jpg';
//      var imageObj = new Image();
//      var ctx = this.getRawContext();
//      imageObj.src = uri;
//      imageObj.onload = function () {
//          ctx.drawImage(imageObj, 0, 0, 320, 240);
//          me.setRawImageData(ctx.getImageData(0, 0, 320, 240));
//          me.renderImages();
//      };
		var me = this;
		var imageObj = new JpegImage();
		imageObj.onload = function () {
			var ctx = me.getRawContext();
			var data = ctx.getImageData(0, 0, 320, 240);
			imageObj.copyToImageData(data);
			ctx.putImageData(data, 0, 0);
			ctx.save();
			ctx.scale(-1, -1);
			ctx.drawImage(ctx.canvas, -320, -240, 320, 240);
			ctx.restore();
			data = ctx.getImageData(0, 0, 320, 240);
			me.setRawImageData(data);
			me.setRawImageComponents(imageObj.components);
			me.renderImages();
		};
		imageObj.load(uri);
	}
});