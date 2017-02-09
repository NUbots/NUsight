Ext.define('NU.view.window.ClassifierController', {
	// TODO: COOOOOOMENT THIS MONSTER
	// GOD DAMN
	extend: 'NU.view.window.DisplayController',
	alias: 'controller.Classifier',
	requires: [
		'NU.util.Defer',
		'NU.util.Vision',
		'NU.view.webgl.Vision',
		'NU.view.webgl.Classifier',
		'NU.view.webgl.magicwand.Selection',
		'NU.view.webgl.magicwand.Classify'
	],
	rawImageRenderer: null,
	config: {
		rawContext: null,
		classifiedContext: null,
		frozen: false,
		lookup: null,
		lookupBackwardHistory: null,
		lookupForwardHistory: null,
		lookupHistoryLength: 15,
		lookupVertexBuffer: null,
		previewLookup: null,
		overwrite: false,
		selectionTool: 'magic_wand',
		polygonPoints: null,
		startPoint: null,
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
		imageFormat: null,
		lutNeedsUpdate: false
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
		 * Classification tools
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
	 * FourCC's Image Format codes
	 * Copied from NUbots:shared/utility/vision/fourcc.h
 	 */
	Format: {
		GREY: 0x59455247,
		Y12 : 0x20323159,
		Y16 : 0x20363159,
		GRBG: 0x47425247,
		RGGB: 0x42474752,
		GBRG: 0x47524247,
		BGGR: 0x52474742,
		GR12: 0x32315247,
		RG12: 0x32314752,
		GB12: 0x32314247,
		BG12: 0x32314742,
		GR16: 0x36315247,
		RG16: 0x36314752,
		GB16: 0x36314247,
		BG16: 0x36314742,
		Y411: 0x31313459,
		UYVY: 0x59565955,
		YUYV: 0x56595559,
		YM24: 0x34324d59,
		RGB3: 0x33424752,
		JPEG: 0x4745504a,
		UNKNOWN: 0,
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
		this.selectionClassifier.updateOverwrite(this.getOverwrite());
	},
	onChangeRange: function (checkbox, newValue, oldValue, eOpts) {
		this.setRange(newValue);
	},
	onChangeTolerance: function (checkbox, newValue, oldValue, eOpts) {
		this.setTolerance(newValue);
		this.selectionRenderer.updateTolerance(this.getTolerance());
		this.selectionRenderer.render();
		this.selectionClassifier.updateTolerance(this.getTolerance());
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
	onChangeOutputColourSpace: function (combo, newValue, oldValue, eOpts) {
		if (combo.isValid()) {
			var scatter3d = this.lookupReference('scatter3d');
			scatter3d.updateOutputColourSpace(newValue);
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
			this.classifiedRenderer.updateBitsR(newValue);
			this.selectionClassifier.updateBitsR(newValue);
			this.resetBits();
			this.selectionRenderer.render();
		}
	},
	onChangeBitsG: function (field, newValue, oldValue, eOpts) {
		if (field.isValid()) {
			this.self.LutBitsPerColorCb = newValue;
			this.classifiedRenderer.updateBitsG(newValue);
			this.selectionClassifier.updateBitsG(newValue);
			this.resetBits();
			this.selectionRenderer.render();
		}
	},
	onChangeBitsB: function (field, newValue, oldValue, eOpts) {
		if (field.isValid()) {
			this.self.LutBitsPerColorCr = newValue;
			this.classifiedRenderer.updateBitsB(newValue);
			this.selectionClassifier.updateBitsB(newValue);
			this.resetBits();
			this.selectionRenderer.render();
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
		// Load the protocol buffers we use
		NU.Network.loadProto('message.input.Image');
		NU.Network.loadProto('message.vision.LookUpTable');

		// these must initialized here so there is an object per-controller
		this.resetLUT();
		this.setLookupForwardHistory([]);
		this.setLookupBackwardHistory([]);
		this.setPreviewLookup({});
		this.setPolygonPoints([]);
		this.setMagicWandPoints([]);
		this.setMagicWandColours([]);
		this.lutDiffs = [];
		this.onLookUpTableDiffBatch = this.onLookUpTableDiffBatch.bind(this);
	},
	onEsc: function () {
		this.selectionRenderer.updateTolerance(-1);
		this.selectionRenderer.render();
	},
	onAfterRender: function () {
		var rawLayeredCanvas = this.lookupReference('rawImage').getController();
		var rawImageLayer = rawLayeredCanvas.add('raw', {
			webgl: true,
			webglAttributes: {
				antialias: false
			}
		});
		this.rawImageRenderer = Ext.create('NU.view.webgl.Vision', {
			shader: 'Vision',
			canvas: rawImageLayer.canvas,
			context: rawImageLayer.context,
			autoRender: false
		});

		rawLayeredCanvas.add('selection');
		this.setRawContext(rawImageLayer.context);
		this.setRawLayeredCanvas(rawLayeredCanvas);

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
			context: classifiedLayer.contex,
			autoRender: false

		});

		this.selectionRenderer = Ext.create('NU.view.webgl.magicwand.Selection', {
			shader: 'magicwand/Selection',
			canvas: selectionLayer.canvas,
			context: selectionLayer.context,
			autoRender: false
		});

		this.selectionClassifier = Ext.create('NU.view.webgl.magicwand.Classify', {

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
				mousewheel: this.onMouseWheel,
				scope: this
			});
		}, this);

		Promise.all([
			this.rawImageRenderer.onReady(),
			this.classifiedRenderer.onReady(),
			this.selectionRenderer.onReady(),
			this.selectionClassifier.onReady()
		]).then(function () {
			var lut = new Uint8Array(this.getLookup().buffer);
			this.classifiedRenderer.updateLut(lut);
			this.selectionClassifier.updateLut(lut);

			this.testDrawImage(function () {
				this.addEvents();
			});

			//this.testClassifier();
		}.bind(this));
	},

	addEvents: function () {
		this.mon(NU.Network, {
			'message.input.Image': this.onImage,
			'message.vision.LookUpTable': this.onLookUpTable,
			'message.vision.LookUpTableDiff': this.onLookUpTableDiff,
			scope: this
		});
	},

	testClassifier: function () {

		if (this.lastIndex === 0) {
			return;
		}

		requestAnimationFrame(this.testClassifier.bind(this));

		if (!this.last) this.last = Date.now();
		if (!this.lastIndex) this.lastIndex = 0;

		var lut = this.getLookup();
		var n = Math.pow(2, this.self.LutBitsPerColorCb) * (Math.pow(2, this.self.LutBitsPerColorCr) / 2);
		for (var i = 0; i < n; i ++) {
			/*var index = this.getLUTIndex([
				Math.round(Math.random() * 255),
				Math.round(Math.random() * 255),
				Math.round(Math.random() * 255)
			]);*/
			var index = this.lastIndex;
			var types = Object.keys(this.self.Target);
			var type = types[1 + Math.floor(Math.random() * (types.length - 1))];
			var typeId = this.self.Target[type];
			//var typeId = this.self.Target.Field;
			lut[index] = typeId;
			this.lastIndex = (this.lastIndex + 1) % Math.pow(2, this.self.LutBitsPerColorY + this.self.LutBitsPerColorCb + this.self.LutBitsPerColorCr);
		}
		this.updateClassifiedData();

		var now = Date.now();
		//console.log(1000 / (now - this.last));
		this.last = now;

	},
	refreshScatter: function () {

		var scatter3d = this.lookupReference('scatter3d');
		scatter3d.updatePlot(
			this.getLookupVertexBuffer(),
			this.getLookup(),
			this.self.LutBitsPerColorY,
			this.self.LutBitsPerColorCb,
			this.self.LutBitsPerColorCr,
			this.getRenderYUV(),
			this.getRenderCube()
		);
	},
	resetLUT: function () {
		var lut = new Uint8ClampedArray(Math.pow(2, this.self.LutBitsPerColorY + this.self.LutBitsPerColorCb + this.self.LutBitsPerColorCr));
		for (var i = 0; i < lut.length; i++) {
			lut[i] = this.self.Target.Unclassified;
		}
		this.setLookup(lut); // TODO: make constant or something

		var bitsR = this.self.LutBitsPerColorY;
		var bitsG = this.self.LutBitsPerColorCb;
		var bitsB = this.self.LutBitsPerColorCr;
		var maxR = Math.pow(2, bitsR);
		var maxG = Math.pow(2, bitsG);
		var maxB = Math.pow(2, bitsB);
		var lutSize = lut.length;
		var vertices = new Float32Array(lutSize * 3);
		var index = 0;
		for (var r = 0; r < maxR; r++) {
			for (var g = 0; g < maxG; g++) {
				for (var b = 0; b < maxB; b++) {
					vertices[index    ] = r;
					vertices[index + 1] = g;
					vertices[index + 2] = b;
					index += 3;
				}
			}
		}
		this.setLookupVertexBuffer(vertices);
	},
	download: function () {
		NU.Network.sendCommand("download_lut", this.getRobotId());
	},
	upload: function () {
		var lookupTable = new API.message.vision.LookUpTable();
		lookupTable.setTable(this.getLookup().buffer);
		lookupTable.setBitsY(this.self.LutBitsPerColorY);
		lookupTable.setBitsCb(this.self.LutBitsPerColorCb);
		lookupTable.setBitsCr(this.self.LutBitsPerColorCr);
		NU.Network.send(lookupTable, this.getRobotId(), true);
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
	onLookUpTable: function (robot, lookuptable) {

		// TODO: remove
		if (robot.get('id') !== this.getRobotId()) {
			return;
		}

		var table = lookuptable.getTable();

		// TODO: validate?
		var lut = new Uint8ClampedArray(table.toArrayBuffer());
		this.addHistory();

		// TODO: unhack
		this.lookupReference('bitsR').setValue(lookuptable.getBitsY());
		this.lookupReference('bitsG').setValue(lookuptable.getBitsCb());
		this.lookupReference('bitsB').setValue(lookuptable.getBitsCr());
		this.setLookup(lut);
		this.selectionRenderer.render();

		this.updateClassifiedData();
		this.renderClassifiedImage();
	},
	onLookUpTableDiff: function (robot, tableDiff) {

		// TODO: remove
		if (robot.get('id') !== this.getRobotId()) {
			return;
		}

		var diffs = tableDiff.getDiff();
		for (var i = 0; i < diffs.length; i++) {
			var diff = diffs[i];
			this.lutDiffs.push({
				index: diff.getLutIndex(),
				classification: diff.getClassification()
			});
		}

		NU.Defer.defer('lut_diffs', this.onLookUpTableDiffBatch, 50);
	},
	onLookUpTableDiffBatch: function () {
		var lut = this.getLookup();
		var diffs = this.lutDiffs;
		while (diffs.length > 0) {
			var diff = diffs.shift();
			lut[diff.index] = diff.classification;
		}
		this.updateClassifiedData();
		this.renderClassifiedImage();
	},
	onImage: function (robot, image) {

		// TODO: remove
		if (robot.get('id') !== this.getRobotId()) {
			return;
		}

		if (image) { // TODO: is this needed?
			if (!this.getFrozen()) {
				this.autoSize(image.dimensions.x, image.dimensions.y);
				this.drawImage(image, function (ctx) {
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
	onMouseWheel: function (e) {
		var direction = Math.sign(e.event.wheelDelta);
		var speed = 2;
		var tolerance = this.lookupReference('tolerance');
		tolerance.setValue(tolerance.getValue() + speed * direction);
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
		this.selectionRenderer.render();
		this.selectionClassifier.updateColour(colour);
		this.selectionClassifier.updateTolerance(tolerance);
	},
	magicWandClassify: function (x, y) {
		var lut = this.getLookup();
		var typeId = this.self.Target[this.getTarget()];
		this.selectionClassifier.updateClassification(typeId);
		this.selectionClassifier.updateTolerance(this.getTolerance());
		this.selectionClassifier.updateLut(new Uint8Array(lut.buffer));
		this.selectionClassifier.render();
		this.selectionClassifier.getLut(lut);
		this.updateClassifiedData();
		this.renderClassifiedImage();
		// clear selection layer
		this.selectionRenderer.updateTolerance(-1);
		this.selectionRenderer.render();
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

			if (x < minX) { minX = x; }
			if (x > maxX) { maxX = x; }
			if (y < minY) { minY = y; }
			if (y > maxY) { maxY = y; }
		});

		return [
			[minX, minY],
			[maxX, maxY]
		];
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
						var nearYcbcr = [y, cb, cr];
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
	},
	renderClassifiedImage: function () {
		var layeredCanvas = this.getClassifiedLayeredCanvas();
		var selectionLayer = layeredCanvas.get('selection');
		selectionLayer.clear();
		var selectionContext = selectionLayer.context;
		this.renderEllipseOverlay(selectionContext);
		this.renderRectangleOverlay(selectionContext);
		this.renderPolygonOverlay(selectionContext);
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
	updateClassifiedData: function () {
		var lut = new Uint8Array(this.getLookup().buffer);
		this.classifiedRenderer.updateLut(lut);
		this.classifiedRenderer.render();
		this.selectionClassifier.updateLut(lut);
		this.selectionClassifier.render();
		this.refreshScatter();
	},
	getColour: function (x, y) {
		var components = this.getRawImageComponents();
		var imageWidth = this.getImageWidth();
		var imageHeight = this.getImageHeight();

		//x = imageWidth - x - 1;
		//y = imageHeight - y - 1;

		switch (this.getImageFormat()) {
			case this.Format.JPEG:
				var offset = 3 * (y * imageWidth + x);
				return [
					components[offset    ],
					components[offset + 1],
					components[offset + 2]
				];
			case this.Format.YUYV:
				var offset = 2 * (y * imageWidth + x);
				var shift = (x % 2) * 2;
				return [
					components[offset    ],
					components[offset + 1 - shift],
					components[offset + 3 - shift]
				];
			case this.Format.YM24:
				return [
					components[3 * (y * imageWidth + x)    ],
					components[3 * (y * imageWidth + x) + 1],
					components[3 * (y * imageWidth + x) + 2]
				];
			case this.Format.UYVY:
				var offset = 2 * (y * imageWidth + x);
				var shift = (x % 2) * 2;
				return [
					components[offset + 1],
					components[offset + 0 - shift],
					components[offset + 2 - shift]
				];
			default:
				throw new Error('Unsupported format');
		}
	},
	drawImage: function (image, callback, thisArg) {
		this.setImageFormat(image.format);
		switch (image.format) {
			case this.Format.JPEG:
				this.drawImageJPEG(image, callback, thisArg);
				break;
			case this.Format.YUYV:
				this.drawImageYbCr422(image, callback, thisArg);
				break;
			case this.Format.YM24:
				this.drawImageYbCr444(image, callback, thisArg);
				break;
            case this.Format.UYVY:
                this.drawImageY422(image, callback, thisArg);
                break;
			case this.Format.GRBG:
				this.drawImageBayer(image, callback, thisArg);
				break;
			case this.Format.RGGB:
				this.drawImageBayer(image, callback, thisArg);
				break;
			case this.Format.GBRG:
				this.drawImageBayer(image, callback, thisArg);
				break;
			case this.Format.BGGR:
				this.drawImageBayer(image, callback, thisArg);
				break;
			default:
				console.log('Format: ', image.format);
				throw 'Unsupported Format';
		}
	},
	drawImageBayer: function (image) {
		var width = this.getImageWidth();
		var height = this.getImageHeight();
		var data = new Uint8Array(image.data.toArrayBuffer());
		var bytesPerPixel = 2;

		var renderers = [this.rawImageRenderer, this.classifiedRenderer, this.selectionRenderer];
		for (var i = 0, len = renderers.length; i < len; i++) {
			var renderer = renderers[i];
			renderer.resize(width, height);
			renderer.updateTexture('rawImage', data, width, height, THREE.LuminanceFormat);
			renderer.updateUniform('imageFormat', image.format);
			renderer.updateUniform('imageWidth', width);
			renderer.updateUniform('imageHeight', height);
			renderer.render();
		}

		this.rawImageRenderer.updateUniform('resolution', new THREE.Vector2(image.dimensions.x, image.dimensions.y));
		this.classifiedRenderer.updateUniform('resolution', new THREE.Vector2(image.dimensions.x, image.dimensions.y));

		if(image.format == Format.GRBG) {
			this.rawImageRenderer.updateUniform('firstRed', new THREE.Vector2(1, 0));
			this.classifiedRenderer.updateUniform('firstRed', new THREE.Vector2(1, 0));
		}else if(image.format == Format.RGGB) {
			console.log('test');
			this.rawImageRenderer.updateUniform('firstRed', new THREE.Vector2(0, 0));
			this.classifiedRenderer.updateUniform('firstRed', new THREE.Vector2(0, 0));
		}else if(image.format == Format.GBRG) {
			this.rawImageRenderer.updateUniform('firstRed', new THREE.Vector2(0 , 1));
			this.classifiedRenderer.updateUniform('firstRed', new THREE.Vector2(0 , 1));
		}else if(image.format == Format.BGGR) {
			this.rawImageRenderer.updateUniform('firstRed', new THREE.Vector2(1, 1));
			this.classifiedRenderer.updateUniform('firstRed', new THREE.Vector2(1, 1));
		} else {
			this.rawImageRenderer.updateUniform('firstRed', new THREE.Vector2(0, 0));
			this.classifiedRenderer.updateUniform('firstRed', new THREE.Vector2(0, 0));
		}

		this.selectionClassifier.resize(width, height);
		this.selectionClassifier.updateRawImage(this.Format.YUYV, data, width, height, THREE.LuminanceFormat);
		this.setRawImageComponents(data);
	},
	drawImageYbCr422: function (image) {
		var width = this.getImageWidth();
		var height = this.getImageHeight();
		var data = new Uint8Array(image.data.toArrayBuffer());
		var bytesPerPixel = 2;

		var renderers = [this.rawImageRenderer, this.classifiedRenderer, this.selectionRenderer];
		for (var i = 0, len = renderers.length; i < len; i++) {
			var renderer = renderers[i];
			renderer.resize(width, height);
			renderer.updateTexture('rawImage', data, width * bytesPerPixel, height, THREE.LuminanceFormat);
			renderer.updateUniform('imageFormat', this.Format.YUYV);
			renderer.updateUniform('imageWidth', width);
			renderer.updateUniform('imageHeight', height);
			renderer.render();
		}
		this.selectionClassifier.resize(width, height);
		this.selectionClassifier.updateRawImage(this.Format.YUYV, data, width, height, THREE.LuminanceFormat);
		this.setRawImageComponents(data);
	},
    drawImageY422: function (image) {
        var width = this.getImageWidth();
        var height = this.getImageHeight();
        var data = new Uint8Array(image.data.toArrayBuffer());
        var bytesPerPixel = 2;

        var renderers = [this.rawImageRenderer, this.classifiedRenderer, this.selectionRenderer];
        for (var i = 0, len = renderers.length; i < len; i++) {
            var renderer = renderers[i];
            renderer.resize(width, height);
            renderer.updateTexture('rawImage', data, width * bytesPerPixel, height, THREE.LuminanceFormat);
            renderer.updateUniform('imageFormat', this.Format.UYVY);
            renderer.updateUniform('imageWidth', width);
            renderer.updateUniform('imageHeight', height);
            renderer.render();
        }
        this.selectionClassifier.resize(width, height);
        this.selectionClassifier.updateRawImage(this.Format.YUYV, data, width, height, THREE.LuminanceFormat);
        this.setRawImageComponents(data);
    },
	drawImageYbCr444: function (image) {
		var width = this.getImageWidth();
		var height = this.getImageHeight();
		var data = new Uint8Array(image.data.toArrayBuffer());
		var renderers = [this.rawImageRenderer, this.classifiedRenderer, this.selectionRenderer];
		for (var i = 0, len = renderers.length; i < len; i++) {
			var renderer = renderers[i];
			renderer.updateRawImage(data, width, height, THREE.RGBFormat);
			renderer.render();
		}
		this.selectionClassifier.resize(width, height);
		this.selectionClassifier.updateRawImage(this.Format.YM24, data, width, height, THREE.RGBFormat);
		this.setRawImageComponents(data);
	},
	drawImageJPEG: function (image, callback, thisArg) {
		var d2 = new Uint8ClampedArray(image.data.toArrayBuffer());
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
		this.setRawImageComponents(imageObj.components);
//		this.renderImages();
		callback.call(thisArg, ctx);
	},
	testDrawImage: function (callback) {
		var uri = 'resources/images/test_image2.jpg';
		var imageObj = new JpegImage();
		imageObj.onload = function () {
			imageObj.colorTransform = false; // keep in YCbCr
			if (imageObj.adobe) {
				imageObj.adobe.transformCode = false;
			}
			var rawData = imageObj.getData(imageObj.width, imageObj.height);
			var image = new API.message.input.Image();
			image.setData(rawData);
			image.setCameraId(0);
			image.setDimensions({
				x: imageObj.width,
				y: imageObj.height
			});
			image.setFormat(this.Format.YM24);
			var record = NU.Network.getRobotStore().findRecord('id', this.getRobotId());
			this.onImage(record, image);
			callback.call(this);
		}.bind(this);
		imageObj.load(uri);
	}
});
