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
		range: 2,
		tolerance: 50,
		renderZoom: true,
		renderRawUnderlay: false,
		rawUnderlayOpacity: 0.5,
		magicWandPoints: null,
		target: 'Field',
		centerEllipse: false,
		lastDraw: 0,
		renderYUV: false,
		renderCube: false
	},
	statics: {
		Target: {
			'Unclassified': 0,
			'Line': 1,
			'Field': 2,
			'Goal': 8,
			'Ball': 6
		},
		Tool: {
			'Point': 0,
			'MagicWand': 1,
			'Polygon': 2
		},
		LutBitsPerColor: 7
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
		'rawValue': true,
		'classifiedValue': true,
		'scatter3d': true
	},
	init: function () {
		// these must initialized here so there is an object per-controller
		this.resetLUT();
		this.setLookupForwardHistory([]);
		this.setLookupBackwardHistory([]);
		this.setPreviewLookup({});
		this.setPolygonPoints([]);
		this.setMagicWandPoints([]);

		NU.util.Network.on('vision', Ext.bind(this.onVision, this));
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
				default:
					throw new Error('Wat is ' + typeId);
			}
		}

		function scale(value) {
			// scale from [0, 255] to [-1, 1]
			return (100 * value) / 255 - 50;
		}

		var index;
		var min = 0;
		var max = 255;
		var numSteps = Math.pow(2, this.self.LutBitsPerColor);
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
		this.setLookup(new Uint8ClampedArray(Math.pow(2, 3 * this.self.LutBitsPerColor))); // TODO: make constant or something
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
		var lookupTable = new API.Message.LookupTable();
		lookupTable.setTable(this.getLookup());
		lookupTable.setSave(save);
		message.setLookupTable(lookupTable);
		NU.util.Network.send(this.getRobotIP(), message);
	},
	getLUTIndex: function (ycbcr) {
		var index = 0;

		var bits = this.self.LutBitsPerColor;
		var bitsRemoved = 8 - bits;
		index += ((ycbcr[0] >> bitsRemoved) << (2 * bits));
		index += ((ycbcr[1] >> bitsRemoved) << bits);
		index += (ycbcr[2] >> bitsRemoved);

		return index;
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
	onVision: function (robotIP, api_message) {

		// TODO: remove
		if (robotIP !== this.robotIP) {
			return;
		}

		var api_vision = api_message.vision;
		var image = api_vision.image;

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
		var queue = [];
		var checked = {};
		queue.push([x, y]);
		if (tolerance === undefined) {
			tolerance = this.getTolerance();
		}
		var ycbcr = this.getYCBCR(x, y);
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
					var dist = Math.sqrt(Math.pow(ycbcr[0] - neighbourYcbcr[0], 2) + Math.pow(ycbcr[1] - neighbourYcbcr[1], 2) + Math.pow(ycbcr[2] - neighbourYcbcr[2], 2));
					var newPoint = [neighbourX, neighbourY];
					var hash = this.hashPoint(newPoint);
					if (dist <= tolerance && checked[hash] === undefined) {
						queue.push(newPoint);
						points.push(newPoint);
					}
					checked[hash] = true;
				}
			}
		}
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
		this.setMagicWandPoints([]);
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
	classifyPoint: function (x, y, target, doRender, range) {
		var ycbcr = this.getYCBCR(x, y);
		if (target === undefined) {
			target = this.getTarget();
		}
		this.addLookupColour(ycbcr, target, range);
		if (doRender === undefined || doRender) {
			this.updateClassifiedData();
			this.renderClassifiedImage();
			this.renderPolygonOverlays();
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
		var minRange = Math.floor(range / 2);
//		var step = 1 << (8 - this.self.LutBitsPerColor - 1);
		var min = 0;
		var max = Math.pow(2, 8) - 1;
		for (var dy = -minRange; dy < minRange; dy++) {
			for (var dcb = -minRange; dcb < minRange; dcb++) {
				for (var dcr = -minRange; dcr < minRange; dcr++) {
					// cap it
					var y = Math.max(min, Math.min(max, ycbcr[0] + dy));
					var cb = Math.max(min, Math.min(max, ycbcr[1] + dcb));
					var cr = Math.max(min, Math.min(max, ycbcr[2] + dcr));
					var nearYcbcr = [
							y,
							cb,
							cr,
					];
					var index = this.getLUTIndex(nearYcbcr);
					var typeId = this.self.Target[type];
					if (this.getOverwrite() || lookup[index] === this.self.Target.Unclassified) {
						lookup[index] = typeId;
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