Ext.define('NU.controller.Classifier', {
    extend: 'NU.controller.Display',
    config: {
        rawContext: null,
        classifiedContext: null,
        frozen: false
    },
    control: {
        'rawImage': true,
        'classifiedImage': true,
        'target': true,
        'snapshot': {
            change: function (checkbox, newValue, oldValue, eOpts) {
                this.setFrozen(newValue);
            }
        }
    },
    init: function () {
        NU.util.Network.on('vision', Ext.bind(this.onVision, this));
        this.callParent(arguments);

        var elCanvas = this.getRawImage().getEl();
        var rawCanvas = elCanvas.dom;
        this.setRawContext(rawCanvas.getContext('2d'));
        this.mon(elCanvas, 'click', this.onRawImageClick, this);

        var classifiedCanvas = this.getClassifiedImage().getEl().dom;
        this.setClassifiedContext(classifiedCanvas.getContext('2d'));

        lut = new Array;        // masssive arr ?howtoglobalscopeit???????????????????????
        for(var i=0;i<16777216;i++) { // 2^(8+8+8)=16777216
            lut[i] = -1;
        }
        //console.log("Lut defined: " + lut[16777215]); //definition is ok, but var isnt retained..
    },
    onVision: function (robotIP, api_message) {

        // TODO: remove
        if (robotIP !== this.robotIP) {
            return;
        }

        var api_vision = api_message.vision;
        var image = api_vision.image;

        if (!this.getFrozen()) {
            this.drawImage(image);
        }

    },
    onRawImageClick: function (e, rawCanvas) {
        var el = Ext.get(rawCanvas);
        var x = e.getX() - el.getLeft();
        var y = e.getY() - el.getTop();

        var ctx = this.getRawContext();
        var idata = ctx.getImageData(x,y,1,1);
        var rgba = idata.data;
        var ycc = [0,0,0];

        var clctx = this.getClassifiedContext();
        this.classifiedUpdate(clctx, rgba, x, y);

        //console.log(this.lut[999]); //cant resolve scope :(

        // what gets classified (from NUClearPort/shared/messages/vision.h)
        // white, //!< Colour is in the White region.
        // white, //!< Colour is in the White region.
        // green, //!< Colour is in the Green region.
        // shadow_object, //!< Colour is part of a shadowed area.
        // pink, //!< Colour is in the Red region.
        // pink_orange, //!< Colour is in the region of overlap between Red and Orange.
        // orange, //!< Colour is in the Orange region.
        // yellow_orange, //!< Colour is in the region of overlap between Yellow and Orange.
        // yellow, //!< Colour is in the Yellow region.
        // blue, //!< Colour is in the Sky Blue region.
        // shadow_blue, //!< Colour is in the Dark Blue region.

        //its possible for rgb colours of #f00 or #00f to make
        //ycc color values exceed 255 if rounded (max value is 255.5)
        ycc[0] = Math.floor(      0.299    * rgba[0] + 0.587    * rgba[1] + 0.114    * rgba[2]);
        ycc[1] = Math.floor(128 - 0.168736 * rgba[0] - 0.331264 * rgba[1] + 0.5      * rgba[2]);
        ycc[2] = Math.floor(128 + 0.5      * rgba[0] - 0.418688 * rgba[1] + 0.081312 * rgba[2]);

        console.log(x, y);
        console.log(idata.data, this.getTarget().getValue()); //this.getTarget().getValue() is the name of what we're selecting
        console.log(ycc);
    },
    classifiedUpdate: function (cimage, col, x, y) { // (classified image, colour)
        this.getClassifiedImage().getEl().setStyle('background-image', 'none');

        cimage.fillRect(x,y,1,1);
        cimage.fillStyle = "rgb("+col[0]+", "+col[1]+", "+col[2]+")";
        cimage.fillRect(x,y,1,1);
    },
    drawImage: function (image) {
        this.drawImageB64(image);
    },
    drawImageB64: function (image) {
        var data = String.fromCharCode.apply(null, new Uint8ClampedArray(image.data.toArrayBuffer()));
        var uri = 'data:image/jpeg;base64,' + btoa(data);
        var imageObj = new Image();
        var ctx = this.getRawContext();
        imageObj.src = uri;
        imageObj.onload = function () {
            ctx.drawImage(imageObj, 0, 0, image.width, image.height);
        };
    }
});