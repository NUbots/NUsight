Ext.define('Ext.ux.NU.DisplayWindow', {
	extend : 'Ext.Window',
	alias : ['widget.nu.display_window'],
	itemId: "display_window",
	constrain: true,
	robotIP: null,
	tbar: [{
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
		store: new Ext.data.JsonStore({
			fields: ['robotIP'],
			data: []
		}),
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
		},
        addRobotIP: function (robotIP) {

            var self = this;

            var store = self.getStore();

            if (store.find('robotIP', robotIP) === -1) {

                store.add({
                    robotIP: robotIP
                });

            }

        }
	}]
});