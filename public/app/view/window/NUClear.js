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
    }],
    constructor: function () {

        NU.util.Network.on('reaction_statistics', Ext.bind(this.onReactionStatistics, this));

        this.callParent(arguments);
    },
    listeners: {
        afterRender: function () {

            this.display = this.down('#display');
            this.logs = this.down('#logs');

            window.t = this;
        },
        robotIP: function () {

            this.display.getRootNode().removeAll();

        }
    },
    onReactionStatistics: function (robotIP, api_message) {

        // TODO: remove
//        if (robotIP !== this.robotIP) {
//            return;
//        }

        var reactionStatistics = api_message.reactionStatistics;
        var root = this.display.getRootNode();

        var now = Date.now();
        if (now - this.lastUpdated > 0) {
//            root.removeAll();
            var reactionId = reactionStatistics.reactionId.toNumber();
            var causeReactionId = reactionStatistics.causeReactionId.toNumber();
            var reactionNode = root.findChildBy(function (node) {
                return (node.get('reactionId') === reactionId && node.get('causeReactionId') === causeReactionId);
            }, undefined, true);
            var diff = reactionStatistics.finished.toNumber() - reactionStatistics.started.toNumber();

            if (reactionNode === null) {

                var parent = root.findChild('reactionId', causeReactionId, true);

                if (parent === null) {
                    parent = root;
                }
                reactionNode = parent.insertChild(0, {
                    reactionId: reactionId,
                    causeReactionId: causeReactionId,
                    expanded: true,
                    iconCls: 'icon-reaction'
                });

                reactionNode.set({
                    // WHYYYYYYYYYYYYYYYYYYYYYYYY
                    name: Ext.util.Format.htmlEncode(this.getShortName(reactionStatistics.name)),
                    qtip: Ext.util.Format.htmlEncode(Ext.util.Format.htmlEncode(reactionStatistics.name)),
                    reactionId: reactionStatistics.reactionId.toNumber()
                })
            } else if (causeReactionId > 0 && reactionNode.parentNode === root) {
                // check if it needs moving
                var potentialParent = root.findChild('reactionId', causeReactionId, true);
                if (potentialParent !== null) {
                    // move it
                    potentialParent.appendChild(reactionNode);
                }
            }

            reactionNode.set({
                duration: diff / 1000 + 'ms',
                taskId: reactionStatistics.taskId.toNumber(),
                causeReactionId: reactionStatistics.causeReactionId.toNumber(),
                causeTaskId: reactionStatistics.causeTaskId.toNumber()
            });

            Ext.each(reactionStatistics.log, function (log) {
                var store = this.logs.getStore();
                var row = store.add({})[0];
                row.set({
                    reactor: Ext.util.Format.htmlEncode(this.getShortName(reactionStatistics.name)),
                    message: log
                });
                if (store.count() > 5) {
                    store.removeAt(0);
                }
            }, this);

            this.lastUpdated = now;
        }
    },
    getShortName: function (name) {
        if (name.indexOf('lambda') === -1) {
            // TODO: support non-lambdas
            return name;
        }
        var reactor = name.match(/:([^:]+)\(/)[1];
        var dataType = name.match(/lambda\(([^)]+)\)/)[1];
        if (dataType.indexOf('time_point') !== -1) {
            dataType = 'time_t';
        }
        return reactor + "(" + dataType + ")";
    }
});
