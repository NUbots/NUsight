// hack: http://halfpapstudios.com/blog/tag/html5-canvas/
if (typeof Uint8ClampedArray !== 'undefined') {
    Uint8ClampedArray.prototype.slice = Array.prototype.slice; //Firefox and Chrome
} else if (typeof CanvasPixelArray!== 'undefined') {
    CanvasPixelArray.prototype.slice = Array.prototype.slice; //IE10 and IE9
}

Ext.Loader.setConfig({
    disableCaching : false
});

Ext.onReady(function() {
    Ext.application({
        name: 'NU',
        paths: {
            'Ext': 'lib/extjs/src',
            'Ext.ux': 'lib/extjs/examples/ux'
        },
        requires: [
            'NU.util.Network'
        ],
        stores: [
            'Robots',
            'Camera'
            //'Streams',
            //'ReactionStatisticsTree',
            //'classifier.Target',
            //'classifier.SelectionTool',
            //'ActionStateChange',
            //'RegisterActionTree',
            //'ReactionHandles'
        ],
        autoCreateViewport: true,
		launch: function () {
            NU.util.Network.init();
        }
    });
});