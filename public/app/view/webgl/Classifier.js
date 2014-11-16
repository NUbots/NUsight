Ext.define('NU.view.webgl.Classifier', {
	extend: 'NU.view.webgl.WebGL',
	constructor: function (config) {
		Ext.applyIf({
			uniforms: {
				image: {type: 't'},
				lut: {type: 't'}
			}
		}, config);

		this.callParent(arguments);
	},
	updateImage: function (data) {
		// TODO: unhack
		var texture = new THREE.DataTexture(data, 1280, 960,
			THREE.RGBAFormat, THREE.UnsignedByteType, THREE.Texture.DEFAULT_MAPPING,
			THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter
		);
		texture.generateMipmaps = false;
		texture.needsUpdate = true;

		var material = this.plane.material;
		material.uniforms.image.value = texture;
		material.needsUpdate = true;

		this.render();
	},
	updateLut: function (data) {
		var size = Math.ceil(Math.sqrt(data.length)); // TODO: check valid
		var texture = new THREE.DataTexture(new Uint8Array(data.buffer), size, size,
			THREE.LuminanceFormat, THREE.UnsignedByteType, THREE.Texture.DEFAULT_MAPPING,
			THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter
		);
		texture.generateMipmaps = false;
		texture.needsUpdate = true;

		var material = this.plane.material;
		material.uniforms.lut.value = texture;
		material.needsUpdate = true;

		this.render();
	}
});

