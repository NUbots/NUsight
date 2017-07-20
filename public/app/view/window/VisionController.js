Ext.define('NU.view.window.VisionController', {
    extend: 'NU.view.window.DisplayController',
	alias: 'controller.Vision',
	requires: [
		'NU.view.webgl.Vision',
		'NU.view.webgl.VisionDiff'
	],
	imageRenderer: null,
	imageDiffRenderer: null,
	localisationRenderer: null,
    config: {
		cameraId: null,
        displayImage: false,
        displayClassifiedImage: false,
        displayFieldObjects: false,
		layeredCanvas: null,
		width: 320,
		height: 240,
		bitsPerPixel: 4
    },
    onAfterRender: function () {
		var layeredCanvas = this.lookupReference('canvas').getController();
		this.setLayeredCanvas(layeredCanvas);

		var imageLayer = layeredCanvas.add('image', {
			webgl: true,
			webglAttributes: {
				antialias: false
			}
		});

		this.imageRenderer = Ext.create('NU.view.webgl.Vision', {
			shader: 'Vision',
			canvas: imageLayer.canvas,
			context: imageLayer.context,
			autoRender: false
		});

		var imageDiffLayer = layeredCanvas.add('image_diff', {
			webgl: true,
			webglAttributes: {
				antialias: false
			}
		});

		this.imageDiffRenderer = Ext.create('NU.view.webgl.VisionDiff', {
			shader: 'VisionDiff',
			canvas: imageDiffLayer.canvas,
			context: imageDiffLayer.context,
			autoRender: false
		});

		var localisationLayer = layeredCanvas.add('localisation', {
			webgl: true,
			webglAttributes: {
				antialias: false
			}
		});

		this.localisationRenderer = Ext.create('NU.view.webgl.Vision', {
			shader: 'VisionDiff',
			canvas: localisationLayer.canvas,
			context: localisationLayer.context,
			autoRender: false
		});

		layeredCanvas.add('classified_image_search');
		layeredCanvas.add('classified_image_refine');
		layeredCanvas.add('visual_horizon');
		layeredCanvas.add('horizon');
		layeredCanvas.add('goals', {group: 'field_objects'});
		layeredCanvas.add('balls', {group: 'field_objects'});
		layeredCanvas.add('lines');
		layeredCanvas.add('imageText');
		//hide image diff by default
		layeredCanvas.hide('image_diff');
		layeredCanvas.hide('localisation');

        //WebGL2D.enable(this.canvas.el.dom);
        //this.context = this.canvas.el.dom.getContext('webgl-2d');
//        this.setContext(this.getCanvas().el.dom.getContext('2d'));
        //this.context.translate(0.5, 0.5); // HACK: stops antialiasing on pixel width lines

		Promise.all([
			this.imageRenderer.onReady(),
			this.imageDiffRenderer.onReady(),
			this.localisationRenderer.onReady()
		]).then(function () {
			this.addEvents();
		}.bind(this));
    },

	addEvents: function () {
		this.mon(NU.Network, {
			'message.input.Image': this.onImage,
			'message.vision.ClassifiedImage': this.onClassifiedImage,
			'message.vision.NUsightBalls': this.onNUsightBalls,
			'message.vision.NUsightGoals': this.onNUsightGoals,
			'message.vision.NUsightObstacles': this.onNUsightObstacles,
			'message.vision.NUsightLines': this.onNUsightLines,
			'message.localisation.Field': this.renderLocalisation, //for localisation camera
			scope: this
		});

		//listen to an event when the localisation window is opened and has robots.
		Ext.on('localisationOpened', this.onLocalisationViewConnected, this);
	},
	onSelectRobot: function (robotId) {
		if(this.localisationRobots != null) {
			for (var i = 0; i < this.localisationRobots.length; i++) {
				if (this.localisationRobots[i].robotId == robotId) {
					this.localisationRenderer.camera = this.localisationRobots[i].darwinModels[0].object.camera.children[0];
					break;
				}
			}
		}
		this.setRobotId(robotId);
	},

	onLocalisationViewConnected: function(scene, robots) {
		this.localisationRobots = robots;
		for(var i = 0; i < robots.length; i++) {
			if(robots[i].robotId == this.getRobotId()) {
				if(robots[i].robotModels[0].camera == null) {
					return;
				}

				this.localisationRenderer.camera = robots[i].robotModels[0].camera.children[0];
				this.localisationRenderer.scene = scene;
				break;
			}
		}
		this.renderLocalisation();
	},

	renderLocalisation: function() {
		this.localisationRenderer.render();
	},

	onLayerSelect: function (obj, newValue, oldValue, e) {
		var layeredCanvas = this.getLayeredCanvas();
		layeredCanvas.hideAll();
		Ext.each(newValue, function (value) {
			switch (value) {
				case 'all_but_image_diff':
					layeredCanvas.showAll();
					layeredCanvas.hide('image_diff');
					break;
				case 'all':
					layeredCanvas.showAll();
					break;
				case 'raw':
					layeredCanvas.show('image');
                    layeredCanvas.show('imageText');
					break;
				case 'image_diff':
					layeredCanvas.show('image_diff');
					break;
				case 'classified_search':
					layeredCanvas.show('classified_image_search');
					break;
				case 'classified_refine':
					layeredCanvas.show('classified_image_refine');
					break;
				case 'visual_horizon':
					layeredCanvas.show('visual_horizon');
					break;
				case 'horizon':
					layeredCanvas.show('horizon');
					break;
				case 'objects':
					layeredCanvas.showGroup('field_objects');
					break;
				case 'lines':
					layeredCanvas.show('lines');
					break;
				case 'localisation':
					layeredCanvas.show('localisation');
					break;
			}
		}, this);
	},
	onSelectCamera: function (cameraId) {
		this.setCameraId(cameraId);
	},
	getContext: function (name) {
		return this.getLayeredCanvas().getContext(name);
	},
	autoSize: function (width, height) {
		if (width === this.getWidth() && height === this.getHeight()) {
			return; // didn't change
		}

		this.setWidth(width);
		this.setHeight(height);
		this.getLayeredCanvas().setCanvasSize(width, height);
	},
    onImage: function (robot, image) {

        if (robot.get('id') != this.getRobotId()) {
            return;
        }

		if (image.getCameraId() !== this.getCameraId()) {
			return;
		}

		var width = image.dimensions.x;
		var height = image.dimensions.y;
		this.autoSize(width, height);

        // Copied from NUbots:shared/utility/vision/fourcc.h
        var Format = {
            GREY: 0x59455247,
            Y12 : 0x20323159,
            Y16 : 0x20363159,
            GRBG: 0x47425247,
            RGGB: 0x42474752,
            GBRG: 0x47524247,
            BGGR: 0x52474742,
            GR12: 0x32315247,
            RG12: 0x32314752,
            GB12: 0x32314247,
            BG12: 0x32314742,
            GR16: 0x36315247,
            RG16: 0x36314752,
            GB16: 0x36314247,
            BG16: 0x36314742,
            Y411: 0x31313459,
            UYVY: 0x59565955,
            YUYV: 0x56595559,
            YM24: 0x34324d59,
            RGB3: 0x33424752,
            JPEG: 0x4745504a,
            UNKNOWN: 0,
        };

		switch (image.format) {
			case Format.JPEG:
				this.drawImageFormatName('JPEG');
				// 1st implementation - potentially slower
				//	        this.drawImageURL(image);

				// 2nd implementation - potentially faster
				this.drawImageB64(image);
				break;
			case Format.YUYV:
                this.drawImageFormatName('YUYV');
				this.drawImageYbCr422(image);
				//this.drawImageBayer(image);
				break;
			case Format.YM24:
                this.drawImageFormatName('YM24');
				this.drawImageYbCr444(image);
				//this.drawImageBayer(image);
				break;
			case Format.UYVY:
                this.drawImageFormatName('UYVY');
				this.drawImageY422(image);
				break;
			case Format.GRBG:
                this.drawImageFormatName('Bayer - GRBG');
				this.drawImageBayer(image);
				break;
            case Format.RGGB:
                this.drawImageFormatName('Bayer - RGGB');
                this.drawImageBayer(image);
                break;
            case Format.GBRG:
                this.drawImageFormatName('Bayer - GBRG');
                this.drawImageBayer(image);
                break;
            case Format.BGGR:
                this.drawImageFormatName('Bayer - BGGR');
                this.drawImageBayer(image);
                break;
            case Format.RGB3:
                this.drawImageFormatName('RGB3');
                this.drawImageRGB3(image);
            	break;
			default:
                console.log('Format: ', image.format);
				throw 'Unsupported Format';
		}
    },

	drawImageFormatName: function(name) {
        var imageContext = this.getContext('image');
		var height = imageContext.canvas.height;

    	var context = this.getContext('imageText');
        context.fillStyle = 'white';
        context.font = "20px Arial";
		context.fillText(name, 5, height - 5);
	},

    drawImageURL: function (image) {
        var blob = new Blob([image.data.toArrayBuffer()], {type: 'image/jpeg'});
        var url = URL.createObjectURL(blob);
        var imageObj = new Image();
        var ctx = this.getContext('image');
        imageObj.src = url;
        imageObj.onload = function () {
            ctx.drawImage(imageObj, 0, 0, image.dimensions.x, image.dimensions.y);
            URL.revokeObjectURL(url);
        };
    },
	drawImageY422: function(image) {
		var width = this.getWidth();
		var height = this.getHeight();
		var data = new Uint8Array(image.data.toArrayBuffer());
		var bytesPerPixel = 2;
		this.imageRenderer.resize(width, height);
		this.imageRenderer.updateTexture('rawImage', data, width * bytesPerPixel, height, THREE.LuminanceFormat);
		this.imageRenderer.updateUniform('imageFormat', image.format);
		this.imageRenderer.updateUniform('imageWidth', width);
		this.imageRenderer.updateUniform('imageHeight', height);
		this.imageRenderer.render();

		this.imageDiffRenderer.resize(width, height);
		this.imageDiffRenderer.updateTexture('rawImage', data, width * bytesPerPixel, height, THREE.LuminanceFormat);
        this.imageRenderer.updateUniform('imageFormat', image.format);
		this.imageDiffRenderer.updateUniform('imageWidth', width);
		this.imageDiffRenderer.updateUniform('imageHeight', height);
		this.imageDiffRenderer.render();
	},
	drawImageYbCr422: function (image) {
		var width = this.getWidth();
		var height = this.getHeight();
		var data = new Uint8Array(image.data.toArrayBuffer());
		var bytesPerPixel = 2;
		this.imageRenderer.resize(width, height);
		this.imageRenderer.updateTexture('rawImage', data, width * bytesPerPixel, height, THREE.LuminanceFormat);
		this.imageRenderer.updateUniform('imageFormat', image.format);
		this.imageRenderer.updateUniform('imageWidth', width);
		this.imageRenderer.updateUniform('imageHeight', height);
		this.imageRenderer.render();

		this.imageDiffRenderer.resize(width, height);
		this.imageDiffRenderer.updateTexture('rawImage', data, width * bytesPerPixel, height, THREE.LuminanceFormat);
		this.imageDiffRenderer.updateUniform('imageFormat', image.format);
		this.imageDiffRenderer.updateUniform('imageWidth', width);
		this.imageDiffRenderer.updateUniform('imageHeight', height);
		this.imageDiffRenderer.render();
	},
	drawImageYbCr444: function (image) {
		var width = this.getWidth();
		var height = this.getHeight();
		var data = new Uint8Array(image.data.toArrayBuffer());
		this.imageRenderer.updateRawImage(data, width, height, THREE.RGBFormat);
		this.imageRenderer.updateUniform('imageFormat', image.format);
		this.imageDiffRenderer.updateRawImage(data, width, height, THREE.RGBFormat);
		this.imageRenderer.updateUniform('imageFormat', image.format);
	},
	drawImageRGB3: function (image) {
		var width = this.getWidth();
		var height = this.getHeight();
		var data = new Uint8Array(image.data.toArrayBuffer());
		this.imageRenderer.updateRawImage(data, width, height, THREE.RGBFormat);
		this.imageRenderer.updateUniform('imageFormat', image.format);
		this.imageDiffRenderer.updateRawImage(data, width, height, THREE.RGBFormat);
		this.imageRenderer.updateUniform('imageFormat', image.format);
	},
    drawImageB64: function (image) {
//        var data = String.fromCharCode.apply(null, new Uint8ClampedArray(image.data.toArrayBuffer()));
        var uri = 'data:image/jpeg;base64,' + this.arrayBufferToBase64(image.data.toArrayBuffer());//btoa(data);
        var imageObj = new Image();
        var ctx = this.getContext('image');
        imageObj.src = uri;
        imageObj.onload = function () {
			// flip image vertically
//			ctx.save();
//			ctx.scale(-1, -1);
//			ctx.drawImage(imageObj, -image.dimensions.x, -image.dimensions.y, image.dimensions.x, image.dimensions.y);
			ctx.drawImage(imageObj, 0, 0, image.dimensions.x, image.dimensions.y);
//			ctx.restore();
        };
    },
    drawImageBayer: function(image) {
        var width = this.getWidth();
        var height = this.getHeight();
        var data = new Uint8Array(image.data.toArrayBuffer());
        this.imageRenderer.resize(width, height);
		this.imageRenderer.updateTexture('rawImage', data, width, height, THREE.LuminanceFormat);
		this.imageRenderer.updateUniform('imageFormat', image.format);
		this.imageRenderer.updateUniform('imageWidth', width);
		this.imageRenderer.updateUniform('imageHeight', height);
        this.imageRenderer.updateUniform('resolution', new THREE.Vector2(image.dimensions.x, image.dimensions.y));

		this.imageDiffRenderer.updateTexture('rawImage', data, width, height, THREE.LuminanceFormat);
		this.imageDiffRenderer.updateUniform('imageFormat', image.format);
		this.imageDiffRenderer.updateUniform('imageWidth', width);
		this.imageDiffRenderer.updateUniform('imageHeight', height);
		this.imageDiffRenderer.updateUniform('resolution', new THREE.Vector2(image.dimensions.x, image.dimensions.y));

        var Format = {
            GRBG: 0x47425247,
            RGGB: 0x42474752,
            GBRG: 0x47524247,
            BGGR: 0x52474742,
            GR12: 0x32315247,
            RG12: 0x32314752,
            GB12: 0x32314247,
            BG12: 0x32314742,
            GR16: 0x36315247,
            RG16: 0x36314752,
            GB16: 0x36314247,
            BG16: 0x36314742
        };

		if(image.format == Format.GRBG) {
            this.imageRenderer.updateUniform('firstRed', new THREE.Vector2(1, 0));
			this.imageDiffRenderer.updateUniform('firstRed', new THREE.Vector2(1, 0));
		}else if(image.format == Format.RGGB) {
            this.imageRenderer.updateUniform('firstRed', new THREE.Vector2(0, 0));
            this.imageDiffRenderer.updateUniform('firstRed', new THREE.Vector2(0, 0));
        }else if(image.format == Format.GBRG) {
            this.imageRenderer.updateUniform('firstRed', new THREE.Vector2(0 , 1));
            this.imageDiffRenderer.updateUniform('firstRed', new THREE.Vector2(0 , 1));
        }else if(image.format == Format.BGGR) {
            this.imageRenderer.updateUniform('firstRed', new THREE.Vector2(1, 1));
            this.imageDiffRenderer.updateUniform('firstRed', new THREE.Vector2(1, 1));
        } else {
            this.imageRenderer.updateUniform('firstRed', new THREE.Vector2(0, 0));
			this.imageDiffRenderer.updateUniform('firstRed', new THREE.Vector2(0, 0));
        }

		this.imageRenderer.render();
		this.imageDiffRenderer.render();
	},
	arrayBufferToBase64: function (buffer) {
		// from http://stackoverflow.com/a/9458996/868679
		var binary = '';
		var bytes = new Uint8Array(buffer);
		var len = bytes.byteLength;
		for (var i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return window.btoa(binary);
	},
    onClassifiedImage: function (robot, image) {

        if (robot.get('id') != this.getRobotId()) {
            return;
        }

		var width = image.dimensions.x;
		var height = image.dimensions.y;
		this.autoSize(width, height);

        this.drawClassifiedImage(image);
        this.drawVisualHorizon(image.getVisualHorizon());
        this.drawHorizon(image.getHorizon());

    },
    drawClassifiedImage: function(image) {

        var width = this.getWidth();
        var height = this.getHeight();

        var searchData = this.getContext('classified_image_search').createImageData(width, height);
        var refinedData = this.getContext('classified_image_refine').createImageData(width, height);
        var searchPixels = searchData.data;
        var refinedPixels = refinedData.data;
        var pixels;

        var segments = image.getVerticalSegments();

        for (var i = 0; i < segments.length; i++) {
            var segment = segments[i];
            var colour = this.segmentColourToRGB(segment.getSegmentClass());

            var x = segment.start.x;

            // vertical lines
            for (var y = segment.start.y; y <= segment.end.y; y++)
            {
                var subsample = (y - segment.start.y) % segment.subsample === 0 ? 1 : 0.7;

                // Pick which layer to draw to
                pixels = segment.subsample === 1 ? refinedPixels : searchPixels;

                pixels[4 * (width * y + x) + 0] = colour[0] * subsample;
                pixels[4 * (width * y + x) + 1] = colour[1] * subsample;
                pixels[4 * (width * y + x) + 2] = colour[2] * subsample;
                pixels[4 * (width * y + x) + 3] = colour[3];
            }
        }

        var segments = image.getHorizontalSegments();

        for (var i = 0; i < segments.length; i++) {
            var segment = segments[i];
            var colour = this.segmentColourToRGB(segment.getSegmentClass());

            var y = segment.start.y;

            // horizontal lines
            for (var x = segment.start.x; x <= segment.end.x; x++)
            {
                var subsample = (x - segment.start.x) % segment.subsample === 0 ? 1 : 0.7;

                // Pick which layer to draw to
                pixels = segment.subsample === 1 ? refinedPixels : searchPixels;

                pixels[4 * (width * y + x) + 0] = colour[0] * subsample;
                pixels[4 * (width * y + x) + 1] = colour[1] * subsample;
                pixels[4 * (width * y + x) + 2] = colour[2] * subsample;
                pixels[4 * (width * y + x) + 3] = colour[3];
            }
        }

        this.getContext('classified_image_search').putImageData(searchData, 0, 0);
        this.getContext('classified_image_refine').putImageData(refinedData, 0, 0);
    },
    drawVisualHorizon: function(horizonPoints) {

        var context = this.getContext('visual_horizon');
        context.clearRect(0, 0, this.getWidth(), this.getHeight());
        if(horizonPoints.length > 0) {
            context.beginPath();
            context.moveTo(horizonPoints[0].x, horizonPoints[0].y);

            for(var i = 1; i < horizonPoints.length; i++) {
                var point = horizonPoints[i];
                context.lineTo(point.x, point.y);
            }

            context.shadowColor = 'black';
            context.shadowBlur = 5;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;

            context.strokeStyle = "rgba(0, 255, 0, 1)";
            context.lineWidth = 2;

            context.stroke();
        }
    },
    drawHorizon: function(horizon) {

        var context = this.getContext('horizon');
        context.clearRect(0, 0, this.getWidth(), this.getHeight());

        var points = [];

        var x1 = horizon.distance / horizon.normal.x;
        var x2 = (horizon.distance - this.getHeight() * horizon.normal.y) / horizon.normal.x;
        var y1 = horizon.distance / horizon.normal.y;
        var y2 = (horizon.distance - this.getWidth() * horizon.normal.x) / horizon.normal.y;

        if (x1 > 0 && x1 < this.getWidth()) {
            points.push([x1, 0]);
        }
        if (x2 > 0 && x2 < this.getWidth()) {
            points.push([x2, this.getHeight()]);
        }
        if (y1 > 0 && y1 < this.getHeight()) {
            points.push([0, y1]);
        }
        if (y2 > 0 && y2 < this.getHeight()) {
            points.push([this.getWidth(), y2]);
        }

        if(points.length === 2) {
            context.beginPath();
            context.moveTo(points[0][0], points[0][1]);
            context.lineTo(points[1][0], points[1][1]);

            context.shadowColor = 'black';
            context.shadowBlur = 5;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 0;

            context.strokeStyle = "rgba(0, 0, 255, 1)";
            context.lineWidth = 2;
            context.stroke();
        }
    },
	onNUsightBalls: function(robot, balls) {
		if (robot.get('id') !== this.getRobotId()) {
			return;
		}

		this.drawBalls(balls.getBalls());
	},
	onNUsightGoals: function(robot, goals) {
		if (robot.get('id') !== this.getRobotId()) {
			return;
		}

		this.drawGoals(goals.getGoals());
	},
	//TODO: implement this
	onNUsightObstacles: function(robot, obstacles) {
		if (robot.get('id') !== this.getRobotId()) {
			return;
		}

		console.log("NUsightObstacles CURRENTLY NOT SUPPORTED");
	},
	onNUsightLines: function(robot, lines) {
		if (robot.get('id') !== this.getRobotId()) {
			return;
		}
		this.drawLines(lines.getLines());
	},
	drawGoals: function (goals) {

		var context = this.getContext('goals');
		context.clearRect(0, 0, this.getWidth(), this.getHeight());

		for (var i = 0; i < goals.length; i++) {
			var goal = goals[i];
			context.beginPath();

			var quad = goal.quad;
			context.moveTo(quad.tl.x, quad.tl.y);
			context.lineTo(quad.tr.x, quad.tr.y);
			context.lineTo(quad.br.x, quad.br.y);
			context.lineTo(quad.bl.x, quad.bl.y);
			context.lineTo(quad.tl.x, quad.tl.y);
			context.closePath();

			context.shadowColor = 'black';
			context.shadowBlur = 5;
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;

			context.fillStyle = "rgba(255, 242, 0, 0.2)";
			context.fill();

			context.strokeStyle = "rgba(255, 242, 0, 1)";
			context.lineWidth = 2;

			context.stroke();

			// var measurements = goal.getMeasurement();
            //
			// // Calculate our error!
			// context.fillStyle = "rgba(255, 255, 255, 1)";
			// var mX = (quad.tl.x + quad.tr.x + quad.br.x + quad.bl.x) / 4.0;
			// var mY = (quad.tl.y + quad.tr.y + quad.br.y + quad.bl.y) / 4.0;
            //
			// for(var j = 0; j < measurements.length; ++j) {
            //
			// 	var m = measurements[j];
            //
			// 	var d = Math.sqrt(m.position.x);
			// 	var dE = Math.sqrt(m.covariance.x.x);
            //
			// 	context.fillText("d " + d.toFixed(2) + "±" + dE.toFixed(2) + "\n", mX, mY+j*15);
			// }

		}
	},
	drawBalls: function (balls) {
		var context = this.getContext('balls');
		context.clearRect(0, 0, this.getWidth(), this.getHeight());

		for (var i = 0; i < balls.length; i++) {
			var ball = balls[i];
			context.beginPath();

			context.shadowColor = 'black';
			context.shadowBlur = 5;
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;

			context.arc(ball.circle.centre.x, ball.circle.centre.y, ball.circle.radius, 0, Math.PI * 2, true);
			context.closePath();

			context.strokeStyle = "rgba(255, 255, 255, 1)";
			context.lineWidth = 2;
			context.stroke();

			// var measurements = ball.getMeasurement();
            //
			// // Calculate our error!
			// context.fillStyle = "rgba(255, 255, 255, 1)";
            //
			// for(var j = 0; j < measurements.length; ++j) {
            //
			// 	var m = measurements[j];
            //
			// 	var d = Math.sqrt(m.position.x);
			// 	var dE = Math.sqrt(m.covariance.x.x);
            //
			// 	context.fillText("d " + d.toFixed(2) + "±" + dE.toFixed(2) + "\n", ball.circle.centre.x, ball.circle.centre.y+j*15);
			// }
		}
	},
	drawLines: function (lines) {

		var context = this.getContext('lines');
		context.clearRect(0, 0, this.getWidth(), this.getHeight());

		function colourToRGBA(colour) {
			return "rgba("
				+ Math.floor(colour.getX() * 255) + ", "
				+ Math.floor(colour.getY() * 255) + ", "
				+ Math.floor(colour.getZ() * 255) + ", "
				+ colour.getT() + ")";
		}

		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			context.beginPath();

			var start = line.getStart();
			context.moveTo(start.getX(), start.getY());
			context.strokeStyle = colourToRGBA(line.getColour());
			context.lineWidth = 1;
			var end = line.getEnd();
			context.lineTo(end.getX(), end.getY());
			context.stroke();
		}

	},
    segmentColourToRGB: function (colourType)
    {
        var colour;

        switch (colourType)
        {
            case 0: // Unknown/Unclassified
                colour = [30,30,30,255];
                break;
            case 1: // Field
                colour = [0,255,0,255];
                break;
            case 2: // Ball
                colour = [255,102,0,255];
                break;
            case 3: // Goals
                colour = [255,255,0,255];
                break;
            case 4: // Line
                colour = [255,255,255,255];
                break;
            case 5: // Cyan Team
                colour = [0,255,255,255];
                break;
            case 6: // Magenta Team
                colour = [255,0,255,255];
                break;
            default:
                colour = [0,0,0,255];
        }
        return colour;
    }
});
