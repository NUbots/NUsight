Ext.define('NU.view.window.VisionTrainerController', {
    extend: 'NU.view.window.DisplayController',
    alias: 'controller.VisionTrainer',
    requires: [
        'NU.util.TypeMap'
    ],
    config: {
        screenshotX: 0,
        screenshotY: 0,
        screenshotWidth: 100,
        screenshotHeight: 100,
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
                preserveDrawingBuffer: true,
                antialias: false,
            }
        });

        this.imageRenderer = Ext.create('NU.view.webgl.Vision', {
            shader: 'Vision',
            canvas: imageLayer.canvas,
            context: imageLayer.context,
            autoRender: false
        });

        Promise.all([
            this.imageRenderer.onReady(),
        ]).then(function () {
            this.addEvents();
        }.bind(this));

        this.addEvents();
    },

    addEvents: function () {
        this.mon(NU.Network, {
            'message.input.proto.Image': this.onImage,
            scope: this
        });
    },

    onImage: function(robot, image) {
        if (robot.get('id') != this.getRobotId() || image.getCameraId() !== this.getCameraId()) {
            return;
        }
        var Format = API.message.input.proto.Image.Format;

        switch (image.format) {
            case Format.JPEG:
                this.drawImageB64(image);
                break;
            case Format.YCbCr422:
                this.drawImageYbCr422(image);
                break;
            case Format.YCbCr444:
                this.drawImageYbCr444(image);
                break;
            default:
                throw 'Unsupported Format';
        }
    },

    drawImageYbCr422: function (image) {
        var width = this.getWidth();
        var height = this.getHeight();
        var data = new Uint8Array(image.data.toArrayBuffer());
        var bytesPerPixel = 2;
        this.imageRenderer.resize(width, height);
        this.imageRenderer.updateTexture('rawImage', data, width * bytesPerPixel, height, THREE.LuminanceFormat);
        this.imageRenderer.updateUniform('imageFormat', API.message.input.proto.Image.Format.YCbCr422);
        this.imageRenderer.updateUniform('imageWidth', width);
        this.imageRenderer.updateUniform('imageHeight', height);
        this.imageRenderer.render();
    },

    drawImageYbCr444: function (image) {
        var width = this.getWidth();
        var height = this.getHeight();
        var data = new Uint8Array(image.data.toArrayBuffer());
        this.imageRenderer.updateRawImage(data, width, height, THREE.RGBFormat);
    },

    drawImageB64: function (image) {
        var uri = 'data:image/jpeg;base64,' + this.arrayBufferToBase64(image.data.toArrayBuffer());//btoa(data);
        var imageObj = new Image();
        var ctx = this.getContext('image');
        imageObj.src = uri;
        imageObj.onload = function () {
            ctx.drawImage(imageObj, 0, 0, image.dimensions.x, image.dimensions.y);
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

    onSelectCamera: function (cameraId) {
        this.setCameraId(cameraId);
    },

    screenshot: function() {
        var x = this.getScreenshotX(), y = this.getScreenshotY(), width =  this.getScreenshotWidth(), height = this.getScreenshotHeight();

        var gl = this.getContext('image');

        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        var ctx = tempCanvas.getContext("2d");

        ctx.drawImage(gl.canvas, x, y, width, height, 0, 0, width, height);

        var dataURL = tempCanvas.toDataURL("image/png");
        var link = document.createElement("a");
        window.open(dataURL);
        /*link.download = "positive";
         link.href = dataURL;
         link.click();*/

        //cleanup
        tempCanvas.remove();
        link.remove();
    }
});
