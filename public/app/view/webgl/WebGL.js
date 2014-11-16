Ext.define('NU.view.webgl.WebGL', {
	scene: null,
	camera: null,
	renderer: null,
	plane: null,
	vertexShaderText: null,
	fragmentShaderText: null,
	config: {
		width: 320,
		height: 240,
		shader: null,
		uniforms: null,
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
			var width = this.getWidth();
			var height = this.getHeight();

			this.scene = new THREE.Scene();
			// TODO: I have absolutely no idea why these numbers work.
			this.camera = new THREE.OrthographicCamera(-640, 1920, 1440, -480, 0.1, 1000);
			this.scene.add(this.camera);
			// move camera to center of image
			this.camera.position.set(width / 2, height / 2, 1);

			this.renderer = new THREE.WebGLRenderer({
				antialias: true,
				canvas: canvas.el.dom,
				context: this.getContext()
			});
			this.renderer.setViewport(0, 0, width, height);

			this.plane = this.createPlane(width, height);
			// move image so that the bottom right corner is at the origin
			this.plane.position.set(width / 2, height / 2, 0);
			this.scene.add(this.plane);
		});
	},
	createPlane: function (width, height) {
		var geometry = new THREE.PlaneGeometry(width, height);
		var material = new THREE.ShaderMaterial({
			uniforms: this.getUniforms(),
			vertexShader: this.vertexShaderText,
			fragmentShader: this.fragmentShaderText
		});
		return new THREE.Mesh(geometry, material);
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
