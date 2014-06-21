Ext.define('NU.view.window.NUClear', {
    extend : 'NU.view.window.Display',
    alias : ['widget.nu_nuclear_window'],
    controller: 'NU.controller.NUClear',
    inject: 'reactionStatisticsTreeStore',
    config: {
        reactionStatisticsTreeStore: null
    },
    title: 'NUClear Display',
    width: 1200,
    height: 480,
    resizable: {
        preserveRatio: false
    },
    layout: 'border',
    tbar: [{
        xtype: 'robot_selector'
    }, {
        xtype: 'numberfield',
        itemId: 'updatespeed',
        fieldLabel: 'Update Speed (ms)',
        labelStyle: 'white-space: nowrap',
        labelWidth: 120
    }],
    initComponent: function () {
        Ext.applyIf(this, {
            items: [{
                xtype: 'treepanel',
                region: 'center',
                store: this.getReactionStatisticsTreeStore(),
                viewConfig: {
                    markDirty: false
                },
                columns: [{
                    text: 'Id',
                    dataIndex: 'reactionId',
                    type: 'number',
                    width: 40
                }, {
                    xtype: 'treecolumn',
                    text: 'Reaction',
                    flex: 1,
                    dataIndex: 'name',
                    type: 'string'
                }, {
                    text: 'Duration',
                    dataIndex: 'duration'
                }],
                rootVisible: false,
                itemId: 'display'
            }]
        });

        this.callParent(arguments);
    }
});
