Ext.define('NU.view.window.Configuration', {
    extend : 'NU.view.window.Display',
    requires: [
        'NU.store.ConfigurationTree',
        'Ext.grid.column.Widget',
        'NU.view.factory.Widget',
        'NU.view.window.ConfigurationController'
    ],
    alias: 'widget.nu_configuration_window',
    controller: 'Configuration',
    title: 'Configuration',
    width: 1000,
    height: 550,
    initComponent: function () {
        Ext.apply(this, {
            items: [{
                xtype: 'treepanel',
                reference: 'configurations',
                referenceHolder: true,
                title: 'Robot Configurations',
                store: Ext.create('NU.store.ConfigurationTree'),
                autoLoad: true,
                rootVisible: false,
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                rowLines: true,
                columnLines: true,
                viewConfig: {
                    stripeRows: true
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
                    widget: {
                        xtype: 'factoryWidget'
                    },
                    /**
                     * The greatest UNDOCUMENTED method of ALL TIME. An event called when the widget is attached to the
                     * view.
                     *
                     * @param widget The widget associated with the column.
                     * @param record The record associated with the widget.
                     */
                    onWidgetAttach: function (widget, record) {
                        widget.getController().onWidgetAttach(record); // todo fix badness
                    },
                    scope: this,
                    flex: 1
                }]
            }]
        });
        return this.callParent(arguments);
    }
});
