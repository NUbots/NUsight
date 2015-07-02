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
				WARNING: '#ffd147',
				DANGER: 'red'
			});
		}
		// Set the name of the robot on the view model.
		this.getViewModel().set('name', view.getName());
		// Store the field view.
		this.field = view.lookupReference('field');
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
		// Update the battery value in the view model.
		viewModel.set('battery', data.getBattery());
		// Get the robot localisation details, then update the view model and field view.
		var robotPosition = data.getRobotPosition();
		var robotPositionCovariance = data.getRobotPositionCovariance();
		var robotHeading = data.getRobotHeading();
		var ballPosition = data.getBallPosition();
		viewModel.set('robotPosition', robotPosition);
		viewModel.set('robotPositionCovariance', robotPositionCovariance);
		viewModel.set('robotHeading', robotHeading);
		viewModel.set('ballPosition', ballPosition);
		this.field.fireEvent('update', robotPosition, robotPositionCovariance, robotHeading, ballPosition);
		// Update the game controller details in the view model.
		viewModel.set('behaviourState', data.getBehaviourState());
		viewModel.set('gameMode', data.getGameMode());
		viewModel.set('gamePhase', data.getGamePhase());
		viewModel.set('penaltyReason', data.getPenaltyReason());
		// Update the hardware and vision details in the view model.
		viewModel.set('lastCameraImage', data.getLastCameraImage());
		viewModel.set('lastSeenBall', data.getLastSeenBall());
		viewModel.set('lastSeenGoal', data.getLastSeenGoal());
		// Update the timestamp value in the view model.
		viewModel.set('timestamp', timestamp);
	},

	update: function () {
		this.requestId = requestAnimationFrame(this.update.bind(this));
		this.getViewModel().set('currentTime', Date.now());
	}

});
