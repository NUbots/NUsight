Ext.define('NU.view.webgl.Classifier', {
	extend: 'NU.view.webgl.WebGL',
	constructor: function (config) {
		Ext.applyIf(config, {
			uniforms: {
				rawImage: {type: 't'},
				image: {type: 't'},
				lut: {type: 't'},
				rawUnderlayOpacity: {type: 'f', value: 0.5},
				bitsR: {type: '1i', value: 6},
				bitsG: {type: '1i', value: 6},
				bitsB: {type: '1i', value: 6}
			}
		});

		this.callParent(arguments);
	},
	updateRawImage: function (data, width, height, format) {
		this.updateTexture('rawImage', data, width, height, format);
	},
	updateImage: function (data, width, height, format) {
		this.updateTexture('image', data, width, height, format);
	},
	updateLut: function (data) {
		// create a square texture
		var size = Math.ceil(Math.sqrt(data.length));
		this.updateTexture('lut', data, size, size, THREE.LuminanceFormat);
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

