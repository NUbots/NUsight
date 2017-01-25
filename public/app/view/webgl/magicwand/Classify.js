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
		var itemSize = 3;
		var size = width * height * itemSize;

		function genData(size) {
			var data = new Float32Array(size);
			for (var i = 0, len = data.length; i < len; i++) {
				var offset = i * 3;
				var x = i % width;
				var y = Math.floor(i / width);
				data[offset] = x;
				data[offset + 1] = y;
				data[offset + 2] = 0;
			}
			return data;
		}

		var geometry = new THREE.BufferGeometry();
		var data = genData(size);
		var material;
		if (!this.imagePointCloud) {
			geometry.addAttribute('position', new THREE.BufferAttribute(data, itemSize));
			material = new THREE.ShaderMaterial({
				uniforms: {
					rawImage: {type: 't'},
					imageWidth: {type: 'i'},
					imageHeight: {type: 'i'},
					imageFormat: {type: 'i'},
					lut: {type: 't'},
					lutSize: {type: 'f', value: 512},
					bitsR: {type: 'f', value: 6},
					bitsG: {type: 'f', value: 6},
					bitsB: {type: 'f', value: 6},
					colour: {type: '3fv', value: [0, 0, 0]},
					tolerance: {type: 'f', value: -1},
					classification: {type: 'f', value: -1},
					overwrite: {type: 'i', value: 0}
				},
				vertexShader: this.imageVertexShaderText,
				fragmentShader: this.imageFragmentShaderText
			});
		} else {
			material = this.imagePointCloud.material;
			this.scene.remove(this.imagePointCloud);
			geometry.addAttribute('position', new THREE.BufferAttribute(data, itemSize));
		}
		this.imagePointCloud = new THREE.Points(geometry, material);
		this.imagePointCloud.frustumCulled = false;
		this.imagePointCloud.depthTest = false;
		this.imagePointCloud.depthWrite = false;
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
		this.updateTexture('lut', data, size, size, THREE.LuminanceFormat, this.imagePointCloud.material);
		this.updateUniform('lutSize', size, this.imagePointCloud.material);
	},
	updateRawImage: function (imageFormat, data, width, height, textureFormat) {
		var positionAttr = this.imagePointCloud.geometry.getAttribute('position');
		if (!positionAttr || positionAttr.count !== width * height * 3) {
			this.createPointCloud(width, height);
		}

		var Format = API.message.input.Image.Format;
		if (imageFormat === Format.YCbCr422) {
			var bytesPerPixel = 2;
			this.updateTexture('rawImage', data, width * bytesPerPixel, height, textureFormat, this.imagePointCloud.material);
		} else {
			this.updateTexture('rawImage', data, width, height, textureFormat, this.imagePointCloud.material);
		}
		this.updateUniform('imageFormat', imageFormat, this.imagePointCloud.material);
		this.updateUniform('imageWidth', width, this.imagePointCloud.material);
		this.updateUniform('imageHeight', height, this.imagePointCloud.material);
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
	updateOverwrite: function (value) {
		this.updateUniform('overwrite', value, this.imagePointCloud.material);
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

