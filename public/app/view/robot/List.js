Ext.define('NU.view.robot.List', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.robotlist',
    inject: 'robotsScore',
    config: {
        robotsStore: null
    },
    title: 'Robot List',
    columns: [{
        header: 'Name',
        dataIndex: 'name'
    }, {
        header: 'IP Address',
        dataIndex: 'ipAddress'
    }],
    initComponent: function () {

        Ext.applyIf(this, {
            store: this.getRobotsStore()
        });

        this.callParent(arguments);
    }
});
