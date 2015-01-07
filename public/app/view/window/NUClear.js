Ext.define('NU.view.window.NUClear', {
    extend : 'NU.view.window.Display',
    alias : ['widget.nu_nuclear_window'],
    requires: [
        'NU.view.window.NUClearController',
        'NU.store.ReactionStatisticsTree'
	],
    controller: 'NUClear',
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
        }, {
            xtype: 'numberfield',
            reference: 'updatespeed',
            fieldLabel: 'Update Speed (ms)',
            labelStyle: 'white-space: nowrap',
            labelWidth: 120,
            listening: {
                change: 'onUpdateSpeedChange'
            }
        }]
    },
    initComponent: function () {
        Ext.applyIf(this, {
            items: [{
                xtype: 'treepanel',
                region: 'center',
                store: Ext.create('NU.store.ReactionStatisticsTree'),
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
                reference: 'display'
            }]
        });

        this.callParent(arguments);
    }
});
