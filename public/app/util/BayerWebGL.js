Ext.define('NU.util.BayerWebGL', {
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
				sourceSize: {type: '4f', value: [1280, 960, 1/1280, 1/960]},
				firstRed: {type: '2f', value: [0, 0]},
				image: {type: 't', value: testImage}
			},
			vertexShader: this.vertexShaderText,
			fragmentShader: this.fragmentShaderText
		});

		return new THREE.Mesh(g, mat);
	},
	updateImage: function (image) {
		var width = image.dimensions.x;
		var height = image.dimensions.y;
		var data = new Uint8Array(image.data.toArrayBuffer(), 0, width * height);
		var texture = new THREE.DataTexture(data, width, height, THREE.LuminanceFormat, THREE.UnsignedByteType, THREE.Texture.DEFAULT_MAPPING, THREE.ClampToEdgeWrapping, THREE.ClampToEdgeWrapping, THREE.LinearFilter, THREE.LinearFilter);
		texture.generateMipmaps = false;
		texture.needsUpdate = true;
		this.mat.uniforms.image.value = texture;
		this.mat.uniforms.sourceSize.value = [width, height, 1 / width, 1 / height];
		this.mat.needsUpdate = true;
	},
	animate: function () {
		var me = this;
		this.renderer.render(this.scene, this.camera);

		requestAnimationFrame(function () {
			me.animate();
		});
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
