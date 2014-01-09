Ext.define('NU.view.robot.List', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.robotlist',
    title: 'Robot List',
    initComponent: function () {
        this.store = {
            fields: [
                'name',
                'ipAddress'
            ]
        },
        this.columns = [{
            header: 'Name',
            dataIndex: 'name'
        }, {
            header: 'IP Address',
            dataIndex: 'ipAddress'
        }]
    }
});
