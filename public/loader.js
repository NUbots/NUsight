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
    //disableCaching : true, // For debug only
    paths : {
        'Ext': 'extjs/src',
        'NU': './app'
    }
});

// Required for DeftJS
Ext.syncRequire(['Ext.Component', 'Ext.ComponentManager', 'Ext.ComponentQuery']);
