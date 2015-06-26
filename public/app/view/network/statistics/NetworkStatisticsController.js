/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.network.statistics.NetworkStatisticsController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.NetworkStatistics',
	requires: [
		'NU.view.network.statistics.grid.NetworkStatisticsGrid'
	],
	init: function () {
		this.view = this.getView();
		this.robots = {};
		NU.Network.on('packet', this.onPacket, this);
	},

	/**
	 * Retrieves the robot record from the grid store based of its IP address.
	 *
	 * @param robotIP The IP address of the robot.
	 * @returns {*}
	 */
	getRobot: function (robotIP) {
		// Get the robot from the object.
		var robot = this.robots[robotIP];
		// Check if the robot does not exist.
		if (!robot) {
			// Add a mapping from the robot IP to the view so it can be updated later.
			robot = this.robots[robotIP] = this.view.add(Ext.widget('nu_network_statistics_grid_panel', {
				robot: {
					name: robotIP
				}
			}));
		}
		return robot;
	},

	/**
	 * An event triggered when a packet is sent to the network.
	 *
	 * @param robotIP The IP address of the robot.
	 * @param type The type of the packet sent over the network.
	 * @param packet The packet information.
	 */
	onPacket: function (robotIP, type, packet) {
		// Obtain the robot and the key.
		var robot = this.getRobot(robotIP);
		var key = NU.Network.getTypeMap()[type];
		robot.fireEvent('update', key);
	}

});
