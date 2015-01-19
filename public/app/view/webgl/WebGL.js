Ext.define('NU.view.webgl.WebGL', {
	scene: null,
	camera: null,
	renderer: null,
	plane: null,
	vertexShaderText: null,
	fragmentShaderText: null,
	mixins: {
		ready: 'NU.mixin.Ready'
	},
	config: {
		/**
		 * The width of the plane
		 */
		width: 320,
		/**
		 * The height of the plane
		 */
		height: 240,
		/**
		 * The name of the shader to use
		 */
		shader: null,
		/**
		 * The uniforms to be used with the ShaderMaterial
		 */
		uniforms: null,
		/**
		 * The canvas to use for drawing
		 */
		canvas: null,
		/**
		 * The context to draw with
		 */
		context: null,
		/**
		 * Automatically render the scene after an update
		 */
		autoRender: true
	},
	constructor: function (config) {
		this.mixins.ready.constructor.call(this, config);
		this.initConfig(config);

		var canvas = this.getCanvas();
		var width = this.getWidth();
		var height = this.getHeight();

		this.scene = new THREE.Scene();
		// these are dummy left/right/top/bottom values as they are updated in the resize method
		this.camera = new THREE.OrthographicCamera(0, 1, 0, 1, 0.1, 10);
		this.scene.add(this.camera);
		// move camera away from origin to see plane
		this.camera.position.set(0, 0, 5);

		this.renderer = new THREE.WebGLRenderer({
			antialias: false,
			canvas: canvas.el.dom,
			context: this.getContext()
		});

		// load the shaders
		var shaders = NU.view.webgl.WebGL.loadShaders(this.getShader());

		// once loaded, create the scene
		shaders.spread(function (vertexShaderText, fragmentShaderText) {
			this.vertexShaderText = vertexShaderText;
			this.fragmentShaderText = fragmentShaderText;
			this.resize(width, height);
			// set component as ready
			this.ready();
		}.bind(this));
	},
	/**
	 * Creates a plane with a custom shader material based on the vertexShaderText and fragmentShaderText
	 *
	 * @param width The width of the plane
	 * @param height The height of the plane
	 * @returns {THREE.Mesh} The plane mesh
	 */
	createPlane: function (width, height) {
		var geometry = new THREE.PlaneBufferGeometry(width, height);
		geometry.applyMatrix(new THREE.Matrix4().makeTranslation(width / 2, height / 2, 0));
		var material = new THREE.ShaderMaterial({
			uniforms: this.getUniforms(),
			vertexShader: this.vertexShaderText,
			fragmentShader: this.fragmentShaderText
		});
		var mesh = new THREE.Mesh(geometry, material);
		mesh.frustumCulling = false;
		return mesh;
	},
	/**
	 * Resize the plane/camera/viewport to account for different sized images
	 *
	 * @param width The width of the plane
	 * @param height The height of the plane
	 * @return {bool} true if resized, false if no changes made
	 */
	resize: function (width, height) {
		if (width === this.getWidth() && height === this.getHeight() && this.plane) {
			return false; // nothing changed
		}
		if (this.plane) {
			this.scene.remove(this.plane);
		}

		this.plane = this.createPlane(width, height);
		this.scene.add(this.plane);

		this.camera.left = 0;
		this.camera.right = width;
		this.camera.top = height;
		this.camera.bottom = 0;
		this.camera.updateProjectionMatrix();

		this.renderer.setViewport(0, 0, width, height);

		this.setWidth(width);
		this.setHeight(height);

		this.getCanvas().set({
			width: width,
			height: height
		});

		return true;
	},
	/**
	 * Render the scene
	 */
	render: function () {
		this.renderer.render(this.scene, this.camera);
	},
	/**
	 * Starts the render animation.
	 */
	animate: function () {
		this.render();

		requestAnimationFrame(function () {
			this.animate();
		}.bind(this));
	},
	/**
	 * Update a texture's data
	 *
	 * See http://threejs.org/docs/#Reference/Textures/DataTexture for more information on possible formats
	 *
	 * @param name The name of the texture uniform
	 * @param {Uint8Array} data The flat data array of the texture
	 * @param width The width of the texture
	 * @param height The height of the texture
	 * @param format The ThreeJS format of the data array, the default is THREE.LuminanceFormat
	 * @param [material] The material to update
	 */
	updateTexture: function (name, data, width, height, format, material) {
		if (material === undefined) {
			material = this.plane.material;
		}
		var texture = material.uniforms[name].value;
		if (!texture) {
			texture = new THREE.DataTexture(data, width, height,
				format || THREE.LuminanceFormat, THREE.UnsignedByteType, THREE.Texture.DEFAULT_MAPPING,
				THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter
			);
			material.uniforms[name].value = texture;
		} else {
			texture.image.data = data;
			texture.image.width = width;
			texture.image.height = height;
		}
		if (!this.powerOf2(width) || !this.powerOf2(height)) {
			// if texture is a non-power-of-2, set alignment to 1-byte and turn off mipmapping
			texture.unpackAlignment = 1;
			texture.generateMipmaps = false;
		}
		texture.needsUpdate = true;
		material.needsUpdate = true;

		if (this.getAutoRender()) {
			this.render();
		}
	},
	powerOf2: function (value) {
		// http://www.skorks.com/2010/10/write-a-function-to-determine-if-a-number-is-a-power-of-2/
		return value != 0 && value & (value - 1) == 0;
	},
	/**
	 * Update the plane material uniform based on the given name, and re-render
	 *
	 * @param name The name of the uniform
	 * @param value The value of the uniform
	 * @param [material] The material to update
	 */
	updateUniform: function (name, value, material) {
		if (material === undefined) {
			material = this.plane.material;
		}
		material.uniforms[name].value = value;
		material.needsUpdate = true;
		if (this.getAutoRender()) {
			this.render();
		}
	},
	statics: {
		/**
		 * Load the vertex and fragment shaders given the name of the shader.
		 * It will attempt to load shader/[name]Vertex.c and shader/[name]Fragment.c
		 *
		 * @param shader The name of the shader
		 * @returns {Promise} A promise of the response of two shaders
		 */
		loadShaders: function (shader) {
			var basePath = Ext.Loader.getPath('NU') + '/shader';
			return Promise.all([
				NU.view.webgl.WebGL.loadShader(basePath, basePath + '/' + shader + 'Vertex.c'),
				NU.view.webgl.WebGL.loadShader(basePath, basePath + '/' + shader + 'Fragment.c')
			]);
		},
		/**
		 * Load a shader given a url
		 *
		 * Supports a custom directive in the format of:
		 *
		 * #include "filename"
		 *
		 * This can be used recursively, where included files can include other files.
		 * It acts like a C include in that it will fetch the source code from the included file and insert it directly
		 * where included.
		 * It uses asynchronous ajax calls along with bluebird promises to achieve parallelism.
		 *
		 * @param basePath The base part of the url excluding the filename
		 * @param url The full url to load
		 * @returns {Promise} A promise of the response
		 */
		loadShader: function (basePath, url) {
			var includeDirective = /#include[\t ]+"([^"]+)"/g;
			var includeDirectiveFilename = '#include[\\t ]+"$filename"';

			return new Promise(function (resolve) {
				Ext.Ajax.request({
					url: url,
					success: function (response) {
						var shaderText = response.responseText;
						var matches;
						var count = 0;
						while ((matches = includeDirective.exec(shaderText)) !== null) {
							count++;
							var filename = matches[1];
							var newUrl = basePath + '/' + filename;
							NU.view.webgl.WebGL.loadShader(basePath, newUrl).then(function (subShaderText) {
								count--;
								var pattern = new RegExp(includeDirectiveFilename.replace('$filename', RegExp.escape(filename)));
								shaderText = shaderText.replace(pattern, subShaderText);
								if (count === 0) {
									resolve(shaderText);
								}
							});
						}
						if (count === 0) {
							resolve(shaderText);
						}
					}.bind(this)
				});
			}.bind(this));
		}
	}
});
