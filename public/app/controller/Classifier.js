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

        var classifiedCanvas = this.getRawImage().getEl().dom;
        this.setClassifiedContext(classifiedCanvas.getContext('2d'));

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
        console.log(x, y);
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