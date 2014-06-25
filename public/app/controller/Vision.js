Ext.define('NU.controller.Vision', {
    extend: 'NU.controller.Display',
    config: {
        context: null,
        displayImage: false,
        displayClassifiedImage: false,
        displayFieldObjects: false
    },
    control: {
        'displaypicker': {
            change: function (obj, newValue, oldValue, e) {
                this.displayImage = false;
                this.displayClassifiedImage = false;
                this.displayFieldObjects = false;
                Ext.each(newValue, function (value) {
                    switch (value) {
                        case 'raw':
                            this.displayImage = true;
                            break;
                        case 'classified':
                            this.displayClassifiedImage = true;
                            break;
                        case 'objects':
                            this.displayFieldObjects = true;
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

        //WebGL2D.enable(this.canvas.el.dom);
        //this.context = this.canvas.el.dom.getContext('webgl-2d');
        this.setContext(this.getCanvas().el.dom.getContext('2d'));
        //this.context.translate(0.5, 0.5); // HACK: stops antialiasing on pixel width lines

        NU.util.Network.on('image', Ext.bind(this.onImage, this));
        NU.util.Network.on('classified_image', Ext.bind(this.onClassifiedImage, this));
        NU.util.Network.on('vision_objects', Ext.bind(this.onVisionObjects, this));

        this.callParent(arguments);

    },
    onImage: function (robotIP, image) {

        if (robotIP != this.robotIP || !this.displayImage) {
            return;
        }

        // 1st implementation - potentially slower
        // this.drawImageURL(image);

        // 2nd implementation - potentially faster
        this.drawImageB64(image);
    },
    drawImageURL: function (image) {
        var blob = new Blob([image.data.toArrayBuffer()], {type: 'image/jpeg'});
        var url = URL.createObjectURL(blob);
        var imageObj = new Image();
        var ctx = this.context;
        imageObj.src = url;
        imageObj.onload = function () {
            ctx.drawImage(imageObj, 0, 0, image.width, image.height);
            URL.revokeObjectURL(url);
        };
    },
    drawImageB64: function (image) {
        var data = String.fromCharCode.apply(null, new Uint8ClampedArray(image.data.toArrayBuffer()));
        var uri = 'data:image/jpeg;base64,' + btoa(data);
        var imageObj = new Image();
        var ctx = this.context;
        imageObj.src = uri;
        imageObj.onload = function () {
			// flip image vertically
			ctx.save();
			ctx.scale(-1, -1);
			ctx.drawImage(imageObj, -image.width, -image.height, image.width, image.height);
			ctx.restore();
        };
    },
    onClassifiedImage: function (robotIP, image) {

        if(robotIP != this.robotIP || !this.displayClassifiedImage) {
            return;
        }

        //var width = 320;
        //var height = 240;

        var width = 640;
        var height = 480;

        var segments = image.getSegment();
        var visualHorizon = image.getVisualHorizon();
        var horizon = image.getHorizon();
        var imageData = this.context.createImageData(width, height);
        var pixels = imageData.data;

        for (var i = 0; i < height * width; i++)
        {
            pixels[4 * i + 0] = 0;
            pixels[4 * i + 1] = 0;
            pixels[4 * i + 2] = 0;
            pixels[4 * i + 3] = 255;
        }

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
        for (var i = 0; i < visualHorizon.length; i++) {

            var start = visualHorizon[i].x;
            var end = visualHorizon[i + 1] === undefined ? width : visualHorizon[i + 1].x;

            for(var x = start; x < end; x++) {

                var y = Math.round(visualHorizon[i].y * x + visualHorizon[i].z);

                pixels[4 * (width * y + x) + 0] = 0;
                pixels[4 * (width * y + x) + 1] = 255;
                pixels[4 * (width * y + x) + 2] = 0;
                pixels[4 * (width * y + x) + 3] = 255;
            }
        }

        // Draw the actual horizon
        for (var x = 0; x < width; x++) {

            var y = Math.round(horizon.x * x + horizon.y);

            pixels[4 * (width * y + x) + 0] = 0;
            pixels[4 * (width * y + x) + 1] = 0;
            pixels[4 * (width * y + x) + 2] = 255;
            pixels[4 * (width * y + x) + 3] = 255;
        }

        imageData.data = pixels;
        this.context.putImageData(imageData, 0, 0);

    },
    onVisionObjects: function (robotIP, vision_objects) {

        if(robotIP != this.robotIP || !this.displayFieldObjects) {
            return;
        }

        // var api_ball = vision_objects[0];
        // var api_goals = [];
        // var api_obstacles = [];
        var context = this.getContext();

        for (var i = 0; i < vision_objects.length; i++) {
            var obj = vision_objects[i];    
            switch (obj.shape_type){
                case 1://VisionFieldObject.ShapeType.CIRCLE):
                    context.beginPath();

                    context.shadowColor = 'black';
                    context.shadowBlur = 5;
                    context.shadowOffsetX = 0;
                    context.shadowOffsetY = 0;

                    context.arc(obj.screen_x, obj.screen_y, obj.radius, 0, Math.PI*2, true);
                    context.closePath();
                    //context.fillStyle = "rgba(255, 0, 0, 1)";//"rgba(255, 85, 0, 0.5)";
                    //context.fill();
                    context.strokeStyle = "rgba(255, 255, 255, 1)";
                    context.lineWidth = 2;
                    context.lineWidth = 2;
                    context.stroke();

                    var position = obj.measured_relative_position;
                    break;

                case 2://VisionFieldObject.ShapeType.QUAD):

                    context.beginPath();

					var points = obj.points;
                    context.moveTo(points[0], points[1]);
                    for (var i = 2; i < points.length; i += 2) {
						var x = points[i];
						var y = points[i + 1];
                        context.lineTo(x, y);
                    }
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
                    break;

                case 4://VisionFieldObject.ShapeType.UNKNOWN):

                    var topLeftX = obj.screen_x - (obj.width / 2);
                    var topLeftY = obj.screen_y - obj.height; // TODO: waiting for shannon to fix height on obstacles

                    context.beginPath();

                    context.moveTo(topLeftX, topLeftY);
                    context.lineTo(topLeftX + obj.width, topLeftY);
                    context.lineTo(topLeftX + obj.width, topLeftY + obj.height);
                    context.lineTo(topLeftX, topLeftY + obj.height);
                    context.closePath();

                    context.shadowColor = 'black';
                    context.shadowBlur = 5;
                    context.shadowOffsetX = 0;
                    context.shadowOffsetY = 0;

                    context.fillStyle = "rgba(255, 255, 255, 0.2)";
                    context.fill();

                    context.strokeStyle = "rgba(255, 255, 255, 0.5)";
                    context.lineWidth = 2;
                    context.lineWidth = 2;

                    context.stroke();
                    break;
                
            }

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
