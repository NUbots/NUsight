Ext.define('NU.view.webgl.Vision', {
	extend: 'NU.view.webgl.WebGL',
	constructor: function (config) {
		Ext.applyIf(config, {
			uniforms: {
				rawImage: {type: 't'},
				imageWidth: {type: 'i'},
				imageHeight: {type: 'i'},
				imageFormat: {type: 'i'},
				resolution: {type: 'v2', value: new THREE.Vector2(1280, 1024)},
				firstRed: {type: 'v2', value: new THREE.Vector2(0, 0)}
			}
		});

		this.callParent(arguments);
	},
	updateRawImage: function (data, width, height, format) {
		this.resize(width, height);
		this.updateTexture('rawImage', data, width, height, format);
	}
});
