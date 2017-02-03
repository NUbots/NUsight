Ext.define('NU.view.webgl.VisionDiff', {
	extend: 'NU.view.webgl.WebGL',
	constructor: function (config) {
		Ext.applyIf(config, {
			uniforms: {
				rawImage: {type: 't'},
				imageWidth: {type: 'i'},
				imageHeight: {type: 'i'},
				imageFormat: {type: 'i'},
				resolution: {type: 'v2'},
				firstRed: {type: 'v2'}
			}
		});

		this.callParent(arguments);
	},
	updateRawImage: function (data, width, height, format) {
		this.resize(width, height);
		this.updateTexture('rawImage', data, width, height, format);
		this.updateUniform('imageWidth', width);
		this.updateUniform('imageHeight', height);
	}
});

