/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.dashboard.panel.DashboardPanelController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.DashboardPanel',

	init: function () {
		var view = this.getView();
		var viewModel = this.getViewModel();
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
		// Set the name of the robot and the localisation default value on the view model.
		viewModel.set('robot', view.getRobot());
		viewModel.set('localisation', true);
		// Store the field view so items can be rendered.
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
		viewModel.set('roleName', data.getRoleName());
		// Update the battery value in the view model.
		viewModel.set('battery', data.getBattery());
		// Get the robot localisation details, then update the view model and field view.
		var robotPosition = data.getRobotPosition();
		var robotPositionCovariance = data.getRobotPositionCovariance();
		var robotHeading = data.getRobotHeading();
		var ballWorldPosition = data.getBallWorldPosition();
		viewModel.set('robotPosition', robotPosition);
		viewModel.set('robotPositionCovariance', robotPositionCovariance);
		viewModel.set('robotHeading', robotHeading);
		viewModel.set('ballPosition', data.getBallPosition());
		viewModel.set('ballWorldPosition', ballWorldPosition);
		viewModel.set('kickTarget', data.getKickTarget());
		// Update the game controller details in the view model.
		viewModel.set('behaviourState', data.getBehaviourState());
		viewModel.set('gameMode', data.getGameMode());
		viewModel.set('gamePhase', data.getGamePhase());
		viewModel.set('penaltyReason', data.getPenaltyReason());
		// Update the walk engine details in the view model.
		viewModel.set('walkCommand', data.getWalkCommand());
		// Update the hardware and vision details in the view model.
		viewModel.set('lastCameraImage', data.getLastCameraImage());
		viewModel.set('lastSeenBall', data.getLastSeenBall());
		viewModel.set('lastSeenGoal', data.getLastSeenGoal());
		// Update the timestamp value in the view model.
		viewModel.set('timestamp', timestamp);

		this.field.fireEvent('update', robotPosition, robotPositionCovariance, robotHeading, ballWorldPosition, data.getPathPlan(), data.getKickTarget());
	},

	/**
	 * Updates the current time in the view model so the packet icon can be updated via its dependency.
	 */
	update: function () {
		this.requestId = requestAnimationFrame(this.update.bind(this));
		this.getViewModel().set('currentTime', Date.now());
	},

	/**
	 * An event triggered when the user chooses to toggles which localisation display is visible.
	 */
	onToggleLocalisation: function () {
		var viewModel = this.getViewModel();
		// Toggle the localisation attribute on the view model.
		viewModel.set('localisation', !viewModel.get('localisation'));
	},

	onRecord: function (recording) {
		var viewModel = this.getViewModel();
		var isRecording = viewModel.get('robot.recording');
		debugger;
		if (recording !== isRecording) {
			viewModel.set('robot.recording', recording);
		}
	}

});
