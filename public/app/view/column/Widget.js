/**
 * @author Monica Olejniczak
 */
Ext.define('NU.view.column.Widget', {
    extend: 'Ext.grid.column.Column',
    xtype: 'widgetColumn',
    requires: [
        'NU.view.column.WidgetController'
    ],
    controller: 'WidgetColumn',
    config: {
        widget: null
    },
    listeners: {
        resize: 'onResize',
        beforeRender: 'onBeforeRender'
    }
});
