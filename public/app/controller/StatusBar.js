Ext.define('NU.controller.StatusBar', {
	extend: 'Deft.mvc.ViewController',
	inject:  'robotsStore',
	config: {
		packetCounter: 0,
		robotsStore: null,
		insertIndex: 0
	},
	lastUpdate: 0,
	robotMap: null,
	control: {
		'packetCount': true
	},
	init: function () {
		this.robotMap = {};
		NU.util.Network.on('packet', Ext.bind(this.onPacket, this));
		this.addRobots();
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
		var now = Date.now();
		if (now > this.lastUpdate + 50) {
			this.getPacketCount().update({
				count: this.getPacketCounter()
			});
			robot.panel.update({
				name: robot.name,
				count: robot.counter
			});
			this.lastUpdate = now;
		}
	},
	incPacketCounter: function () {
		this.packetCounter++;
	}
});
