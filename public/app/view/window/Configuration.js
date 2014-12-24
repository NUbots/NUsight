/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.window.Configuration', {
    extend : 'NU.view.window.Display',
    requires: [
        'NU.store.ConfigurationTree',
        'Ext.grid.column.Widget',
        'NU.view.column.Widget',
        'NU.view.factory.Widget',
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
        title: 'Robot Configurations',
        store: Ext.create('NU.store.ConfigurationTree'),
        autoLoad: true,
        rootVisible: false,
        rowLines: true,
        columnLines: true,
        viewConfig: {
            stripeRows: true
        },
        columns: [{
            xtype: 'treecolumn',
            text: 'Path',
            dataIndex: 'path',
            sortable: false,
            flex: 1
        }, {
            xtype: 'widgetColumn',
            text: 'Configurations',
            widget: {
                xtype: 'factoryWidget'
            },
            sortable: false,
            flex: 1
        }]
    }]
});
