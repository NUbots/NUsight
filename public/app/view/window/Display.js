Ext.define('NU.view.window.Display', {
    extend: 'Ext.Window',
    requires: [
        'NU.view.window.DisplayController',
        'NU.Network',
        'NU.view.robot.Selector',
	    'Ext.tree.Panel'
    ],
    controller: 'Display',
    autoShow: true,
    constrain: true,
    maximizable: true,
	onEsc: Ext.emptyFn,
    tbar: {
        xtype: 'toolbar',
        layout: {
            overflowHandler: 'Menu'
        },
        items: [{
            xtype: 'robot_selector',
            listeners: {
                selectRobot: 'onSelectRobot'
            }
        }]
    },
	layout: 'fit',
    listeners: {
        maximize: 'onMaximize'
    }
});
