Ext.define('NU.view.webgl.VisionDiff', {
	extend: 'NU.view.webgl.WebGL',
	constructor: function (config) {
		Ext.applyIf(config, {
			uniforms: {
				imageWidth: {type: 'f'},
				imageHeight: {type: 'f'},
				rawImage: {type: 't'}
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

