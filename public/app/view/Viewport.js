Ext.define('NUbugger.view.Viewport', {
    extend: 'Ext.container.Viewport',
    cls: 'desktop', 
    layout: 'border',
    items: [{
        xtype: 'toolbar',
        region: 'north',
        items: [{
            iconCls: 'icon-cog',
            text: 'Settings'
        }]
    }, {
        xtype: 'container',
        region: 'center',
        items: [{
            xtype: 'window',
            title: 'sup',
            x: 0,
            y: 0,
            width: 800,
            height: 600,
            autoShow: true,
            constrain: true,
            layout: 'fit',
            items: [{
                id: 'main_3d_display',
                layout: 'fit',
                listeners: {
                    resize: function (window, width, height) {
                        resizeScene(width, height);
                    }
                }
            }]
            //autoShow: false
        }]
    }]
});