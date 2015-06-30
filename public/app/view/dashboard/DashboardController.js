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
		this.dashboardPanels = {};
		// Listen to the network events.
		NU.Network.on({
			robotIP: this.onRobotIP,
			overview: this.onOverview,
			scope: this
		});
		// Iterate through each robot and create the dashboard panel for it.
		NU.Network.getRobotIPs().forEach(function (robotIP) {
			this.createDashboardPanel(robotIP, robotIP);
		}, this);
	},

	/**
	 * Creates the dashboard panel for a certain robot IP address.
	 *
	 * @param robotIP The IP address of the robot.
	 * @param robotName The name of the robot.
	 */
	createDashboardPanel: function (robotIP, robotName) {
		// Add a mapping from the robot IP to the view so it can be updated later.
		this.dashboardPanels[robotIP] = this.getView().add(Ext.widget('nu_dashboard_panel', {
			name: robotName
		}));
	},

	/**
	 * An event triggered when the Network class receives a new robot. This method creates the dashboard panel
	 * associated with the robot that was added to the network.
	 *
	 * @param robotIP The IP address of the robot.
	 * @param robotName The name of the robot.
	 */
	onRobotIP: function (robotIP, robotName) {
		this.createDashboardPanel(robotIP, robotName);
	},

	/**
	 * An event triggered when the Network class receives an Overview protocol buffer. This method fires the update
	 * event on the dashboard panel view associated with the IP address of a robot.
	 *
	 * @param robotIP The IP address of the robot.
	 * @param overview The protocol buffer data.
	 * @param timestamp The time the data was received.
	 */
	onOverview: function (robotIP, overview, timestamp) {
		this.dashboardPanels[robotIP].fireEvent('update', overview, timestamp);
	}

});
