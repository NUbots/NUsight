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
    onClassifiedImage: function (robotIP, classifiedImage) {

        if(robotIP != this.robotIP || !this.displayClassifiedImage) {
            return;
        }

        var height = 320;
        var width = 240;

        var segments = classifiedImage.segment;
        var visualHorizon = classifiedImage.visualHorizon;
        var imageData = this.context.createImageData(height, width);
        var pixels = imageData.data;

        for (var i = 0; i < height * width; i++)
        {
            pixels[4 * i + 0] = 0;
            pixels[4 * i + 1] = 0;
            pixels[4 * i + 2] = 0;
            pixels[4 * i + 3] = 255;
        }

        for (var i = 0; i < api_segments.length; i++) {
            var segment = api_segments[i];
            var colour = this.segmentColourToRGB2(segment.colour);

            if (segment.start_x == segment.end_x) {

                // vertical lines
                for (var y = segment.start_y; y <= segment.end_y; y++)
                {
                    pixels[(4 * height * y) + (4 * segment.start_x + 0)] = colour[0];
                    pixels[(4 * height * y) + (4 * segment.start_x + 1)] = colour[1];
                    pixels[(4 * height * y) + (4 * segment.start_x + 2)] = colour[2];
                    pixels[(4 * height * y) + (4 * segment.start_x + 3)] = colour[3];
                }

            } else if (segment.start_y == segment.end_y) {

                // horizontal lines
                for (var x = segment.start_x; x <= segment.end_x; x++)
                {
                    pixels[(4 * height * segment.start_y) + (4 * x + 0)] = colour[0];
                    pixels[(4 * height * segment.start_y) + (4 * x + 1)] = colour[1];
                    pixels[(4 * height * segment.start_y) + (4 * x + 2)] = colour[2];
                    pixels[(4 * height * segment.start_y) + (4 * x + 3)] = colour[3];
                }
            }
            else {
                console.log('unsupported diagonal classified image segment');
            }
            //segment.start_x, segment.start_y
            //segment.end_x, segment.end_y
        }
        //Draw circles for green horizon points
        var api_green_horizon_points = api_classified_image.green_horizon_point;
        for (var i = 0; i < api_green_horizon_points.length; i++){
            pixels[(4 * height * api_green_horizon_points[i].y) + (4 * api_green_horizon_points[i].x + 0)] = 0;
            pixels[(4 * height * api_green_horizon_points[i].y) + (4 * api_green_horizon_points[i].x + 1)] = 255; //Green
            pixels[(4 * height * api_green_horizon_points[i].y) + (4 * api_green_horizon_points[i].x + 2)] = 0;
            pixels[(4 * height * api_green_horizon_points[i].y) + (4 * api_green_horizon_points[i].x + 3)] = 255;
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
            case 0:
                colour = "rgba(0,0,0,1)";
                break;
            case 1:
                colour = "rgba(255,255,255,1)";
                break;
            case 2:
                colour = "rgba(0,255,0,1)";
                break;
            case 3:
                colour = "rgba(168,168,168,1)";
                break;
            case 4:
                colour = "rgba(255,20,127,1)";
                break;
            case 5:
                colour = "rgba(255,128,128,1)";
                break;
            case 6:
                colour = "rgba(255,165,0,1)";
                break;
            case 7:
                colour = "rgba(238,219,83,1)";
                break;
            case 8:
                colour = "rgba(255,255,0,1)";
                break;
            case 9:
                colour = "rgba(0,0,255,1)";
                break;
            case 10:
                colour = "rgba(25,25,112,1)";
                break;
            default:
                colour = "rgba(0,0,0,1)";
        }
        return colour;
    },
    segmentColourToRGB2: function (colourType)
    {
        var colour;

        switch (colourType)
        {
            case 0:
                colour = [0,0,0,255];
                break;
            case 1:
                colour = [255,255,255,255];
                break;
            case 2:
                colour = [0,255,0,255];
                break;
            case 3:
                colour = [168,168,168,255];
                break;
            case 4:
                colour = [255,20,127,255];
                break;
            case 5:
                colour = [255,128,128,255];
                break;
            case 6:
                colour = [255,165,0,255];
                break;
            case 7:
                colour = [238,219,83,255];
                break;
            case 8:
                colour = [255,255,0,255];
                break;
            case 9:
                colour = [0,0,255,255];
                break;
            case 10:
                colour = [25,25,112,255];
                break;
            default:
                colour = [0,0,0,255];
        }
        return colour;
    },
    code: function () {
        this.context.fillStyle="black";
        this.context.fillRect(0, 0, 320, 240);

        var api_classified_image = api_message.vision.classified_image;
        var api_segments  = api_classified_image.segment;
        for (var i = 0; i < api_segments.length; i++) {
            var segment = api_segments[i];
            var colour;

            // TODO: make this less horrific
            switch (segment.colour)
            {
                case 0:
                    colour = "rgba(0,0,0,1)";
                    break;
                case 1:
                    colour = "rgba(255,255,255,1)";
                    break;
                case 2:
                    colour = "rgba(0,255,0,1)";
                    break;
                case 3:
                    colour = "rgba(168,168,168,1)";
                    break;
                case 4:
                    colour = "rgba(255,20,127,1)";
                    break;
                case 5:
                    colour = "rgba(255,128,128,1)";
                    break;
                case 6:
                    colour = "rgba(255,165,0,1)";
                    break;
                case 7:
                    colour = "rgba(238,219,83,1)";
                    break;
                case 8:
                    colour = "rgba(255,255,0,1)";
                    break;
                case 9:
                    colour = "rgba(0,0,255,1)";
                    break;
                case 10:
                    colour = "rgba(25,25,112,1)";
                    break;
                default:
                    colour = "rgba(0,0,0,1)";
            }

            //this.context.strokeStyle = "rgba(" + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ", 0.5)";

            this.context.beginPath();
            this.context.moveTo(segment.start_x, segment.start_y);
            this.context.lineTo(segment.end_x, segment.end_y);
            this.context.lineWidth = 1;
            this.context.strokeStyle = colour;
            this.context.stroke();
        }

        var api_ball = api_message.vision.field_object[0];
        var api_goals = [];
        var api_obstacles = [];

        var field_objects = api_message.vision.field_object;
        for (var i = 0; i < field_objects.length; i++) {
            var obj = field_objects[i];
            if (obj.visible) {
                //console.log(obj.name);
                if (obj.name == "Unknown Yellow Post"
                    ||
                    obj.name == "Left Yellow Post"
                    ||
                    obj.name == "Right Yellow Post"
                    ) {
                    api_goals.push(obj); // TODO: mark type
                } else if (obj.name == "Unknown Obstacle") {
                    api_obstacles.push(obj);
                }
            }
        }

        if (api_ball.visible) {
            this.context.beginPath();

            this.context.shadowColor = 'black';
            this.context.shadowBlur = 5;
            this.context.shadowOffsetX = 0;
            this.context.shadowOffsetY = 0;

            this.context.arc(api_ball.screen_x, api_ball.screen_y, api_ball.radius, 0, Math.PI*2, true);
            this.context.closePath();
            //this.context.fillStyle = "rgba(255, 0, 0, 1)";//"rgba(255, 85, 0, 0.5)";
            //this.context.fill();
            this.context.strokeStyle = "rgba(255, 255, 255, 1)";
            this.context.lineWidth = 2;
            this.context.lineWidth = 2;
            this.context.stroke();
        };

        Ext.each(api_goals, function (goal) {

            var topLeftX = goal.screen_x - (goal.width / 2);
            var topLeftY = goal.screen_y - goal.height;

            this.context.beginPath();

            this.context.moveTo(topLeftX, topLeftY);
            this.context.lineTo(topLeftX + goal.width, topLeftY);
            this.context.lineTo(topLeftX + goal.width, topLeftY + goal.height);
            this.context.lineTo(topLeftX, topLeftY + goal.height);
            this.context.closePath();

            this.context.shadowColor = 'black';
            this.context.shadowBlur = 5;
            this.context.shadowOffsetX = 0;
            this.context.shadowOffsetY = 0;

            this.context.fillStyle = "rgba(255, 242, 0, 0.2)";
            this.context.fill();

            this.context.strokeStyle = "rgba(255, 242, 0, 1)";
            this.context.lineWidth = 2;
            this.context.lineWidth = 2;

            this.context.stroke();

        }, this);

        Ext.each(api_obstacles, function (obstacle) {

            var topLeftX = obstacle.screen_x - (obstacle.width / 2);
            var topLeftY = 0;//obstacle.screen_y - obstacle.height; // TODO: waiting for shannon to fix height on obstacles

            this.context.beginPath();

            this.context.moveTo(topLeftX, topLeftY);
            this.context.lineTo(topLeftX + obstacle.width, topLeftY);
            this.context.lineTo(topLeftX + obstacle.width, obstacle.screen_y);
            this.context.lineTo(topLeftX, obstacle.screen_y);
            this.context.closePath();

            this.context.shadowColor = 'black';
            this.context.shadowBlur = 5;
            this.context.shadowOffsetX = 0;
            this.context.shadowOffsetY = 0;

            this.context.fillStyle = "rgba(255, 255, 255, 0.2)";
            this.context.fill();

            this.context.strokeStyle = "rgba(255, 255, 255, 0.5)";
            this.context.lineWidth = 2;
            this.context.lineWidth = 2;

            this.context.stroke();

        }, this);

    }
});
