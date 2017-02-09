Ext.define('NU.view.webgl.Classifier', {
	extend: 'NU.view.webgl.WebGL',
	constructor: function (config) {
		Ext.applyIf(config, {
			uniforms: {
				rawImage: {type: 't'},
				imageWidth: {type: 'i'},
				imageHeight: {type: 'i'},
				imageFormat: {type: 'i'},
				lut: {type: 't'},
				lutSize: {type: 'f'},
				rawUnderlayOpacity: {type: 'f', value: 0.5},
				bitsR: {type: 'f', value: 6},
				bitsG: {type: 'f', value: 6},
				bitsB: {type: 'f', value: 6},
				resolution: {type: 'v2', value: new THREE.Vector2(1280, 1024)},
				firstRed: {type: 'v2', value: new THREE.Vector2(0, 0)}
			}
		});

		this.callParent(arguments);
	},
	updateRawImage: function (data, width, height, format) {
		this.resize(width, height);
		this.updateTexture('rawImage', data, width, height, format);
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
		this.updateTexture('lut', data, size, size, THREE.LuminanceFormat);
		this.updateUniform('lutSize', size);
	},
	updateRawUnderlayOpacity: function (value) {
		this.updateUniform('rawUnderlayOpacity', value);
	},
	updateBitsR: function (value) {
		this.updateUniform('bitsR', value);
	},
	updateBitsG: function (value) {
		this.updateUniform('bitsG', value);
	},
	updateBitsB: function (value) {
		this.updateUniform('bitsB', value);
	}
});

