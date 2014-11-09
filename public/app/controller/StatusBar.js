Ext.define('NU.controller.StatusBar', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.StatusBar',
	requires: [
		'NU.util.Display'
	],
	//inject:  'robotsStore',
	config: {
		packetCounter: 0,
		robotsStore: null,
		insertIndex: 0,
		updateRate: 600
	},
	robotMap: null,
	/*control: {
		'packetCount': true
	},*/
	init: function () {
		this.robotMap = {};
		var view = this.getView();
		//view.mon(NU.util.Network, 'packet', this.onPacket, this);
		//this.addRobots();
	},
	addRobots: function () {
		var view = this.getView();
		var store = this.getRobotsStore();
		store.on('add', function (store, robots) {
			Ext.each(robots, function(robot) {
				var name = robot.get('name');
				var robotIP = robot.get('ipAddress');
				var panel = view.insert(this.getInsertIndex(), {
					xtype: 'panel',
					tpl: '{name}: {count}',
					data: {
						name: name,
						count: 0
					}
				});
				this.robotMap[robotIP] = {
					counter: 0,
					name: name,
					panel: panel
				};
				this.insertIndex++;
			}, this);
		}, this);
	},
	onPacket: function (robotIP, packet) {
		this.incPacketCounter();
		var robot = this.robotMap[robotIP];
		robot.counter++;

		NU.util.Display.updateDelayed(this.getPacketCount(), {
			count: this.getPacketCounter()
		}, this.getUpdateRate());

		NU.util.Display.updateDelayed(robot.panel, {
			name: robot.name,
			count: robot.counter
		}, this.getUpdateRate());
	},
	incPacketCounter: function () {
		this.packetCounter++;
	}
});
