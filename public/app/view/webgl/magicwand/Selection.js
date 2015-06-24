Ext.define('NU.view.webgl.magicwand.Selection', {
	extend: 'NU.view.webgl.WebGL',
	constructor: function (config) {
		Ext.applyIf(config, {
			uniforms: {
				rawImage: {type: 't'},
				imageWidth: {type: 'i'},
				imageHeight: {type: 'i'},
				imageFormat: {type: 'i'},
				colour: {type: '3fv', value: [0, 0, 0]},
				tolerance: {type: 'f', value: -1}
			}
		});

		this.callParent(arguments);
	},
	updateRawImage: function (data, width, height, format) {
		this.resize(width, height);
		this.updateTexture('rawImage', data, width, height, format);
	},
	updateColour: function (value) {
		this.updateUniform('colour', value);
	},
	updateTolerance: function (value) {
		this.updateUniform('tolerance', value);
	}
});

