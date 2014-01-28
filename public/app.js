(function () {

    "use strict";

    Ext.Loader.setConfig({
        enabled : true,
        disableCaching : true, // For debug only
        paths : {
            // 'Chart' : HOME + '/highcharts_extjs4'     // For website
            //'Chart': 'resources/js/lib/Highcharts_Sencha/Chart'
            'NU': './app',
        }
    });

    //Ext.require('Chart.ux.Highcharts.LineSerie');
    //Ext.require('Chart.ux.Highcharts.SplineSerie');
    Ext.require('NU.util.Network');
    Ext.require('NU.store.Robots');
    Ext.require('NU.store.Streams');

    Ext.application({
        name: 'NU',
        autoCreateViewport: true,
        models: [
            'Robot',
            'Stream'
        ],
        stores: [
            'Robots',
            'Streams'
        ],
        views: [
            'robot.List',
        ],
        controllers: [
            'Field',
            'Chart'
        ],
        launch: function () {
            window._NU = this;
        }
    });

}());
