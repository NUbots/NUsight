Ext.define('NU.view.plot.Scatter3D', {
	extend: 'Ext.container.Container',
	alias: 'widget.scatter3d',
	autoEl: {
		tag: 'canvas',
		width: '400',
		height: '487',
		style: {
			cursor: 'crosshair',
			display: 'block',
			border: '2px solid #000',
			borderRadius: '2px',
			marginLeft: '3px'
		}
	},
	config: {
		width: 400,
		height: 487,
		mouseX: 0,
		mouseY: 0,
		down: false,
		pointData: null,
		scene: null,
		camera: null,
		renderer: null,
		scatterPlot: null,
		points: null,
		objects: [],
		texts: null,
		cameraAzimuth: 0,
		cameraElevation: Math.PI / 2,
		cameraDistance: 50 * 5
	},
	listeners: {
		resize: function (el, width, height) {
//			this.autoSize(width, height);
			this.getRenderer().setSize(width, height)
			var camera = this.getCamera();
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
		}
	},
	initComponent: function () {
		if (this.getPointData() === null) {
			this.setPointData([]);
		}
		if (this.getTexts() === null) {
			this.setTexts([]);
		}
		this.callParent(arguments);
	},
	updateCameraPosition: function (camera, distance, elevation, azimuth) {
		// lock view from (0, PI) exclusive to avoid flipping over the Z axis
		elevation = Math.max(0.1 * Math.PI / 180, Math.min(179.9 * Math.PI / 180, elevation));
		// calculate x,y,z from spherical coordinates
		camera.position.x = distance * Math.sin(Math.PI - elevation) * Math.cos(azimuth);
		camera.position.y = distance * Math.cos(Math.PI - elevation);
		camera.position.z = distance * Math.sin(Math.PI - elevation) * Math.sin(azimuth);
		this.setCameraAzimuth(azimuth);
		this.setCameraElevation(elevation);
		this.setCameraDistance(distance);
	},
	afterRender: function () {
		var renderer = new THREE.WebGLRenderer({
			antialias: true,
			canvas: this.getEl().dom
		});
		renderer.setClearColor(0xf0f0f0, 1.0);
		var camera = new THREE.PerspectiveCamera(
			45,
			this.getWidth() / this.getHeight(),
			0.001,
			10000
		);

		var scene = new THREE.Scene();
		scene.add(camera);
		var cameraDistance = this.getCameraDistance();
		this.updateCameraPosition(camera, cameraDistance, 19 * Math.PI / 32, 30 * Math.PI / 180);

		var scatterPlot = new THREE.Object3D();
		this.generateScene(scatterPlot);
		scene.add(scatterPlot);
		this.getEl().on({
			'mousedown': function (e) {
				this.setDown(true);
				this.setMouseX(e.getX());
				this.setMouseY(e.getY());
			},
			'mouseup': function () {
				this.setDown(false);
			},
			'mousemove': function (e) {
				if (this.getDown()) {
					var dx = e.getX() - this.getMouseX();
					var dy = e.getY() - this.getMouseY();
					var newCameraAzimuth = this.getCameraAzimuth() + dx * Math.PI / 180;
					var newCameraElevation = this.getCameraElevation() + dy * Math.PI / 180;
					this.setMouseX(e.getX());
					this.setMouseY(e.getY());
					this.updateCameraPosition(camera, this.getCameraDistance(), newCameraElevation, newCameraAzimuth);
				}
			},
			'mousewheel': function (event) {
				var newCameraDistance = this.getCameraDistance() - event.getWheelDelta() * 16;
				newCameraDistance = Math.max(0.01, newCameraDistance);
				this.updateCameraPosition(camera, newCameraDistance, this.getCameraElevation(), this.getCameraAzimuth());
			},
			'click': function (e) {
				if (e.ctrlKey && this.getPoints() != null) {
					// create a ray caster that takes the parameter of the origin position and direction vector
					var raycaster = new THREE.Raycaster(this.camera.position, function () {
							var vector = new THREE.Vector3(0, 0, -1);
							var point = vector.applyMatrix4(camera.matrixWorld);
							return point.sub(camera.position).normalize();
						}());
					// checks for intersection between all points
					var intersects = raycaster.intersectObjects(this.objects, true);
					// update the points using the closest intersection or reset to origin
				}
			},
			scope: this
		});

		function animate() {
			renderer.clear();
			camera.lookAt(scene.position);
			Ext.each(this.getTexts(), function (text) {
				text.lookAt(camera.position);
			}, this);
			renderer.render(scene, camera);
			requestAnimationFrame(animate.bind(this));
		}
		requestAnimationFrame(animate.bind(this));

		this.setScatterPlot(scatterPlot);
		this.setRenderer(renderer);
		this.setCamera(camera);
		this.setScene(scene);

		this.callParent(arguments);
	},
	generateTexture: function () {
		// draw a circle in the center of the canvas
		var size = 128;

		// create canvas
		var canvas = document.createElement('canvas');
		canvas.width = size;
		canvas.height = size;

		// get context
		var context = canvas.getContext('2d');

		// draw circle
		var centerX = size / 2;
		var centerY = size / 2;
		var radius = size / 2 - 1;

		//var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
		//        gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
		//        gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
		//        gradient.addColorStop( 0.4, 'rgba(0,0,64,1)' );
		//        gradient.addColorStop( 1, 'rgba(0,0,0,1)' );

		context.beginPath();
		context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
		//context.fillStyle = gradient;
		//context.fillRect( 0, 0, canvas.width, canvas.height );
		context.fillStyle = "rgba(255, 255, 255, 1)";
		context.fill();
		context.strokeStyle = "rgba(0, 0, 0, 1)";
		context.stroke();

		/*context.fillStyle = "rgba(255, 255, 255, 1)";
		context.fillRect(0, 0, size-1, size-1);
		context.strokeStyle = "rgba(0, 0, 0, 1)";
		context.strokeRect(0, 0, size-1, size-1);*/

		return canvas;
	},
	generateScene: function (scatterPlot) {
		var bounds = {
			'maxx': 50,
			'minx': -50,
			'maxy': 50,
			'miny': -50,
			'maxz': 50,
			'minz': -50
		};
		var maxRange = Math.max(Math.max(bounds.maxx - bounds.minx, bounds.maxy - bounds.miny), bounds.maxz - bounds.minz);

		function v(x, y, z) {
			return new THREE.Vector3(x, y, z);
		}

		var xAxisGeo = new THREE.Geometry();
		var yAxisGeo = new THREE.Geometry();
		var zAxisGeo = new THREE.Geometry();
		var midLinesGeo = new THREE.Geometry();
		var boundaryGeo = new THREE.Geometry();

		xAxisGeo.vertices.push(v(bounds.minx, 0, 0), v(bounds.maxx, 0, 0));
		yAxisGeo.vertices.push(v(0, bounds.miny, 0), v(0, bounds.maxy, 0));
		zAxisGeo.vertices.push(v(0, 0, bounds.minz), v(0, 0, bounds.maxz));
		midLinesGeo.vertices.push(

			v(bounds.minx, 0, bounds.maxz), v(bounds.maxx, 0, bounds.maxz),
			v(bounds.minx, 0, bounds.minz), v(bounds.maxx, 0, bounds.minz),
			v(bounds.minx, bounds.maxy, 0), v(bounds.maxx, bounds.maxy, 0),
			v(bounds.minx, bounds.miny, 0), v(bounds.maxx, bounds.miny, 0),

			v(0, bounds.miny, bounds.maxz), v(0, bounds.maxy, bounds.maxz),
			v(0, bounds.miny, bounds.minz), v(0, bounds.maxy, bounds.minz),
			v(bounds.maxx, bounds.miny, 0), v(bounds.maxx, bounds.maxy, 0),
			v(bounds.minx, bounds.miny, 0), v(bounds.minx, bounds.maxy, 0),

			v(bounds.minx, 0, bounds.minz), v(bounds.minx, 0, bounds.maxz),
			v(bounds.maxx, 0, bounds.minz), v(bounds.maxx, 0, bounds.maxz),
			v(0, bounds.maxy, bounds.minz), v(0, bounds.maxy, bounds.maxz),
			v(0, bounds.miny, bounds.minz), v(0, bounds.miny, bounds.maxz)
		);

		boundaryGeo.vertices.push(
			v(bounds.minx, bounds.maxy, bounds.minz), v(bounds.maxx, bounds.maxy, bounds.minz),
			v(bounds.minx, bounds.miny, bounds.minz), v(bounds.maxx, bounds.miny, bounds.minz),
			v(bounds.minx, bounds.maxy, bounds.maxz), v(bounds.maxx, bounds.maxy, bounds.maxz),
			v(bounds.minx, bounds.miny, bounds.maxz), v(bounds.maxx, bounds.miny, bounds.maxz),

			v(bounds.maxx, bounds.miny, bounds.minz), v(bounds.maxx, bounds.maxy, bounds.minz),
			v(bounds.minx, bounds.miny, bounds.minz), v(bounds.minx, bounds.maxy, bounds.minz),
			v(bounds.maxx, bounds.miny, bounds.maxz), v(bounds.maxx, bounds.maxy, bounds.maxz),
			v(bounds.minx, bounds.miny, bounds.maxz), v(bounds.minx, bounds.maxy, bounds.maxz),

			v(bounds.maxx, bounds.maxy, bounds.minz), v(bounds.maxx, bounds.maxy, bounds.maxz),
			v(bounds.maxx, bounds.miny, bounds.minz), v(bounds.maxx, bounds.miny, bounds.maxz),
			v(bounds.minx, bounds.maxy, bounds.minz), v(bounds.minx, bounds.maxy, bounds.maxz),
			v(bounds.minx, bounds.miny, bounds.minz), v(bounds.minx, bounds.miny, bounds.maxz)
		);

		var xAxisMat = new THREE.LineBasicMaterial({
			color: 0xeeeeee, //0xff0000,
			lineWidth: 1
		});
		var xAxis = new THREE.Line(xAxisGeo, xAxisMat);
		xAxis.type = THREE.Lines;
		scatterPlot.add(xAxis);

		var yAxisMat = new THREE.LineBasicMaterial({
			color: 0xeeeeee, //0x0000ff,
			lineWidth: 1
		});
		var yAxis = new THREE.Line(yAxisGeo, yAxisMat);
		yAxis.type = THREE.Lines;
		scatterPlot.add(yAxis);

		var zAxisMat = new THREE.LineBasicMaterial({
			color: 0xeeeeee, //0x00ff00,
			lineWidth: 1
		});
		var zAxis = new THREE.Line(zAxisGeo, zAxisMat);
		zAxis.type = THREE.Lines;
		scatterPlot.add(zAxis);

		var midLinesMat = new THREE.LineBasicMaterial({
			color: 0xdddddd,
			lineWidth: 1,
			transparent: true
		});
		var midLines = new THREE.Line(midLinesGeo, midLinesMat);
		midLines.type = THREE.Lines;
		scatterPlot.add(midLines);

		var boundaryMat = new THREE.LineBasicMaterial({
			color: 0x090909,
			lineWidth: 1,
			transparent: true
		});
		var boundary = new THREE.Line(boundaryGeo, boundaryMat);
		boundary.type = THREE.Lines;
		scatterPlot.add(boundary);
//		this.updatePlot();

		function createTextCanvas(text, color, font, size)
		{
			size = size || 24;
			var canvas = document.createElement('canvas');
			var ctx = canvas.getContext('2d');
			var fontStr = (size + 'px ') + (font || 'Arial');
			ctx.font = fontStr;
			var w = ctx.measureText(text).width;
			var h = Math.ceil(size);
			canvas.width = w;
			canvas.height = h;
			ctx.font = fontStr;
			ctx.fillStyle = color || 'black';
			ctx.fillText(text, 0, Math.ceil(size*0.8));
			return canvas;
		}

		function createText2D(text, color, font, size, segW, segH)
		{
			var canvas = createTextCanvas(text, color, font, size);
			var plane = new THREE.PlaneBufferGeometry(canvas.width, canvas.height, segW, segH);
			var tex = new THREE.Texture(canvas);
			tex.needsUpdate = true;
			var planeMat = new THREE.MeshBasicMaterial({
				map: tex, color: 0xffffff, transparent: true, side: THREE.DoubleSide
			});
			var mesh = new THREE.Mesh(plane, planeMat);
			mesh.scale.set(0.25, 0.25, 0.25);
			return mesh;
		}

		var fontSize = Math.max(Math.round(maxRange/4), 8);
		var fontOffset = Math.min(Math.round(fontSize/4), 8);

		var texts = this.getTexts();
		var titleX = createText2D("-Cr", new THREE.Color().setRGB(1, 0, 0), "", fontSize);
		titleX.position.x = bounds.minx - fontOffset;
		scatterPlot.add(titleX);
		texts.push(titleX);

		var titleX = createText2D('Cr', new THREE.Color().setRGB(1, 0, 0), "", fontSize);
		titleX.position.x = bounds.maxx + fontOffset;
		scatterPlot.add(titleX);
		texts.push(titleX);

		var titleY = createText2D('-Y', new THREE.Color().setRGB(1, 0, 0), "", fontSize);
		titleY.position.y = bounds.miny - fontOffset;
		scatterPlot.add(titleY);
		texts.push(titleY);

// (text, color, font, size, segW, segH)
		var titleY = createText2D('Y', new THREE.Color().setRGB(1, 0, 0), "", fontSize);
		titleY.position.y = bounds.maxy + fontOffset;
		scatterPlot.add(titleY);
		texts.push(titleY);

		var titleZ = createText2D('-Cb', new THREE.Color().setRGB(1, 0, 0), "", fontSize);
		titleZ.position.z = bounds.minz - fontOffset;
		scatterPlot.add(titleZ);
		texts.push(titleZ);

		var titleZ = createText2D('Cb', new THREE.Color().setRGB(1, 0, 0), "", fontSize);
		titleZ.position.z = bounds.maxz + fontOffset;
		scatterPlot.add(titleZ);
		texts.push(titleZ);

	},
	updatePlot: function () {
		var scatterPlot = this.getScatterPlot();
		var points = this.getPoints();
		scatterPlot.remove(points);

		var geometry = new THREE.Geometry();

		Ext.each(this.getPointData(), function (row) {
			var position = new THREE.Vector3(row[0], row[1], row[2]);
			//var radius = 0.4;
			geometry.vertices.push(position);
			geometry.colors.push(row[3]);
			//var sphere = new Sphere(radius, row[3]);
			//sphere.position = position;
			//this.objects.push(sphere);
		}, this);

		var texture = new THREE.Texture(this.generateTexture());
		texture.needsUpdate = true; // important
//		var texture = THREE.ImageUtils.loadTexture("resources/images/disc.png");

		var material = new THREE.PointCloudMaterial({
			size: 8,
//			sizeAttenuation: false,
			map: texture,
//			blending: THREE.AdditiveBlending, // required
//			depthTest: false, // required
//			depthWrite: false,
			transparent: true,
			opacity: 0.9,
			vertexColors: true // optional
		});

		var points = new THREE.PointCloud(geometry, material);
		points.sortParticles = true;
		scatterPlot.add(points);
		this.setPoints(points);
	}
});
