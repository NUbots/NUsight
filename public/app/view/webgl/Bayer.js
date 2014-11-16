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
	updateImage: function (imageData, width, height) {
		var width = image.dimensions.x;
		var height = image.dimensions.y;
		var data = new Uint8Array(image.data.toArrayBuffer(), 0, width * height);
		var texture = new THREE.DataTexture(data, width, height,
			THREE.LuminanceFormat, THREE.UnsignedByteType, THREE.Texture.DEFAULT_MAPPING,
			THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter
		);
		texture.generateMipmaps = false;
		texture.needsUpdate = true;

		var material = this.plane.material;
		material.uniforms.image.value = texture;
		material.uniforms.sourceSize.value = [width, height, 1 / width, 1 / height];
		material.needsUpdate = true;

		this.render();
	}
});
