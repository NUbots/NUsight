Ext.define('NU.view.window.Display', {
	extend : 'Ext.Window',
    requires: [
        'NU.util.Network'
    ],
	alias : ['widget.nu.display_window'],
	itemId: "display_window",
	constrain: true,
	robotIP: null,
    autoShow: true,
	tbar: [{
		itemId: 'robotIP',
		fieldLabel: 'Robot',
		labelWidth: 40,
		xtype: 'combo',
		queryMode: 'local',
		forceSelection: true,
		editable: false,
		displayField: 'ipAddress',
		valueField: 'ipAddress',
        emptyText: 'No Robot Selected',
		store: 'Robots',
		listeners: {
			afterRender: function () {

                var self = this;

                Ext.each(NU.util.Network.getRobotIPs(), function (robotIP) {

                    self.addRobotIP(robotIP);

                });

                NU.util.Network.on('robot_ip', function (robotIP) {

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
		},
        addRobotIP: function (robotIP) {

            var self = this;

            var store = self.getStore();

            if (store.find('ipAddress', robotIP) === -1) {

                store.add({
                    ipAddress: robotIP,
                    enabled: true
                });

            }

        }
	}]
});