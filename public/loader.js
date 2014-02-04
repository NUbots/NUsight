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
