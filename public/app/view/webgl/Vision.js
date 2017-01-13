Ext.define('NU.view.webgl.Vision', {
	extend: 'NU.view.webgl.WebGL',
	constructor: function (config) {
		Ext.applyIf(config, {
			uniforms: {
				rawImage: {type: 't'},
				imageWidth: {type: 'i'},
				imageHeight: {type: 'i'},
				imageFormat: {type: 'i'},
				sourceSize: {type: '4f', value: new THREE.Vector4(1280, 1024, 1 / 1280, 1 / 1024)},
				firstRed: {type: '2f', value: new THREE.Vector2(0, 0)}
			}
		});

		this.callParent(arguments);
	},
	updateRawImage: function (data, width, height, format) {
		this.resize(width, height);
		this.updateTexture('rawImage', data, width, height, format);
		this.updateUniform('sourceSize', new THREE.Vector4(width, height, 1 / width, 1 / height));
	}
});
