Ext.define('NU.view.window.ClassifierController', {
	// TODO: COOOOOOMENT THIS MONSTER
	// GOD DAMN
	extend: 'NU.view.window.DisplayController',
	alias: 'controller.Classifier',
	requires: [
		'NU.util.Vision',
		'NU.view.webgl.Classifier',
		'NU.view.webgl.magicwand.Selection',
		'NU.view.webgl.magicwand.Classify'
	],
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
		bitsPerPixel: 4,
		imageWidth: 320,
		imageHeight: 240,
		leftMouseDown: false,
		range: 10,
		tolerance: 50,
		renderZoom: false,
		renderRawUnderlay: true,
		rawUnderlayOpacity: 0.5,
		magicWandPoints: null,
		magicWandColours: null,
		target: 'Field',
		centerEllipse: false,
		renderYUV: false,
		renderCube: false,
		rawLayeredCanvas: null,
		classifiedLayeredCanvas: null,
		imageFormat: null
	},
	statics: {
		/**
		 * Possible object classifications, must be an ASCII code <= 255
		 */
		Target: {
			'Unclassified': 'u'.charCodeAt(0), // 117
			'Line': 'w'.charCodeAt(0), // 119
			'Field': 'g'.charCodeAt(0), // 103
			'Goal': 'y'.charCodeAt(0), // 121
			'Ball': 'o'.charCodeAt(0), // 111
			'Cyan': 'c'.charCodeAt(0), // 99
			'Magenta': 'm'.charCodeAt(0) // 109
		},
		/**
		 * Classifcation tools
		 */
		Tool: {
			'Point': 0,
			'MagicWand': 1,
			'Polygon': 2
		},
		/**
		 * The number of bits used in the lookup table per colour channel
		 */
		LutBitsPerColorY: 6,
		LutBitsPerColorCb: 6,
		LutBitsPerColorCr: 6
	},
	/**
	 * Callback when the undo button is clicked
	 */
	onUndo: function () {
		this.undoHistory();
	},
	/**
	 * Callback when the redo button is clicked
	 */
	onRedo: function () {
		this.redoHistory();
	},
	/**
	 * Callback when the point tool is selected
	 */
	onToolPoint: function () {
		this.setSelectionTool('point');
	},
	/**
	 * Callback when the magic wand tool is toggled
	 *
	 * @param btn The button
	 * @param pressed True if the button was toggled on, false if toggled off
	 */
	onToolMagicWand: function (btn, pressed) {
		if (pressed) {
			this.setSelectionTool('magic_wand');
		} else {
			this.setMagicWandPoints([]);
			this.setMagicWandColours([]);
			this.renderImages();
		}
	},
	/**
	 * Callback when the polygon tool is toggled
	 *
	 * @param btn The button
	 * @param pressed True if the button was toggled on, false if toggled off
	 */
	onToolPolygon: function (btn, pressed) {
		if (pressed) {
			this.setSelectionTool('polygon');
		} else {
			this.setPolygonPoints([]);
			this.renderImages();
		}
	},
	/**
	 * Callback when the rectangle tool is toggled
	 *
	 * @param btn The button
	 * @param pressed True if the button was toggled on, false if toggled off
	 */
	onToolRectangle: function (btn, pressed) {
		if (pressed) {
			this.setSelectionTool('rectangle');
		} else {
			this.setStartPoint(null);
			this.renderImages();
		}
	},
	/**
	 * Callback when the ellipse tool is toggled
	 *
	 * @param btn The button
	 * @param pressed True if the button was toggled on, false if toggled off
	 */
	onToolEllipse: function (btn, pressed) {
		if (pressed) {
			this.setSelectionTool('ellipse');
		} else {
			this.setStartPoint(null);
			this.renderImages();
		}
	},
	/**
	 * Callback when the zoom tool is toggled
	 *
	 * @param btn The button
	 * @param pressed True if the button was toggled on, false if toggled off
	 */
	onToolZoom: function (btn, pressed) {
		this.setRenderZoom(pressed);
		if (!pressed) {
			this.getRawLayeredCanvas().clear('zoom');
			this.getClassifiedLayeredCanvas().clear('zoom');
		}
		this.renderImages();
	},
	/**
	 * Callback when the green target is clicked
	 */
	onTargetGreen: function () {
		this.setTarget('Field');
	},
	/**
	 * Callback when the yellow target is clicked
	 */
	onTargetYellow: function () {
		this.setTarget('Goal');
	},
	/**
	 * Callback when the cyan target is clicked
	 */
	onTargetCyan: function () {
		this.setTarget('Cyan');
	},
	/**
	 * Callback when the magenta target is clicked
	 */
	onTargetMagenta: function () {
		this.setTarget('Magenta');
	},
	/**
	 * Callback when the white target is clicked
	 */
	onTargetWhite: function () {
		this.setTarget('Line');
	},
	/**
	 * Callback when the black target is clicked
	 */
	onTargetBlack: function () {
		this.setTarget('Unclassified');
	},
	/**
	 * Callback when the orange target is clicked
	 */
	onTargetOrange: function () {
		this.setTarget('Ball');
	},
	/**
	 * Callback when the reset button is clicked
	 */
	onReset: function () {
		this.addHistory();
		this.resetLUT();
		this.updateClassifiedData();
		this.renderClassifiedImage();
	},
	/**
	 * Callback when the download button is clicked
	 */
	onDownload: function () {
		this.download();
	},
	/**
	 * Callback when the upload button is clicked
	 */
	onUpload: function () {
		this.upload();
	},
	/**
	 * Callback when the save button is clicked
	 */
	onUploadSave: function () {
		this.upload(true);
	},
	/**
	 * Callback when the refresh button is clicked
	 */
	onRefresh: function () {
		this.updateClassifiedData();
		this.renderClassifiedImage();
	},
	/**
	 * Callback when the snapshot/freeze checkbox is toggled
	 *
	 * @param checkbox The checkbox
	 * @param newValue True if the checkbox has been checked, false if unchecked
	 */
	onChangeSnapshot: function (checkbox, newValue) {
		this.setFrozen(newValue);
	},
	onToggleOverwrite: function (btn, pressed) {
		this.setOverwrite(pressed);
	},
	onChangeRange: function (checkbox, newValue, oldValue, eOpts) {
		this.setRange(newValue);
	},
	onChangeTolerance: function (checkbox, newValue, oldValue, eOpts) {
		this.setTolerance(newValue);
		this.selectionRenderer.updateTolerance(this.getTolerance());
	},
	onChangeRawUnderlay: function (checkbox, newValue, oldValue, eOpts) {
		this.setRenderRawUnderlay(newValue);
		if (!this.getRenderRawUnderlay()) {
			this.classifiedRenderer.updateRawUnderlayOpacity(0.0);
		} else {
			this.classifiedRenderer.updateRawUnderlayOpacity(this.getRawUnderlayOpacity());
		}
	},
	onChangeRawUnderlayOpacity: function (checkbox, newValue, oldValue, eOpts) {
		if (checkbox.isValid()) {
			this.setRawUnderlayOpacity(newValue);
			this.classifiedRenderer.updateRawUnderlayOpacity(this.getRawUnderlayOpacity());
		}
	},
	onChangeRenderYUVBox: function (checkbox, newValue, oldValue, eOpts) {
		if (checkbox.isValid()) {
			this.setRenderYUV(newValue);
			this.refreshScatter();
		}
	},
	onChangeRenderCubeBox: function (checkbox, newValue, oldValue, eOpts) {
		if (checkbox.isValid()) {
			this.setRenderCube(newValue);
			this.refreshScatter();
		}
	},
	onChangeBitsR: function (field, newValue, oldValue, eOpts) {
		if (field.isValid()) {
			this.self.LutBitsPerColorY = newValue;
			this.resetBits();
			this.classifiedRenderer.updateBitsR(newValue);
		}
	},
	onChangeBitsG: function (field, newValue, oldValue, eOpts) {
		if (field.isValid()) {
			this.self.LutBitsPerColorCb = newValue;
			this.resetBits();
			this.classifiedRenderer.updateBitsG(newValue);
		}
	},
	onChangeBitsB: function (field, newValue, oldValue, eOpts) {
		if (field.isValid()) {
			this.self.LutBitsPerColorCr = newValue;
			this.resetBits();
			this.classifiedRenderer.updateBitsB(newValue);
		}
	},
	resetBits: function () {
		this.resetLUT();
		this.updateClassifiedData();
		// TODO: add bit sizes into lookup table object so undo/redo can work over bit size changes
		this.setLookupForwardHistory([]);
		this.setLookupBackwardHistory([]);
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
	},
	onAfterRender: function () {
		var rawLayeredCanvas = this.lookupReference('rawImage').getController();
		var rawContext = rawLayeredCanvas.add('raw').context;
		rawLayeredCanvas.add('selection');
		this.setRawContext(rawContext);
		this.setRawLayeredCanvas(rawLayeredCanvas);

		var view = this.getView();
		view.mon(NU.util.Network, 'image', this.onImage, this);
		view.mon(NU.util.Network, 'lookup_table', this.onLookUpTable, this);

		var classifiedLayeredCanvas = this.lookupReference('classifiedImage').getController();
		var classifiedLayer = classifiedLayeredCanvas.add('classified', {
			webgl: true,
			webglAttributes: {
				antialias: false
			}
		});
		classifiedLayeredCanvas.add('selection');
		var selectionLayer = classifiedLayeredCanvas.add('selection_webgl', {
			webgl: true,
			webglAttributes: {
				antialias: false
			}
		});
		this.setClassifiedLayeredCanvas(classifiedLayeredCanvas);

		this.classifiedRenderer = Ext.create('NU.view.webgl.Classifier', {
			shader: 'Classifier',
			canvas: classifiedLayer.canvas,
			context: classifiedLayer.context
		});

		this.selectionRenderer = Ext.create('NU.view.webgl.magicwand.Selection', {
			shader: 'magicwand/Selection',
			canvas: selectionLayer.canvas,
			context: selectionLayer.context
		});

		this.selectionClassifier = Ext.create('NU.view.webgl.magicwand.Classify', {
			shader: 'magicwand/Classify'
		});

		function clickBind(callback, preventDefault) {
			return function (e, element) {
				if (preventDefault === undefined || preventDefault) {
					e.preventDefault();
				}

				var el = Ext.get(element);
				var rawX = e.getX() - el.getLeft();
				var rawY = e.getY() - el.getTop();

				var x = Math.round(rawX * (this.getImageWidth() / this.getRawLayeredCanvas().getImageWidth()));
				var y = Math.round(rawY * (this.getImageHeight() / this.getRawLayeredCanvas().getImageHeight()));

				callback.call(this, x, y, rawX, rawY, e);
			};
		}

		var rawContainer = this.lookupReference('rawImage').getEl();
		var classifiedContainer = this.lookupReference('classifiedImage').getEl();

		[rawContainer, classifiedContainer].forEach(function (element) {
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
			var rgb = this.getRGBfromType(typeId);
			return new THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
		}

		function scale(value) {
			// scale from [0, 255] to [-50, 50]
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
						var rgb = NU.util.Vision.YCbCrtoRGB([x, y, z]);
						colour.setRGB(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
						data.push([scale(z), scale(x), scale(y), colour]);
					} else {
						index = this.getLUTIndex([x, y, z]);
						if (lut[index] !== this.self.Target.Unclassified) {
							var colour;
							if (this.getRenderYUV()) {
								colour = new THREE.Color();
								var rgb = NU.util.Vision.YCbCrtoRGB([x, y, z]);
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

		var scatter3d = this.lookupReference('scatter3d');
		scatter3d.setPointData(data);
		scatter3d.updatePlot();

	},
	resetLUT: function () {
		var lut = new Uint8ClampedArray(Math.pow(2, this.self.LutBitsPerColorY + this.self.LutBitsPerColorCb + this.self.LutBitsPerColorCr));
		for (var i = 0; i < lut.length; i++) {
			lut[i] = this.self.Target.Unclassified;
		}
		this.setLookup(lut); // TODO: make constant or something
	},
	download: function () {
		var message = new API.Message();
		message.setType(API.Message.Type.COMMAND);
		message.setFilterId(0);
		message.setUtcTimestamp(Date.now() / 1000);
		var command = new API.Message.Command();
		command.setCommand("download_lut");
		message.setCommand(command);
		NU.util.Network.send(this.getRobotIP(), message);
	},
	upload: function (save) {
		save = !!save; // convert to bool
		var message = new API.Message();
		message.setType(API.Message.Type.LOOKUP_TABLE);
		message.setFilterId(0);
		message.setUtcTimestamp(Date.now() / 1000);
		var lookupTable = new API.Vision.LookUpTable();
		lookupTable.setTable(this.getLookup().buffer);
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
	onLookUpTable: function (robotIP, lookuptable) {

		// TODO: remove
		if (robotIP !== this.robotIP) {
			return;
		}

		var table = lookuptable.getTable();

		// TODO: validate?
		var lut = new Uint8ClampedArray(table.toArrayBuffer());
		this.addHistory();
		this.setLookup(lut);
		this.updateClassifiedData();
		this.renderClassifiedImage();
	},
	onImage: function (robotIP, image) {

		// TODO: remove
		if (robotIP !== this.robotIP) {
			return;
		}

		if (image) { // TODO: is this needed?
			if (!this.getFrozen()) {
				var Format = API.Image.Format;

				this.autoSize(image.dimensions.x, image.dimensions.y);
				this.drawImage(image, function (ctx) {
					this.setRawImageData(ctx.getImageData(0, 0, this.getImageWidth(), this.getImageHeight()));
					this.updateClassifiedData();
					this.renderImages();
				}, this);
			}
		}

	},
	autoSize: function (width, height) {
		if (width === this.getImageWidth() && height === this.getImageHeight()) {
			return; // didn't change
		}

		this.setImageWidth(width);
		this.setImageHeight(height);
		this.getRawLayeredCanvas().setCanvasSize(width, height);
		this.getClassifiedLayeredCanvas().setCanvasSize(width, height);
	},
	onImageMouseMove: function (x, y) {
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
	},
	onImageClick: function (x, y, rawX, rawY, e) {
		switch (this.getSelectionTool()) {
			case 'point':
				this.addHistory();
				this.classifyPoint(x, y);
				break;
			case 'magic_wand':
				this.magicWandSelect(x, y);
				if (e.ctrlKey || e.button === 1) {
					this.addHistory();
					this.magicWandClassify(x, y);
				}
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
	onImageDblClick: function (x, y, rawX, rawY, e) {
		switch (this.getSelectionTool()) {
			case 'point':
			case 'magic_wand':
			case 'rectangle':
			case 'ellipse':
				this.onImageClick(x, y, rawX, rawY, e);
				break;
			case 'polygon':
				this.addHistory();
				this.classifyPolygon();
				break;
		}
	},
	onImageRightClick: function (x, y, rawX, rawY, e) {
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
				if (e.ctrlKey) {
					this.magicWandSelect(x, y);
				}
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
		if (tolerance === undefined) {
			tolerance = this.getTolerance();
		}
		var colour = this.getColour(x, y);
		this.selectionRenderer.updateColour(colour);
		this.selectionRenderer.updateTolerance(tolerance);
	},
	hashPoint: function (point) {
		return point[0] + "," + point[1];
	},
	magicWandClassify: function (x, y) {
		var lut = this.getLookup();
		var typeId = this.self.Target[this.getTarget()];
		this.selectionClassifier.updateClassification(typeId);
		this.selectionClassifier.getLut(lut);
		this.updateClassifiedData();
		this.renderClassifiedImage();
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
			var ycbcr = this.getColour(coordPoint[0], coordPoint[1]);
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
		var ycbcr = this.getColour(x, y);
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
		var bitsPerPixel = this.getBitsPerPixel();
		var offset = bitsPerPixel * (y * this.getImageWidth() + x);
		if (data === undefined) {
			data = this.getRawImageData().data;
		}
		return data.slice(offset, offset + bitsPerPixel);
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
	hash: function (ycc) {
		return ycc[0] + '.' + ycc[1] + '.' + ycc[2];
	},
	renderImages: function () {
		this.renderRawImage();
		this.renderClassifiedImage();
	},
	renderRawImage: function () {
		var layeredCanvas = this.getRawLayeredCanvas();
		var selectionLayer = layeredCanvas.get('selection');
		selectionLayer.clear();
		var selectionContext = selectionLayer.context;
		this.renderEllipseOverlay(selectionContext);
		this.renderRectangleOverlay(selectionContext);
		this.renderPolygonOverlay(selectionContext);
		this.renderMagicWandOverlay(selectionContext);
	},
	renderClassifiedImage: function () {
		var layeredCanvas = this.getClassifiedLayeredCanvas();
		var selectionLayer = layeredCanvas.get('selection');
		selectionLayer.clear();
		var selectionContext = selectionLayer.context;
		this.renderEllipseOverlay(selectionContext);
		this.renderRectangleOverlay(selectionContext);
		this.renderPolygonOverlay(selectionContext);
		this.renderMagicWandOverlay(selectionContext);
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
		var imageWidth = this.getImageWidth();
		var imageHeight = this.getImageHeight();
		var bitsPerPixel = this.getBitsPerPixel();
		var data = ctx.getImageData(0, 0, imageWidth, imageHeight);
		var points = this.getMagicWandPoints();
//		var colours = [];
		points.forEach(function (point) {
			var x = point[0];
			var y = point[1];
			var offset = bitsPerPixel * (imageWidth * y + x);
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
	updateClassifiedData: function () {
		this.classifiedRenderer.updateLut(new Uint8Array(this.getLookup().buffer));
		this.refreshScatter();
	},
	getColour: function (x, y) {
		var components = this.getRawImageComponents();
		var imageWidth = this.getImageWidth();
		var imageHeight = this.getImageHeight();

		x = imageWidth - x - 1;
		y = imageHeight - y - 1;

		var Format = API.Image.Format;
		switch (this.getImageFormat()) {
			case Format.JPEG:
				var offset = 3 * (y * imageWidth + x);
				return [
					components[offset + 0],
					components[offset + 1],
					components[offset + 2]
				];
			case Format.YCbCr444:
				return [
					components[3 * (y * imageWidth + x) + 0],
					components[3 * (y * imageWidth + x) + 1],
					components[3 * (y * imageWidth + x) + 2]
				];
			default:
				throw new Error('Unsupported format');
		}
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
		var Format = API.Image.Format;
		this.setImageFormat(image.format);
		switch (image.format) {
			case Format.JPEG:
				//this.drawImageB64(image, callback, thisArg);
				this.drawImageB64YUV(image, callback, thisArg);
				break;
			case Format.YCbCr444:
				this.drawImageYbCr444(image, callback, thisArg);
				break;
			default:
				throw 'Unsupported Format';
		}
	},
	drawImageYbCr444: function (image, callback, thisArg) {
		var width = this.getImageWidth();
		var height = this.getImageHeight();
		var ctx = this.getRawContext();
		var imageData = ctx.createImageData(width, height);
		var data = new Uint8ClampedArray(image.data.toArrayBuffer());
		var bitsPerPixel = this.getBitsPerPixel();
		var bitsPerPixel2 = 3;
		var total = width * height * bitsPerPixel2;
		for (var i = 0; i < data.length / bitsPerPixel2; i++) {
			var offset = bitsPerPixel * i;
			var offset2 = bitsPerPixel2 * i;
			var rgb = NU.util.Vision.YCbCrtoRGB([
				data[offset2 + 0],
				data[offset2 + 1],
				data[offset2 + 2]
			]);
			imageData.data[offset + 0] = rgb[0];
			imageData.data[offset + 1] = rgb[1];
			imageData.data[offset + 2] = rgb[2];
			imageData.data[offset + 3] = 255;
		}
		ctx.putImageData(imageData, 0, 0);
		this.setRawImageComponents(data);
		callback.call(thisArg, ctx);
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
//        var data = String.fromCharCode.apply(null, new Uint8ClampedArray(image.data.toArrayBuffer()));
		var d2 = new Uint8ClampedArray(image.data.toArrayBuffer());
//        var uri = 'data:image/jpeg;base64,' + btoa(data);
		var imageObj = new JpegImage();
		imageObj.parse(d2);
		var ctx = this.getRawContext();
		var imageWidth = this.getImageWidth();
		var imageHeight = this.getImageHeight();
		var data = ctx.getImageData(0, 0, imageWidth, imageHeight);
		imageObj.copyToImageData(data);
		ctx.putImageData(data, 0, 0);
//		ctx.save();
//		ctx.scale(-1, -1);
//		ctx.drawImage(ctx.canvas, -imageWidth, -imageHeight, imageWidth, imageHeight);
		ctx.drawImage(ctx.canvas, 0, 0, imageWidth, imageHeight);
//		ctx.restore();
		data = ctx.getImageData(0, 0, imageWidth, imageHeight);
		this.setRawImageData(data);
		this.setRawImageComponents(imageObj.components);
//		this.renderImages();
		callback.call(thisArg, ctx);
	},
	testDrawImage: function () {
		var uri = 'resources/images/test_image2.jpg';
		var rotated = true;
//      var imageObj = new Image();
//      var ctx = this.getRawContext();
//      imageObj.src = uri;
//      imageObj.onload = function () {
//          ctx.drawImage(imageObj, 0, 0, 320, 240);
//          this.setRawImageData(ctx.getImageData(0, 0, 320, 240));
//          thisn.renderImages();
//      }.bind(this);
		var imageWidth = this.getImageWidth();
		var imageHeight = this.getImageHeight();
		var imageObj = new JpegImage();
		imageObj.onload = function () {
			var ctx = this.getRawContext();
			var data = ctx.getImageData(0, 0, imageWidth, imageHeight);
			imageObj.copyToImageData(data);
			ctx.putImageData(data, 0, 0);

			if (rotated) {
				ctx.save();
				ctx.scale(-1, -1);
				ctx.drawImage(ctx.canvas, -imageWidth, -imageHeight, imageWidth, imageHeight);
				ctx.restore();
			} else {
				ctx.drawImage(ctx.canvas, 0, 0, imageWidth, imageHeight);
			}

			data = ctx.getImageData(0, 0, imageWidth, imageHeight);
			this.setRawImageData(data);
			imageObj.colorTransform = false; // keep in YCbCr
			if (imageObj.adobe) {
				imageObj.adobe.transformCode = false;
			}
			var rawData = imageObj.getData(imageWidth, imageHeight);
			this.setRawImageComponents(rawData);
			this.setImageFormat(API.Image.Format.JPEG);
			this.renderImages();

			setTimeout(function () {
				var lut = new Uint8Array(this.getLookup().buffer);
				this.classifiedRenderer.updateLut(lut);
				this.selectionClassifier.updateLut(lut);
				this.selectionClassifier.updateRawImage(rawData, imageWidth, imageHeight, THREE.RGBFormat);
				this.classifiedRenderer.updateRawImage(rawData, imageWidth, imageHeight, THREE.RGBFormat);
				this.selectionRenderer.updateRawImage(rawData, imageWidth, imageHeight, THREE.RGBFormat);
				this.classifiedRenderer.updateImage(new Uint8Array(data.data.buffer), imageWidth, imageHeight, THREE.RGBAFormat);
			}.bind(this), 1000);
		}.bind(this);
		imageObj.load(uri);
	}
});
