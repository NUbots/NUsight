Ext.define('NU.view.robot.Selector', {
    itemId: 'robotIP',
    fieldLabel: 'Robot',
    labelWidth: 40,
    xtype: 'combo',
    queryMode: 'local',
    forceSelection: true,
    editable: false,
    displayField: 'robotIP',
    valueField: 'robotIP',
    emptyText: 'No Robot Selected',
    store: 'NU.store.Robots',
    listeners: {
        afterRender: function () {

            var self = this;

            Ext.each(NU.Network.getRobotIPs(), function (robotIP) {

                self.addRobotIP(robotIP);

            });

            NU.Network.on('robot_ip', function (robotIP) {

                self.addRobotIP(robotIP);

            });

            self.setValue(self.up("#display_window").robotIP);

        },
        select: function (combo, records, eOpts) {

            var self = this.up("#display_window");
            var robotIP = records[0].data.robotIP;

            self.robotIP = robotIP;
            self.fireEvent("robotIP", robotIP);

        }
    }
});
