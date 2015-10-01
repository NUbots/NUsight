Ext.define('NU.view.robot.List', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.robotlist',
    requires: [
        'NU.store.Robots',
        'NU.view.robot.ListController',
	],
    controller: 'List',
    store: 'Robots',
    columns: [{
        text: 'Name',
        dataIndex: 'id',
        editor: 'textfield',
        width: 170
    }, {
        text: 'IP Address',
        dataIndex: 'host',
        editor: 'textfield',
        flex: 1
    }, {
        text: 'Enabled',
        xtype: 'checkcolumn',
        dataIndex: 'enabled',
        disabled: true
    }]
});
