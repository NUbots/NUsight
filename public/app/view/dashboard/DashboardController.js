/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.dashboard.DashboardController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.Dashboard',
	requires: [
		'NU.view.dashboard.panel.DashboardPanel'
	],
	init: function () {
		this.robots = {};
		NU.Network.on('overview', this.onOverview, this);
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
			robot = this.robots[robotIP] = this.getView().add(Ext.widget('nu_dashboard_panel', {
				name: robotIP
			}));
		}
		return robot;
	},

	/**
	 * An event triggered when the Network class receives an Overview protocol buffer.
	 *
	 * @param robotIP The IP address of the robot.
	 * @param overview The protocol buffer data.
	 * @param timestamp The time the data was received.
	 */
	onOverview: function (robotIP, overview, timestamp) {
		// Get the robot from the robotIP and fire an event to update its data.
		this.getRobot(robotIP).fireEvent('update', overview, timestamp);
	}

});
