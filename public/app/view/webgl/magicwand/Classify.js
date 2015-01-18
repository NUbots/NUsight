Ext.define('NU.view.webgl.magicwand.Classify', {
	extend: 'NU.view.webgl.WebGL',
	buffer: null,
	imagePointCloud: null,
	imageVertexShaderText: null,
	imageFragmentShaderText: null,
	constructor: function (config) {
		var canvas = new Ext.Element(document.createElement('canvas'));
		var webglAttributes = {antialias: false, preserveDrawingBuffer: true};
		var context = canvas.dom.getContext('webgl', webglAttributes) || canvas.dom.getContext('experimental-webgl', webglAttributes);
		Ext.applyIf(config, {
			shader: 'magicwand/LookupTable',
			canvas: canvas,
			context: context,
			autoRender: false,
			uniforms: {
				lut: {type: 't'}
			}
		});

		this.callParent(arguments);

		this.addReadyPromise(new Promise(function (resolve) {
			NU.view.webgl.WebGL.loadShaders('magicwand/Classify').spread(function (vertexShaderText, fragmentShaderText) {
				this.imageVertexShaderText = vertexShaderText;
				this.imageFragmentShaderText = fragmentShaderText;
				this.createPointCloud(this.getWidth(), this.getHeight());
				resolve();
			}.bind(this));
		}.bind(this)));
	},
	createPointCloud: function (width, height) {
		if (this.imagePointCloud) {
			this.scene.remove(this.imagePointCloud);
		}
		var geometry = new THREE.BufferGeometry();
		var itemSize = 3;
		var data = new Float32Array(width * height * itemSize); // TODO: unhack
		geometry.addAttribute('position', new THREE.BufferAttribute(data, itemSize));
		var material = new THREE.ShaderMaterial({
			uniforms: {
				lutSize: {type: 'f', value: 512},
				bitsR: {type: 'f', value: 6},
				bitsG: {type: 'f', value: 6},
				bitsB: {type: 'f', value: 6},
				colour: {type: '3fv', value: [0, 0, 0]},
				tolerance: {type: 'f', value: -1},
				classification: {type: 'f', value: -1}
			},
			vertexShader: this.imageVertexShaderText,
			fragmentShader: this.imageFragmentShaderText,
			transparent: true,
			blending: THREE.CustomBlending,
			blendSrc: THREE.SrcAlphaFactor,
			blendDst: THREE.OneMinusSrcAlphaFactor
		});
		this.imagePointCloud = new THREE.PointCloud(geometry, material);
		this.imagePointCloud.frustumCulled = false;
		this.imagePointCloud.position.set(0, 0, 1);
		this.scene.add(this.imagePointCloud);
	},
	resize: function (width, height) {
		if (width !== this.getWidth() || height !== this.getHeight() || !this.buffer) {
			this.buffer = new Uint8Array(width * height * 4);
		}
		this.callParent(arguments);
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
		this.resize(size, size);
		this.updateTexture('lut', data, size, size, THREE.LuminanceFormat);
		this.updateUniform('lutSize', size, this.imagePointCloud.material);
	},
	updateRawImage: function (data, width, height, format) {
		var positionAttr = this.imagePointCloud.geometry.getAttribute('position');
		if (!positionAttr || positionAttr.length != data.length) {
			this.createPointCloud(width, height);
			positionAttr = this.imagePointCloud.geometry.getAttribute('position');
		}
		positionAttr.set(data);
	},
	updateColour: function (value) {
		this.updateUniform('colour', value, this.imagePointCloud.material);
	},
	updateTolerance: function (value) {
		this.updateUniform('tolerance', value, this.imagePointCloud.material);
	},
	updateClassification: function (value) {
		this.updateUniform('classification', value, this.imagePointCloud.material);
	},
	updateBitsR: function (value) {
		this.updateUniform('bitsR', value, this.imagePointCloud.material);
	},
	updateBitsG: function (value) {
		this.updateUniform('bitsG', value, this.imagePointCloud.material);
	},
	updateBitsB: function (value) {
		this.updateUniform('bitsB', value, this.imagePointCloud.material);
	},
	/**
	 * @param {ArrayBuffer} [lut]
	 * @param {int} [size]
	 * @returns {*}
	 */
	getLut: function (lut, size) {
		var width = this.getWidth();
		var height = this.getHeight();

		if (size === undefined) {
			size = width * height;
		}

		if (lut === undefined) {
			lut = new Uint8Array(size);
		}

		var gl = this.renderer.getContext();
		gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, this.buffer);

		for (var i = 0; i < this.buffer.length; i += 4) {
			lut[i / 4] = this.buffer[i];
		}

		return lut;
	}
});

