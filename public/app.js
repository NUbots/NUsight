// hack: http://halfpapstudios.com/blog/tag/html5-canvas/
if (typeof Uint8ClampedArray !== 'undefined') {
    Object.defineProperty(Uint8ClampedArray.prototype, 'slice', Object.getOwnPropertyDescriptor(Array.prototype, 'slice')); // Chrome and Firefox
} else if (typeof CanvasPixelArray!== 'undefined') {
    Object.defineProperty(CanvasPixelArray.prototype, 'slice', Object.getOwnPropertyDescriptor(Array.prototype, 'slice')); //IE10 and IE9
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
            'Camera',
            'ReactionHandles'
            //'Streams',
            //'ReactionStatisticsTree',
            //'classifier.Target',
            //'classifier.SelectionTool',
            //'ActionStateChange',
            //'RegisterActionTree',
        ],
        autoCreateViewport: true,
		launch: function () {
            NU.util.Network.init();
        }
    });
});
