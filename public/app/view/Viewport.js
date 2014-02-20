Ext.define('NU.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'NU.view.Toolbar'
    ],
    cls: 'desktop',
    layout: 'border',
    items: [{
        xtype: 'nu_toolbar',
        region: 'north'
    }, {
        xtype: 'container',
        region: 'center',
        id: 'main_display',
        itemId: 'main_display',
        style: {
            backgroundColor: '#000'
        }
    }]
});
