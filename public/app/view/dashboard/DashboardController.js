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
		this.getViewModel().set('recording', false);
		this.addEvents();
		// Iterate through each robot and create the dashboard panel for it.
		NU.Network.getRobotStore().each(function (robot) {
			this.createDashboardPanel(robot);
		}, this);
	},

	addEvents: function () {
		this.mon(NU.Network, {
			addRobot: this.onAddRobot,
			removeRobot: this.onRemoveRobot,
			'message.support.nubugger.proto.Overview': this.onOverview,
			scope: this
		});
	},

	onMaximize: function (view) {
		// hack because ExtJS seems not to do this correctly! >_<
		var newBox = view.constrainTo.getViewSize(false);
		newBox.x = 0;
		newBox.y = 0;
		view.setBox(newBox)
	},

	/**
	 * An event triggered when the user presses the record all button.
	 */
	onRecord: function () {
		var viewModel = this.getViewModel();
		var recording = !viewModel.get('recording');
		viewModel.set('recording', recording);
		NU.Network.recordRobots(recording);
	},

	/**
	 * Creates the dashboard panel for a certain robot.
	 *
	 * @param robot The robot record from the robot store.
	 */
	createDashboardPanel: function (robot) {
		var robotId = robot.get('id');
		// Add a mapping from the robot name to the view so it can be updated later.
		this.dashboardPanels[robotId] = this.getView().add(Ext.widget('nu_dashboard_panel', {
			robot: robot
		}));
	},

	/**
	 * An event triggered when the Network class receives a new robot. This method creates the dashboard panel
	 * associated with the robot that was added to the network.
	 *
	 * @param robot The robot record from the robot store.
	 */
	onAddRobot: function (robot) {
		this.createDashboardPanel(robot);
	},

	/**
	 * An event triggered when the Network class deletes a robot. This method removes the dashboard panel associated
	 * with the robot that was removed from the network.
	 *
	 * @param robot The robot record from the robot store.
	 */
	onRemoveRobot: function (robot) {
		var key = robot.get('id');
		var dashboardPanel = this.dashboardPanels[key];
		this.getView().remove(dashboardPanel);
		delete this.dashboardPanels[key];
	},

	/**
	 * An event triggered when the Network class receives an Overview protocol buffer. This method fires the update
	 * event on the dashboard panel view associated with the IP address of a robot.
	 *
	 * @param robot The robot record.
	 * @param overview The protocol buffer data.
	 * @param timestamp The time the data was received.
	 */
	onOverview: function (robot, overview, timestamp) {
		this.dashboardPanels[robot.get('id')].fireEvent('update', overview, timestamp);
	},

	/**
	 * An event triggered when the user toggles the localisation views.
	 */
	onToggle: function () {
		Ext.Object.each(this.dashboardPanels, function (key, dashboardPanel) {
			dashboardPanel.fireEvent('toggleLocalisation');
		});
	}

});
