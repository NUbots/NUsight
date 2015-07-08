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
		NU.Network.on({
			addRobot: this.onAddRobot,
			removeRobot: this.onRemoveRobot,
			packet: this.onPacket,
			scope: this
		});
		// Iterate through each robot and create the panel for it.
		NU.Network.getRobotStore().each(function (robot) {
			this.createPanel(robot);
		}, this);
	},

	/**
	 * Creates the panel associated with a robot.
	 *
	 * @param robot The robot record from the robot store.
	 */
	createPanel: function (robot) {
		var view = this.getView();
		var name = robot.get('name') || 'Unknown';
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
	},

	/**
	 * An event triggered when the Network class receives a new robot. This method creates the panel associated with
	 * the robot that was added to the network.
	 *
	 * @param robot The robot record from the robot store.
	 */
	onAddRobot: function (robot) {
		this.createPanel(robot);
	},

	/**
	 * An event triggered when the Network class deletes a robot. This method removes the panel associated with the
	 * robot that was removed from the network.
	 *
	 * @param robot The robot record from the robot store.
	 */
	onRemoveRobot: function (robot) {
		var key = robot.get('ipAddress');
		var panel = this.panels[key];
		this.getView().remove(panel);
		delete this.panels[key];
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
