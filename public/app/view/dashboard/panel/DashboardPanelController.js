/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.dashboard.panel.DashboardPanelController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.DashboardPanel',
	init: function () {
		this.getViewModel().set('name', this.getView().getName());
		requestAnimationFrame(this.updateView.bind(this));
	},

	onUpdate: function (data, timestamp) {
		var viewModel = this.getViewModel();
		// Set the data obtained from the event to update the view model for the robot.
		viewModel.set('battery', data.getBattery());
		viewModel.set('robotPosition', data.getRobotPosition());
		viewModel.set('robotPositionCovariance', data.getRobotPositionCovariance());
		viewModel.set('robotHeading', data.getRobotHeading());
		viewModel.set('behaviourState', data.getBehaviourState());
		viewModel.set('gameMode', data.getGameMode());
		viewModel.set('gamePhase', data.getGamePhase());
		viewModel.set('penaltyReason', data.getPenaltyReason());
		viewModel.set('lastCameraImage', data.getLastCameraImage());
		viewModel.set('lastSeenBall', data.getLastSeenBall());
		viewModel.set('lastSeenGoal', data.getLastSeenGoal());
	},

	updateView: function () {
		requestAnimationFrame(this.updateView.bind(this));
		this.getViewModel().set('currentTime', Date.now());
	}

});
