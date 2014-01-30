Ext.define('NU.controller.robot.Selector', {
    extend: 'Deft.mvc.ViewController',
    requires: 'NU.util.Network',
    inject:  'robotsStore',
    config: {
        robotIP: null,
        robotsStore: null
    },
    control: {
        'view': {
            select: function (combo, records, eOpts) {

                var robotIP = records[0].data.ipAddress;
                this.setRobotIP(robotIP);
                combo.fireEvent('robotIP', robotIP);

            }
        }
    },
    init: function () {

        Ext.each(NU.util.Network.getRobotIPs(), function (robotIP) {

            this.addRobotIP(robotIP);

        }, this);

        NU.util.Network.on('robot_ip', function (robotIP) {

            this.addRobotIP(robotIP);

        }, this);

        this.callParent(arguments);

    },
    addRobotIP: function (robotIP) {

        var store = this.getRobotsStore();

        if (store.find("ipAddress", robotIP) === -1) {
            store.add({
                ipAddress: robotIP,
                name: robotIP, // TODO: get a name
                enabled: true
            });
        }

    }
});

