Ext.define('NU.view.window.Display', {
    extend: 'Ext.Window',
    requires: [
        'NU.util.Network',
        'NU.view.robot.Selector'
    ],
    autoShow: true,
    constrain: true,
    maximizable: true,
	onEsc: Ext.emptyFn,
    tbar: [{
        xtype: 'robot_selector'
    }],
	layout: 'fit'
});