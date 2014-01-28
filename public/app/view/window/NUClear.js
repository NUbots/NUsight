Ext.define('NU.view.window.NUClear', {
    extend : 'NU.view.window.Display',
    alias : ['widget.nu_nuclear_window'],
    autoShow: true,
    title: 'NUClear Display',
    width: 1200,
    height: 480,
    resizable: {
        preserveRatio: false
    },
    lastDraw: 0,
    layout: 'border',
    lastUpdated: 0,
    items: [{
        xtype: 'treepanel',
        region: 'center',
        store: Ext.create('Ext.data.TreeStore'),
        columns: [{
            xtype: 'treecolumn',
            text: 'Reaction',
            width: 800,
            dataIndex: 'name'
        }, {
            text: 'Duration',
            dataIndex: 'duration',
        }, {
            text: 'ReactionId',
            dataIndex: 'reactionId',
            type: 'number'
        }, {
            text: 'TaskId',
            dataIndex: 'taskId'
        }, {
            text: 'CauseReactionId',
            dataIndex: 'causeReactionId'
        }, {
            text: 'CauseTaskId',
            dataIndex: 'causeTaskId'
        }],
        rootVisible: false,
        itemId: 'display'
    }, {
        xtype: 'grid',
        title: 'Logs',
        region: 'south',
        height: 200,
        columns: [{
            text: 'Reactor',
            dataIndex: 'reactor'
        }, {
            text: 'Message',
            width: 800,
            dataIndex: 'message'
        }],
        itemId: 'logs'
    }]
});
