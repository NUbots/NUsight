Ext.define('NU.util.ClassifierWebGL', {
	camera: null,
	renderer: null,
	vertexShaderText: null,
	fragmentShaderText: null,
	config: {
		shader: null,
		canvas: null,
		context: null,
		image: null
	},
	constructor: function (config) {
		this.initConfig(config);

		var shaders = this.loadShaders();

		shaders.bind(this).spread(function (vertexShaderText, fragmentShaderText) {
			this.vertexShaderText = vertexShaderText;
			this.fragmentShaderText = fragmentShaderText;

			var canvas = this.getCanvas();

			// TODO: get from image, adjust if they change
			var width = 1280;
			var height = 960;

			this.scene = new THREE.Scene();
			// TODO: I have absolutely no idea why these numbers work.
			this.camera = new THREE.OrthographicCamera(-640, 1920, 1440, -480, 0.1, 1000);
			this.scene.add(this.camera);
			// move camera to center of image
			this.camera.position.set(width / 2, height / 2, 1);
			window.c = this.camera;

			this.renderer = new THREE.WebGLRenderer({
				antialias: true,
				canvas: this.getCanvas().el.dom,
				context: this.getContext()
			});
			this.renderer.setViewport(0, 0, width, height);

			this.obj = this.createObj(width, height);
			// move image so that the bottom right corner is at the origin
			this.obj.position.set(width / 2, height / 2, 0);
			this.scene.add(this.obj);
			window.o = this.obj;

			this.animate();
		});
	},
	createObj: function (width, height) {
		var g = new THREE.PlaneGeometry(width, height);
		var testImage = new THREE.ImageUtils.loadTexture('resources/images/test_image_boat.png');
		testImage.magFilter = THREE.NearestFilter;
		var mat = this.mat = new THREE.ShaderMaterial({
			uniforms: {
				image: {type: 't', value: testImage},
				lut: {type: 't'}
			},
			vertexShader: this.vertexShaderText,
			fragmentShader: this.fragmentShaderText
		});

		return new THREE.Mesh(g, mat);
	},
	updateImage: function (data) {
		// TODO: unhack
		var texture = new THREE.DataTexture(data, 1280, 960, THREE.RGBAFormat, THREE.UnsignedByteType, THREE.Texture.DEFAULT_MAPPING, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter);
		texture.generateMipmaps = false;
		texture.needsUpdate = true;
		this.mat.uniforms.image.value = texture;
		this.mat.needsUpdate = true;

		this.render();
	},
	updateLut: function (data) {
		var width = Math.sqrt(data.length); // TODO: check valid
		var height = width;
		var texture = new THREE.DataTexture(new Uint8Array(data.buffer), width, height, THREE.LuminanceFormat, THREE.UnsignedByteType, THREE.Texture.DEFAULT_MAPPING, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter);
		texture.generateMipmaps = false;
		texture.needsUpdate = true;
		this.mat.uniforms.lut.value = texture;
		this.mat.needsUpdate = true;

		this.render();
	},
	render: function () {
		this.renderer.render(this.scene, this.camera);
	},
	animate: function () {
		this.render();

		requestAnimationFrame(function () {
			this.animate();
		}.bind(this));
	},
	loadShaders: function () {
		var basePath = Ext.Loader.getPath('NU') + '/shader';
		var shader = this.getShader();
		return Promise.all([
			this.loadShader(basePath + '/' + shader + 'Vertex.c'),
			this.loadShader(basePath + '/' + shader + 'Fragment.c')
		]);
	},
	loadShader: function (url) {
		return new Promise(function (resolve) {
			Ext.Ajax.request({
				url: url,
				success: function (response) {
					resolve(response.responseText);
				},
				scope: this
			});
		});
	}
});

