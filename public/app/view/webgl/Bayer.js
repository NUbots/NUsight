/*
Ext.define('NU.view.webgl.Bayer', {
	extend: 'NU.view.webgl.WebGL',
	constructor: function (config) {
		Ext.applyIf({
			uniforms: {
				sourceSize: {type: '4f', value: [1280, 960, 1 / 1280, 1 / 960]},
				firstRed: {type: '2f', value: [0, 0]},
				image: {type: 't'}
			}
		}, config);

		this.callParent(arguments);
	},
	updateImage: function (data, width, height, format) {
		this.resize(width, height);
		this.updateTexture('image', data, width, height, format);
		this.updateUniform('sourceSize', [width, height, 1 / width, 1 / height]);
	}
});

*/