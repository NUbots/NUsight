/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.window.dashboard.robot.RobotController', {
	extend: 'NU.view.window.DisplayController',
	alias: 'controller.Robot',
	requires: [
		'NU.util.TypeMap'
	],
	init: function () {
		this.getViewModel().set('name', this.getView().getName());
	},

	onUpdate: function (data, timestamp) {
		var viewModel = this.getViewModel();
		// Set the data obtained from the event to update the view model for the robot.
		viewModel.set('voltage', data.getVoltage());
		viewModel.set('battery', data.getBattery() * 100);
		viewModel.set('behaviourState', NU.TypeMap.get(API.Behaviour.State)[data.getBehaviourState()]);
		viewModel.set('robotPosition', this.parseVec2(data.getRobotPosition()));
		viewModel.set('robotHeading', this.parseAngle(data.getRobotHeading()));
	},

	parseVec2: function (vector) {
		vector = vector || {};
		return Ext.String.format('({0}, {1})', vector.x, vector.y);
	},

	parseAngle: function (vector) {
		vector = vector || {};
		return (Math.atan2(vector.y, vector.x) * 180 / Math.PI).toFixed(2);
	}

});
