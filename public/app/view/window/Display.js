Ext.define('NU.view.window.Display', {
    extend: 'Ext.Window',
    requires: [
        'NU.util.Network',
        'NU.view.robot.Selector'
    ],
    autoShow: true,
    constrain: true,
    maximizable: true,
    tbar: [{
        xtype: 'robot_selector'
    }]
});