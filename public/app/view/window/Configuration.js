/**
 * @author: Monica Olejniczak
 */
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
                rowLines: true,
                columnLines: true,
                viewConfig: {
                    stripeRows: true
                },
                columns: [{
                    xtype: 'treecolumn',
                    text: 'Path',
                    dataIndex: 'path',
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
                     * @param column The column of the panel.
                     * @param widget The widget associated with the column.
                     * @param record The record associated with the widget.
                     */
                    onWidgetAttach: function (column, widget, record) {
                        widget.getController().onWidgetAttach(record); // todo fix badness
                    },
                    flex: 1,
                    scope: this
                }]
            }]
        });
        return this.callParent(arguments);
    }
});
