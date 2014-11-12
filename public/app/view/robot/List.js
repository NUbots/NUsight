Ext.define('NU.view.robot.List', {
    extend: 'Ext.grid.Panel',
    requires: [
        'NU.view.robot.ListController',
        'Ext.grid.plugin.RowEditing'
	],
    controller: 'List',
    alias: 'widget.robotlist',
    columns: [{
        header: 'Name',
        width: 170,
        dataIndex: 'name',
        editor: 'textfield'
    }, {
        header: 'IP Address',
        flex: 1,
        dataIndex: 'ipAddress',
        editor: 'textfield'
    }],
    plugins: [{
        ptype: 'rowediting',
        pluginId: 'rowEditing'
    }],
    tbar: [{
        text: 'Add Robot',
        iconCls: 'icon-add',
        listeners: {
            click: 'onAddRobot'
        }
    }, {
        text: 'Remove Robot',
        iconCls: 'icon-cross',
        listeners: {
            click: 'onRemoveRobot'
        }
    }]
});
