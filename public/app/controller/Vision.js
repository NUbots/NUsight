Ext.define('NU.controller.Vision', {
    extend: 'NU.controller.Display',
    config: {
        displayImage: false,
        displayClassifiedImage: false,
        displayFieldObjects: false,
		layeredCanvas: null
    },
    control: {
        'displaypicker': {
            change: function (obj, newValue, oldValue, e) {
                this.displayImage = false;
                this.displayClassifiedImage = false;
                this.displayFieldObjects = false;
				var layeredCanvas = this.getLayeredCanvas();
				layeredCanvas.hideAll();
                Ext.each(newValue, function (value) {
                    switch (value) {
                        case 'raw':
                            this.displayImage = true;
							layeredCanvas.show('image');
                            break;
                        case 'classified':
                            this.displayClassifiedImage = true;
							layeredCanvas.show('classified_image');
                            break;
                        case 'objects':
                            this.displayFieldObjects = true;
							layeredCanvas.showGroup('field_objects');
                            break;
                    }
                }, this);
            }
        },
        'view': {
            resize: function () {
//                var canvas = this.getCanvas();
//                canvas.setWidth(obj.body.getWidth());
//                this.getCa.setHeight(obj.body.getHeight());
            }
        },
        'canvas': true
    },
    init: function () {
		var layeredCanvas = this.getCanvas().getController();
		layeredCanvas.add('image');
		layeredCanvas.add('classified_image');
		layeredCanvas.add('goals', 'field_objects');
		layeredCanvas.add('balls', 'field_objects');
		this.setLayeredCanvas(layeredCanvas);

        //WebGL2D.enable(this.canvas.el.dom);
        //this.context = this.canvas.el.dom.getContext('webgl-2d');
//        this.setContext(this.getCanvas().el.dom.getContext('2d'));
        //this.context.translate(0.5, 0.5); // HACK: stops antialiasing on pixel width lines

        NU.util.Network.on('image', Ext.bind(this.onImage, this));
        NU.util.Network.on('classified_image', Ext.bind(this.onClassifiedImage, this));
        NU.util.Network.on('vision_object', Ext.bind(this.onVisionObjects, this));

        this.callParent(arguments);

    },
	getContext: function (name) {
		return this.getLayeredCanvas().getContext(name);
	},
    onImage: function (robotIP, image) {

        if (robotIP != this.robotIP || !this.displayImage) {
            return;
        }

        // 1st implementation - potentially slower
//        this.drawImageURL(image);

        // 2nd implementation - potentially faster
        this.drawImageB64(image);
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
    drawImageB64: function (image) {
//        var data = String.fromCharCode.apply(null, new Uint8ClampedArray(image.data.toArrayBuffer()));
        var uri = 'data:image/jpeg;base64,' + this.arrayBufferToBase64(image.data.toArrayBuffer());//btoa(data);
        var imageObj = new Image();
        var ctx = this.getContext("image");
        imageObj.src = uri;
        imageObj.onload = function () {
			// flip image vertically
			ctx.save();
			ctx.scale(-1, -1);
			ctx.drawImage(imageObj, -image.dimensions.x, -image.dimensions.y, image.dimensions.x, image.dimensions.y);
			ctx.restore();
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

        if(robotIP != this.robotIP || !this.displayClassifiedImage) {
            return;
        }

        var width = 320;
        var height = 240;
        //var width = 640;
        //var height = 480;

        var segments = image.getSegment();
        var visualHorizon = image.getVisualHorizon();
        var horizon = image.getHorizon();
        var imageData = this.getContext('classified_image').createImageData(width, height);
        var pixels = imageData.data;

        /*for (var i = 0; i < height * width; i++)
        {
            pixels[4 * i + 0] = 0;
            pixels[4 * i + 1] = 0;
            pixels[4 * i + 2] = 0;
            pixels[4 * i + 3] = 0;
        }*/

        for (var i = 0; i < segments.length; i++) {
            var segment = segments[i];
            var colour = this.segmentColourToRGB(segment.colour);

            if (segment.start.x == segment.end.x) {

                var x = segment.start.x;

                // vertical lines
                for (var y = segment.start.y; y <= segment.end.y; y++)
                {
                    var subsample = (y - segment.start.y) % segment.subsample === 0 ? 1 : 0.7;

                    pixels[4 * (width * y + x) + 0] = colour[0] * subsample;
                    pixels[4 * (width * y + x) + 1] = colour[1] * subsample;
                    pixels[4 * (width * y + x) + 2] = colour[2] * subsample;
                    pixels[4 * (width * y + x) + 3] = colour[3];
                }

            } else if (segment.start.y == segment.end.y) {

                var y = segment.start.y;

                // horizontal lines
                for (var x = segment.start.x; x <= segment.end.x; x++)
                {
                    var subsample = (x - segment.start.x) % segment.subsample === 0 ? 1 : 0.7;

                    pixels[4 * (width * y + x) + 0] = colour[0] * subsample;
                    pixels[4 * (width * y + x) + 1] = colour[1] * subsample;
                    pixels[4 * (width * y + x) + 2] = colour[2] * subsample;
                    pixels[4 * (width * y + x) + 3] = colour[3];
                }
            }
            else {
                console.log('unsupported diagonal classified image segment');
            }
            //segment.start_x, segment.start_y
            //segment.end_x, segment.end_y
        }

        // Draw the visual horizon
        for (var i = 0; i < visualHorizon.length - 1; i++) {

            var p1 = visualHorizon[i];
            var p2 = visualHorizon[i + 1];

            for(var x = p1.x; x <= p2.x; x++) {

                var y = Math.round(((p2.y - p1.y)/(p2.x - p1.x)) * (x - p1.x) + p1.y);

                pixels[4 * (width * y + x) + 0] = 0;
                pixels[4 * (width * y + x) + 1] = 255;
                pixels[4 * (width * y + x) + 2] = 0;
                pixels[4 * (width * y + x) + 3] = 255;
            }
        }

        // Draw the actual horizon
        for (var x = 0; x < width; x++) {

            var y = Math.round(x * horizon.gradient + horizon.intercept);

            pixels[4 * (width * y + x) + 0] = 0;
            pixels[4 * (width * y + x) + 1] = 0;
            pixels[4 * (width * y + x) + 2] = 255;
            pixels[4 * (width * y + x) + 3] = 255;
        }

        imageData.data = pixels;
        this.getContext('classified_image').putImageData(imageData, 0, 0);

    },
	onVisionObjects: function (robotIP, vision_objects) {

		if(robotIP !== this.robotIP || !this.displayFieldObjects) {
			return;
		}

		switch (vision_objects.getType()) {
			case 0: // Goae
				this.drawGoals(vision_objects.getGoal());
				break;
			case 1: // Ball
				this.drawBalls(vision_objects.getBall());
				break;
		}

	},
	drawGoals: function (goals) {

		var context = this.getContext('goals');
		context.clearRect(0, 0, 320, 240); // TODO

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
			context.lineWidth = 2;

			context.stroke();
		}
	},
	drawBalls: function (balls) {

		var context = this.getContext('balls');
		context.clearRect(0, 0, 320, 240); // TODO

		for (var i = 0; i < balls.length; i++) {
			var ball = balls[i];
			context.beginPath();

			context.shadowColor = 'black';
			context.shadowBlur = 5;
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 0;

			context.arc(ball.circle.centre.x, ball.circle.centre.y, ball.circle.radius, 0, Math.PI * 2, true);
			context.closePath();
			//context.fillStyle = "rgba(255, 0, 0, 1)";//"rgba(255, 85, 0, 0.5)";
			//context.fill();
			context.strokeStyle = "rgba(255, 255, 255, 1)";
			context.lineWidth = 2;
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
