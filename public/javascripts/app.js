Ext.Loader.setConfig({
  enabled : true,
  disableCaching : true, // For debug only
  paths : {
    // 'Chart' : HOME + '/highcharts_extjs4'     // For website
    'Chart' : 'javascripts/Highcharts_Sencha/Chart'
  }
});

Ext.require('Chart.ux.Highcharts.LineSerie');
Ext.require('Chart.ux.Highcharts.SplineSerie');