Ext.define('NU.controller.Display', {
    extend: 'Ext.app.Controller',
    requires: 'NU.util.Network',
    stores: ['Robots'],
    robotIP: null,
    init: function () {
        this.control({
            '#robotIP': {
                afterrender: function () {

                    var self = this;

                    Ext.each(NU.util.Network.getRobotIPs(), function (robotIP) {

                        self.addRobotIP(robotIP);

                    });

                    NU.util.Network.on('robot_ip', function (robotIP) {

                        self.addRobotIP(robotIP);

                    });

                },
                select: function (combo, records, eOpts) {

                    var robotIP = records[0].getData().ipAddress;

                    this.robotIP = robotIP;
                    this.fireEvent("robotIP", robotIP);

                }
            }
        });
    },
    addRobotIP: function (robotIP) {

        var store = this.getRobotsStore();

        if (store.find('ipAddress', robotIP) === -1) {

            store.add({
                ipAddress: robotIP,
                name: robotIP, // TODO: give name :D
                enabled: true
            });

        }

    }
});