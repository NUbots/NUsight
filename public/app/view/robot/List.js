Ext.define('NU.view.robot.List', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.robotlist',
    requires: [
        'NU.store.Robots',
        'NU.view.robot.ListController',
        'Ext.grid.plugin.RowEditing'
	],
    controller: 'List',
    store: 'Robots',
    columns: [{
        text: 'Name',
        dataIndex: 'name',
        editor: 'textfield',
        width: 170
    }, {
        text: 'IP Address',
        dataIndex: 'ipAddress',
        editor: 'textfield',
        flex: 1
    }, {
        xtype: 'checkcolumn',
        text: 'Enabled',
        dataIndex: 'enabled',
        listeners: {
            checkChange: 'onCheckChange'
        }
    }],
    plugins: [{
        ptype: 'rowediting',
        pluginId: 'rowEditing'
    }],
    tbar: [{
        text: 'Add Robot',
        iconCls: 'icon-add',
        handler: 'onAddRobot'
    }, {
        text: 'Remove Robot',
        iconCls: 'icon-cross',
        handler: 'onRemoveRobot'
    }]
});
