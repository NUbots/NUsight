/**
 * @author Monica Olejniczak
 */
Ext.define('NU.view.dashboard.panel.DashboardPanelViewModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.Robot',
	requires: [
		'NU.util.TypeMap'
	],
	data: {
		name: '',
		battery: 0,
		// Localisation
		robotPosition: null,
		robotPositionCovariance: 0,
		robotHeading: 0,
		// Behaviour
		behaviourState: null,
		// Game controller
		gameMode: null,
		gamePhase: null,
		penaltyReason: null,
		// Hardware
		lastCameraImage: 0,
		// Vision
		lastSeenBall: 0,
		lastSeenBallElapsed: 0,
		currentTime: null
	},
	formulas: {
		batteryPercentage: function (get) {
			return get('battery') * 100;
		},
		position: function (get) {
			var robotPosition = get('robotPosition') || {x: 0, y: 0};
			return {
				x: robotPosition.x.toFixed(2),
				y: robotPosition.y.toFixed(2)
			};
		},
		covariance: function (get) {
			var robotPositionCovariance = get('robotPositionCovariance');
			return robotPositionCovariance;
		},
		heading: function (get) {
			var robotHeading = get('robotHeading') || {};
			return (Math.atan2(robotHeading.y, robotHeading.x) * 180 / Math.PI).toFixed(2);
		},
		state: function (get) {
			return NU.TypeMap.get(API.Behaviour.State)[get('behaviourState')];
		},
		mode: function (get) {
			return NU.TypeMap.get(API.GameState.Data.Mode)[get('gameMode')];
		},
		phase: function (get) {
			return NU.TypeMap.get(API.GameState.Data.Phase)[get('gamePhase')];
		},
		penalty: function (get) {
			return NU.TypeMap.get(API.GameState.Data.PenaltyReason)[get('penaltyReason')];
		},
		cameraImage: function (get) {
			var lastCameraImage = get('lastCameraImage');
			return lastCameraImage ? new Date(lastCameraImage.getUtcTimestamp().toNumber()) : 'Not seen';
		},
		lastSeenBallElapsed: function (get) {
			var currentTime = get('currentTime');
			var lastSeenBall = get('lastSeenBall') || 0;
			if (lastSeenBall !== 0) {
				lastSeenBall = lastSeenBall.toNumber();
			}
			return ((currentTime - lastSeenBall) / 1000).toFixed(2);
		},
		lastBall: function (get) {
			var lastSeenBall = get('lastSeenBall');
			var elapsedTime = get('lastSeenBallElapsed');
			return lastSeenBall ? elapsedTime: 'Not seen';
		},
		lastSeenGoalElapsed: function (get) {
			var currentTime = get('currentTime');
			var lastSeenGoal = get('lastSeenGoal') || 0;
			if (lastSeenGoal !== 0) {
				lastSeenGoal = lastSeenGoal.toNumber();
			}
			return ((currentTime - lastSeenGoal) / 1000).toFixed(2);
		},
		lastGoal: function (get) {
			var lastSeenGoal = get('lastSeenGoal');
			var elapsedTime = get('lastSeenGoalElapsed');
			return lastSeenGoal ? elapsedTime : 'Not seen';
		}
	}
});