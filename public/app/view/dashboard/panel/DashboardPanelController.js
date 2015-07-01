/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.dashboard.panel.DashboardPanelController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.DashboardPanel',
	init: function () {
		var view = this.getView();
		// Get the colours from the view and set them if they do not exist.
		var colors = view.getColors();
		if (!colors) {
			view.setColors({
				OKAY: 'green',
				NEUTRAL: 'white',
				WARNING: 'orange',
				DANGER: 'red'
			});
		}
		// Set the name of the robot on the view model.
		this.getViewModel().set('name', view.getName());
		// Begin the animation loop.
		this.requestId = requestAnimationFrame(this.update.bind(this));
	},

	/**
	 * An event triggered when the user closes the dashboard display. This method cancels the animation frame loop.
	 */
	onDestroy: function () {
		cancelAnimationFrame(this.requestId);
	},

	/**
	 * An event triggered when the data for this view is updated.
	 *
	 * @param data The Overview protocol buffer data.
	 * @param timestamp The time that the message was sent.
	 */
	onUpdate: function (data, timestamp) {
		var viewModel = this.getViewModel();
		// Set the data obtained from the event to update the view model for the robot.
		viewModel.set('battery', data.getBattery());
		viewModel.set('robotPosition', data.getRobotPosition());
		viewModel.set('robotPositionCovariance', data.getRobotPositionCovariance());
		viewModel.set('robotHeading', data.getRobotHeading());
		viewModel.set('ballPosition', data.getBallPosition());
		viewModel.set('behaviourState', data.getBehaviourState());
		viewModel.set('gameMode', data.getGameMode());
		viewModel.set('gamePhase', data.getGamePhase());
		viewModel.set('penaltyReason', data.getPenaltyReason());
		viewModel.set('lastCameraImage', data.getLastCameraImage());
		viewModel.set('lastSeenBall', data.getLastSeenBall());
		viewModel.set('lastSeenGoal', data.getLastSeenGoal());
		viewModel.set('timestamp', timestamp);
	},

	update: function () {
		this.requestId = requestAnimationFrame(this.update.bind(this));
		this.getViewModel().set('currentTime', Date.now());
	}

});
