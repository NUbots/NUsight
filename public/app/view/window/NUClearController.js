Ext.define('NU.view.window.NUClearController', {
    extend: 'NU.view.window.DisplayController',
    alias: 'controller.NUClear',
    config: {
        lastUpdated: null,
        lastDraw: 0,
        updateSpeed: 1000
    },
    init: function () {

        // init object
        this.lastUpdated = {};

        // update default
        this.lookupReference('updatespeed').setRawValue(this.getUpdateSpeed());

        this.mon(NU.Network, 'message.support.nuclear.ReactionStatistics', this.onReactionStatistics, this);

        this.callParent(arguments);

    },
    onSelectRobot: function (robotId) {
        this.lookupReference('display').getRootNode().removeAll();
        this.callParent(arguments);
    },
    onUpdateSpeedChange: function (field, newValue, oldValue, eOpts) {
		this.setUpdateSpeed(newValue);
	},
    onReactionStatistics: function (robot, reactionStatistics) {

        // TODO: remove
        if (robot.get('id') !== this.getRobotId()) {
            return;
        }

        var reactionId = reactionStatistics.reactionId.toNumber();

        var now = Date.now();

        if (now - this.getLastUpdated(reactionId) > this.getUpdateSpeed()) {
            var root = this.lookupReference('display').getStore().getRootNode();

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
                    name: Ext.htmlEncode(this.getShortName(reactionStatistics)),
                    qtip: Ext.htmlEncode(reactionStatistics.triggerName),
                    reactionId: reactionStatistics.reactionId.toNumber(),
                    sumTime: diff,
                    numTime: 1
                });
            } else {
                if (causeReactionId > 0 && reactionNode.parentNode === root) {
                    // check if it needs moving
                    var potentialParent = root.findChild('reactionId', causeReactionId, true);
                    if (potentialParent !== null) {
                        // move it
                        potentialParent.appendChild(reactionNode);
                    }
                }

                // inc average
                reactionNode.set({
                    sumTime: reactionNode.get('sumTime') + diff,
                    numTime: reactionNode.get('numTime') + 1
                });
            }

            reactionNode.set({
                duration: (diff / 1000).toFixed(4) + 'ms',
                taskId: reactionStatistics.taskId.toNumber(),
                //causeReactionId: reactionStatistics.causeReactionId.toNumber(),
                causeTaskId: reactionStatistics.causeTaskId.toNumber(),
                durationAverage: ((reactionNode.get('sumTime') / reactionNode.get('numTime')) / 1000).toFixed(4) + 'ms'
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
    getShortName: function (reactionStatistics) {
        var name = reactionStatistics.name;
        var triggerName = reactionStatistics.triggerName;
        var functionName = reactionStatistics.functionName;
        if (name !== "") {
            return name;
        }
        // TODO: support non-lambdas
        var className = functionName.match(/modules::([^(]+)::([^(]+)\(/)[1];
        return className + " - " + triggerName
            .replace(/^std::tuple<(.*)>$/, "$1")
            .replace(/NUClear::dsl::/g, '')
            .replace(/std::chrono::/g, '')
            .replace(/(Every<(\d+), (Per<)?)?duration<long long, std::ratio<(\d+)ll, (\d+)ll> > ((?:> )?>)/g, function (o, prefix, every, per, num, den, suffix) {
                num = parseInt(num, 10);
                den = parseInt(den, 10);
                every = parseInt(every, 10);

                // implemented a reasonable subset of http://en.cppreference.com/w/cpp/numeric/ratio/ratio
                var units = null;
                if (num == 3600 && den == 1) {
                    units = 'hour';
                } else if (num == 60 && den == 1) {
                    units = 'minute';
                } else if (num == 1) {
                    if (den == 1) {
                        units = 'second';
                    } else if (den == 1E3) {
                        units = 'millisecond'
                    } else if (den == 1E6) {
                        units = 'microsecond'
                    } else if (den == 1E9) {
                        units = 'nanosecond'
                    }
                }
                if (units === null) {
                    return o;
                } else {
                    if (per === undefined && every > 1) {
                        units += "s";
                    }
                    return prefix + units + suffix;
                }
            });
    }
});
