// hack: http://halfpapstudios.com/blog/tag/html5-canvas/
if (typeof Uint8ClampedArray !== 'undefined') {
    Uint8ClampedArray.prototype.slice = Array.prototype.slice; //Firefox and Chrome
} else if (typeof CanvasPixelArray!== 'undefined') {
    CanvasPixelArray.prototype.slice = Array.prototype.slice; //IE10 and IE9
} else {
    // Deprecated browser
}

Ext.Loader.setConfig({
    enabled : true,
    disableCaching : false,
    paths : {
        'Ext': 'lib/extjs/src',
        'NU': './app'
    }
});

Ext.application({
    name: 'NU',
    paths: {
        'NU': '/app'
    },
    requires: [
        'NU.view.Viewport'
    ],
    stores: [
        'Robots',
        'Camera',
        'Streams',
        'ReactionStatisticsTree',
        'classifier.Target',
        'classifier.SelectionTool',
        'ActionStateChange',
        'RegisterActionTree',
        'ReactionHandles'
    ],
    /**
     * This method is called when the application boots
     */
    init: function () {
        window._NU = this;
    },
    /**
     * This method is called when the page has loaded
     */
    launch: function () {
        Ext.create('NU.view.Viewport');
    }
});