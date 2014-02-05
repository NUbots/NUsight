Ext.define('NU.controller.NUClear', {
    extend: 'NU.controller.Display',
    inject: 'reactionStatisticsTreeStore',
    control: {
        'display': true,
        'robot_selector': {
            robotIP: function () {
                this.getDisplay().getRootNode().removeAll();
            }
        },
        'updatespeed': {
            change: function (field, newValue, oldValue, eOpts) {
                this.setUpdateSpeed(newValue);
            }
        }
    },
    config: {
        reactionStatisticsTreeStore: null,
        lastUpdated: null,
        lastDraw: 0,
        updateSpeed: 1000
    },
    init: function () {

        // init object
        this.lastUpdated = {};

        // update default
        this.getUpdatespeed().setRawValue(this.getUpdateSpeed());

        NU.util.Network.on('reaction_statistics', Ext.bind(this.onReactionStatistics, this));

        this.callParent(arguments);

    },
    onReactionStatistics: function (robotIP, api_message) {

        // TODO: remove
        if (robotIP !== this.robotIP) {
            return;
        }

        var reactionStatistics = api_message.reactionStatistics;
        var reactionId = reactionStatistics.reactionId.toNumber();

        var now = Date.now();

        if (now - this.getLastUpdated(reactionId) > this.getUpdateSpeed()) {
            var root = this.getReactionStatisticsTreeStore().getRootNode();

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
                    name: Ext.util.Format.htmlEncode(this.getShortName(reactionStatistics.name)),
                    qtip: Ext.util.Format.htmlEncode(reactionStatistics.name),
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
                //causeReactionId: reactionStatistics.causeReactionId.toNumber(),
                causeTaskId: reactionStatistics.causeTaskId.toNumber()
            });

            this.setLastUpdated(reactionId, now);
        }
    },
    getLastUpdated: function (reactionId) {
        var lastUpdated = this.lastUpdated[reactionId];
        if (lastUpdated === undefined) {
            lastUpdated = 0;
        }
        this.lastUpdated[reactionId] = lastUpdated;
        return lastUpdated;
    },
    setLastUpdated: function (reactionId, value) {
        this.lastUpdated[reactionId] = value;
    },
    getShortName: function (name) {
        return name
            .replace(/^std::tuple<(.*)>$/, "$1")
            .replace(/NUClear::dsl::/g, '')
            .replace(/std::chrono::/g, '')
            .replace(/duration<long long, std::ratio<(\d+)ll, (\d+)ll> > ?/g, function (o, num, den) {
                num = parseInt(num, 10);
                den = parseInt(den, 10);

                // implemented a reasonable subset of http://en.cppreference.com/w/cpp/numeric/ratio/ratio
                if (num == 3600 && den == 1) {
                    return 'hours';
                } else if (num == 60 && den == 1) {
                    return 'minutes';
                } else if (num == 1) {
                    if (den == 1) {
                        return 'seconds';
                    } else if (den == 1E3) {
                        return 'milliseconds'
                    } else if (den == 1E6) {
                        return 'microseconds'
                    } else if (den == 1E9) {
                        return 'nanoseconds'
                    }
                }
                return o;
            });
    }
});