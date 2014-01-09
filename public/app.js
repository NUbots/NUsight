(function () {

    "use strict";

    Ext.Loader.setConfig({
        enabled : true,
        disableCaching : true, // For debug only
        paths : {
            // 'Chart' : HOME + '/highcharts_extjs4'     // For website
            'NU': './extjs/src/NU',
            'Chart': 'resources/js/lib/Highcharts_Sencha/Chart'
        }
    });

    Ext.require('Chart.ux.Highcharts.LineSerie');
    Ext.require('Chart.ux.Highcharts.SplineSerie');
    //Ext.require('NU.Network');

    Ext.application({
        name: 'NU',
        autoCreateViewport: true,
        views: [
            'robot.List'
        ]
    });

}());
