Ext.define('NU.view.StatusBarController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.StatusBar',
	requires: [
		'NU.util.Display',
		'NU.Network'
	],
	config: {
		packetCounter: 0,
		insertIndex: 0,
		updateRate: 600
	},
	init: function () {
		this.panels = {};
		NU.Network.on('packet', this.onPacket.bind(this));
		this.addRobots();
	},
	addRobots: function () {
		var view = this.getView();
		var store = Ext.getStore('Robots');
		store.on('add', function (store, robots) {
			Ext.each(robots, function(robot) {
				var name = robot.get('name');
				var robotIP = robot.get('ipAddress');
				this.panels[robotIP] = view.insert(this.getInsertIndex(), {
					xtype: 'panel',
					tpl: '{name}: {count}',
					data: {
						name: name,
						count: 0
					}
				});
				this.insertIndex++;
			}, this);
		}, this);
	},
	onPacket: function (robot, type, packet) {
		this.incPacketCounter();
		var panel = this.panels[robot.get('ipAddress')];
		var count = panel.getData().count;

		NU.util.Display.updateDelayed(this.lookupReference('packetCount'), {
			count: this.getPacketCounter()
		}, this.getUpdateRate());

		NU.util.Display.updateDelayed(panel, {
			name: robot.get('name'),
			count: count + 1
		}, this.getUpdateRate());
	},
	incPacketCounter: function () {
		this.packetCounter++;
	}
});
