Ext.define('NU.controller.Vision', {
    extend: 'NU.controller.Display',
	alias: 'controller.Vision',
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
		layeredCanvas.add('image');
        layeredCanvas.add('classified_image_search');
        layeredCanvas.add('classified_image_refine');
        layeredCanvas.add('visual_horizon');
        layeredCanvas.add('horizon');
		layeredCanvas.add('goals', 'field_objects');
		layeredCanvas.add('balls', 'field_objects');
		this.setLayeredCanvas(layeredCanvas);

        //WebGL2D.enable(this.canvas.el.dom);
        //this.context = this.canvas.el.dom.getContext('webgl-2d');
//        this.setContext(this.getCanvas().el.dom.getContext('2d'));
        //this.context.translate(0.5, 0.5); // HACK: stops antialiasing on pixel width lines

		var view = this.getView();
        view.mon(NU.util.Network, 'image', this.onImage, this);
		view.mon(NU.util.Network, 'classified_image', this.onClassifiedImage, this);
		view.mon(NU.util.Network, 'vision_object', this.onVisionObjects, this);
    },
	onLayerSelect: function (obj, newValue, oldValue, e) {
		var layeredCanvas = this.getLayeredCanvas();
		layeredCanvas.hideAll();
		Ext.each(newValue, function (value) {
			switch (value) {
				case 'all':
					layeredCanvas.showAll();
					break;
				case 'raw':
					layeredCanvas.show('image');
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
    onImage: function (robotIP, image) {

        if (robotIP != this.robotIP || image === null) {
            return;
        }

		if (image.getCameraId() !== this.getCameraId()) {
			return;
		}

		var width = image.dimensions.x;
		var height = image.dimensions.y;
		this.autoSize(width, height);
		var Format = API.Image.Format;

		switch (image.format) {
			case Format.JPEG:
				// 1st implementation - potentially slower
				//	        this.drawImageURL(image);

				// 2nd implementation - potentially faster
				this.drawImageB64(image);
				break;
			case Format.YCbCr444:
				//this.drawImageYbCr444(image);
				this.drawImageBayer(image);
				break;
			default:
				throw 'Unsupported Format';
		}
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
	YCbCrtoRGB: function (ycbcr) {
		// from http://en.wikipedia.org/wiki/YCbCr#ITU-R_BT.601_conversion
		return [
			255 / 219 * (ycbcr[0] - 16) + 255 / 112 * 0.701 * (ycbcr[2] - 128),
			255 / 219 * (ycbcr[0] - 16) - 255 / 112 * 0.886 * 0.114 / 0.587 * (ycbcr[1] - 128) - 255 / 112 * 0.701 * 0.299 / 0.587 * (ycbcr[2] - 128),
			255 / 219 * (ycbcr[0] - 16) + 255 / 112 * 0.886 * (ycbcr[1] - 128)
		];
	},
	drawImageYbCr444: function (image) {
		var width = this.getWidth();
		var height = this.getHeight();
		var ctx = this.getContext('image');
		var imageData = ctx.createImageData(width, height);
		var data = new Uint8ClampedArray(image.data.toArrayBuffer());
		var bitsPerPixel = this.getBitsPerPixel();
		var bitsPerPixel2 = 3;
		var total = width * height * bitsPerPixel2;
		for (var i = 0; i < data.length / bitsPerPixel2; i++) {
			var offset = bitsPerPixel * i;
			var offset2 = bitsPerPixel2 * i;
			var rgb = this.YCbCrtoRGB([
				data[offset2 + 0],
				data[offset2 + 1],
				data[offset2 + 2],
			]);
			imageData.data[offset + 0] = rgb[0];
			imageData.data[offset + 1] = rgb[1];
			imageData.data[offset + 2] = rgb[2];
			imageData.data[offset + 3] = 255;
		}
		ctx.putImageData(imageData, 0, 0);
	},
	drawImageBayer: function (image) {
		var width = this.getWidth();
		var height = this.getHeight();
		var ctx = this.getContext('image');
		var imageData = ctx.createImageData(width, height);
		var data = new Uint8ClampedArray(image.data.toArrayBuffer());
		var bitsPerPixel = this.getBitsPerPixel();
		var bitsPerPixel2 = 3;
		var total = width * height * bitsPerPixel2;
		// BGGR
		function get(x, y) {
			if (x < 0 || x >= width || y < 0 || y >= height) {
				return null;
			}
			return data[y * width + x];
		}
		function getAvg() {
			var sum = 0;
			var count = 0;
			for (var i = 0; i < arguments.length; i++) {
				var coord = arguments[i];
				var color = get(coord[0], coord[1]);
				if (color !== null) {
					sum += color;
					count++;
				}
			}
			return sum / count;
		}
		// probably terrible, but conceptually makes sense
		var r, g, b;
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				if (y % 2 === 0) {
					// B G
					if (x % 2 === 0) {
						// B
						r = getAvg([x - 1, y - 1], [x + 1, y - 1], [x + 1, y + 1], [x - 1, y + 1]); // 4 surrounding
						g = getAvg([x, y - 1], [x + 1, y], [x, y + 1], [x - 1, y]); // 4 surrounding
						b = get(x, y); // self
					} else {
						// G
						r = getAvg([x, y - 1], [x, y + 1]); // 2 surrounding
						g = getAvg([x - 1, y - 1], [x + 1, y - 1], [x + 1, y + 1], [x - 1, y + 1], [x, y]); // 5 surrounding
						b = getAvg([x - 1, y], [x + 1, y]); // 2 surrounding
					}
				} else {
					// G R
					if (x % 2 === 0) {
						// G
						r = getAvg([x - 1, y], [x + 1, y]); // 2 surrounding
						g = getAvg([x - 1, y - 1], [x + 1, y - 1], [x + 1, y + 1], [x - 1, y + 1], [x, y]); // 5 surrounding
						b = getAvg([x, y - 1], [x, y + 1]); // 2 surrounding
					} else {
						// R
						r = get([x, y]); // self
						g = getAvg([x, y - 1], [x + 1, y], [x, y + 1], [x - 1, y]); // 4 surrounding
						b = getAvg([x - 1, y - 1], [x + 1, y - 1], [x + 1, y + 1], [x - 1, y + 1]); // 4 surrounding
					}
				}
				var offset = this.bitsPerPixel * (y * width + x);
				imageData.data[offset + 0] = r;
				imageData.data[offset + 1] = g;
				imageData.data[offset + 2] = b;
				imageData.data[offset + 3] = 255;
			}
		}
		ctx.putImageData(imageData, 0, 0);
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
    onClassifiedImage: function (robotIP, image) {

        if(robotIP != this.robotIP) {
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

        var segments = image.getSegment();

        for (var i = 0; i < segments.length; i++) {
            var segment = segments[i];
            var colour = this.segmentColourToRGB(segment.colour);

            if (segment.start.x === segment.end.x) {

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

            } else if (segment.start.y === segment.end.y) {

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
            else {
                console.log('unsupported diagonal classified image segment');
            }
        }

        this.getContext('classified_image_search').putImageData(searchData, 0, 0);
        this.getContext('classified_image_refine').putImageData(refinedData, 0, 0);
    },
    drawVisualHorizon: function(horizonPoints) {

        var context = this.getContext('visual_horizon');
        context.clearRect(0, 0, this.getWidth(), this.getHeight());
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
	onVisionObjects: function (robotIP, visionObjects) {

		if(robotIP !== this.robotIP) {
			return;
		}

		switch (visionObjects.getType()) {
			case 0: // Goal
				this.drawGoals(visionObjects.getGoal());
				break;
			case 1: // Ball
				this.drawBalls(visionObjects.getBall());
				break;
		}

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
