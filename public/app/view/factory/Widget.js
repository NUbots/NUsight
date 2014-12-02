Ext.define('NU.view.factory.Widget', {
    extend: 'Ext.container.Container',
    xtype: 'factoryWidget',
    requires: [
        'NU.view.factory.WidgetController'
    ],
    controller: 'Widget',
    layout: {
        type: 'vbox',
        align: 'stretch'
    }
});
