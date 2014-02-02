(function () {

    "use strict";

    Ext.Loader.setConfig({
        enabled : true,
        //disableCaching : true, // For debug only
        paths : {
            'NU': './app'
        }
    });

    Ext.syncRequire([
        'NU.Application'
    ]);

    Ext.create('NU.Application');

}());
