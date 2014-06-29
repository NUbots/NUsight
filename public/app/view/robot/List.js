Ext.define('NU.view.robot.List', {
    extend: 'Ext.grid.Panel',
    requires: 'Ext.grid.plugin.RowEditing',
    controller: 'NU.controller.robot.List',
    alias: 'widget.robotlist',
    inject: 'robotsStore',
    config: {
        robotsStore: null
    },
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
        itemId: 'addRobot',
        text: 'Add Robot',
        iconCls: 'icon-add'
    }, {
        itemId: 'removeRobot',
        text: 'Remove Robot',
        iconCls: 'icon-cross'
    }],
    initComponent: function () {

        Ext.apply(this, {
            store: this.getRobotsStore()
        });

        this.callParent(arguments);
    }
});
