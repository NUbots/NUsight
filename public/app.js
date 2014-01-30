(function () {

    "use strict";

    Ext.Loader.setConfig({
        enabled : true,
        //disableCaching : true, // For debug only
        paths : {
            'NU': './app'
        }
    });

    Ext.require('NU.util.Network');
    Ext.require('NU.store.Robots');
    Ext.require('NU.store.Streams');
    Ext.syncRequire([
        'NU.Application'
    ]);

    Ext.create('NU.Application');

}());
