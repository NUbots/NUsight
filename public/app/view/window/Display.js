Ext.define('NU.view.window.Display', {
    extend: 'Ext.Window',
    requires: 'NU.util.Network',
    autoShow: true,
    contrain: true,
    tbar: [{
        xtype: 'robot_selector'
    }]
});