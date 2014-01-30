Ext.define('NU.view.window.Field', {
    extend : 'NU.view.window.Display',
    alias : ['widget.nu_field_window'],
    requires: [
        'NU.view.field.Robot'
    ],
    controller: 'NU.controller.Field',
    title: 'Localisation Display',
    width: 800,
    height: 400,
    layout: 'fit',
    tbar: [{
        text: 'HawkEye',
        itemId: 'hawkeye'
    }, {
        text: 'Perspective',
        itemId: 'perspective'
    }, {
        text: 'Side',
        itemId: 'side'
    }],
    items: [{
        xtype: 'threejs',
        itemId: 'mainscene',
        id: 'mainscene'
    }],
});
