Ext.define('NU.view.window.Configuration', {
    extend : 'NU.view.window.Display',
    requires: [
        'NU.store.ConfigurationTree',
        //'NU.view.factory.Widget',
        'NU.view.window.ConfigurationController'
    ],
    alias: 'widget.nu_configuration_window',
    controller: 'Configuration',
    title: 'Configuration',
    width: 1000,
    height: 550,
    items: [{
        xtype: 'treepanel',
        reference: 'configurations',
        referenceHolder: true,
        store: Ext.create('NU.store.ConfigurationTree'),
        rootVisible: false,
        layout: {
            type: 'hbox',
            align: 'stretch'
        },
        columns: [{
            xtype: 'treecolumn',
            text: 'Path',
            dataIndex: 'path',
            type: 'string',
            flex: 1
        }, {
            xtype: 'widgetcolumn',
            text: 'Configurations',
            dataIndex: 'name',
            widget: {
                xtype: 'textfield'
            },//Ext.create('NU.view.factory.Widget'),
            flex: 1
        }]
    }]
});
