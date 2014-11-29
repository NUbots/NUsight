Ext.define('NU.view.webgl.magicwand.Classify', {
	extend: 'NU.view.webgl.WebGL',
	buffer: null,
	constructor: function (config) {
		var canvas = new Ext.Element(document.createElement('canvas'));
		var webglAttributes = {antialias: false, preserveDrawingBuffer: true};
		var context = canvas.dom.getContext('webgl', webglAttributes) || canvas.dom.getContext('experimental-webgl', webglAttributes);
		Ext.applyIf(config, {
			canvas: canvas,
			context: context,
			uniforms: {
				lut: {type: 't'},
				lutSize: {type: 'f'},
				bitsR: {type: 'f', value: 6},
				bitsG: {type: 'f', value: 6},
				bitsB: {type: 'f', value: 6},
				rawImage: {type: 't'},
				colour: {type: '3fv', value: [0, 0, 0]},
				tolerance: {type: 'f', value: -1},
				classification: {type: 'f', value: -1}
			}
		});

		this.callParent(arguments);
	},
	resize: function (width, height) {
		if (width !== this.getWidth() || height !== this.getHeight() || !this.buffer) {
			this.buffer = new Uint8Array(width * height * 4);
		}
		this.callParent(arguments);
	},
	updateLut: function (data) {
		// create a square texture
		var size = Math.ceil(Math.sqrt(data.length));
		var sizeSqr = size * size;
		if (data.length != sizeSqr) {
			// does not fit evenly, create new array with tail padding
			var newData = new Uint8Array(sizeSqr);
			newData.set(data);
			data = newData;
		}
		this.resize(size, size);
		this.updateTexture('lut', data, size, size, THREE.LuminanceFormat);
		this.updateUniform('lutSize', size);
	},
	updateRawImage: function (data, width, height, format) {
		this.updateTexture('rawImage', data, width, height, format);
	},
	updateColour: function (value) {
		this.updateUniform('colour', value);
	},
	updateTolerance: function (value) {
		this.updateUniform('tolerance', value);
	},
	updateClassification: function (value) {
		this.updateUniform('classification', value);
	},
	/**
	 * @param {ArrayBuffer} [lut]
	 * @param {int} [size]
	 * @returns {*}
	 */
	getLut: function (lut, size) {
		var width = this.getWidth();
		var height = this.getHeight();

		if (size === undefined) {
			size = width * height;
		}

		if (lut === undefined) {
			lut = new Uint8Array(size);
		}

		var gl = this.renderer.getContext();
		gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, this.buffer);

		for (var i = 0; i < this.buffer.length; i += 4) {
			lut[i / 4] = this.buffer[i];
		}

		return lut;
	}
});

