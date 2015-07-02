/**
 * @author Monica Olejniczak
 */
Ext.define('NU.view.dashboard.panel.DashboardPanelViewModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.DashboardPanel',
	requires: [
		'NU.util.TypeMap'
	],
	data: {
		name: null,
		battery: null,
		// Localisation
		robotPosition: null,
		robotPositionCovariance: null,
		robotHeading: null,
		ballPosition: null,
		// Behaviour
		behaviourState: null,
		// Game controller
		gameMode: null,
		gamePhase: null,
		penaltyReason: null,
		// Hardware
		lastCameraImage: null,
		// Vision
		lastSeenBall: null,
		lastSeenGoal: null,
		// Timestamp
		timestamp: null,
		currentTime: null
	},
	getUninitialised: function () {
		return 'NO DATA';
	},
	getFontColor: function (color) {
		var colors = this.getView().getColors();
		return color === colors.NEUTRAL ? 'black' : 'white';
	},
	/**
	 * Retrieves the colour assicated with a value between 0 and 1.
	 *
	 * @param value The value being mapped to a color between 0 and 1.
	 * @param [okay] Whether to display the okay colour. Defaults to false.
	 * @returns {string}
	 */
	getColor: function (value, okay) {
		var colors = this.getView().getColors();
		// Check if the value is a boolean.
		if (typeof value === 'boolean') {
			return value ? (okay === true ? colors.OKAY : colors.NEUTRAL) : colors.DANGER;
		}
		// Returns the colour based on the value.
		return value < 0.5 ? (okay === true ? colors.OKAY : colors.NEUTRAL) : value > 0.9 ? colors.DANGER : colors.WARNING;
	},
	// see http://easings.net/ and http://gizma.com/easing/
	easeOutCirc: function (value) {
		return Math.sqrt(1 - (value - 1) * (value - 1));
	},
	easeOutSine: function (value) {
		return Math.sin(Math.PI * value / 2);
	},
	easeOutCubic: function (value) {
		return Math.pow(value - 1, 3) + 1;
	},
	/**
	 * Converts a value with a specified range to a new range between 0 and 1.
	 *
	 * @param min The min bound of the current value.
	 * @param max The max bound of the current value.
	 * @param value The value being converted.
	 * @returns {*}
	 */
	normalize: function (min, max, value) {
		return ((value - min) / (max - min)) + min;
	},
	formulas: {
		batteryPercentage: function (get) {
			return (get('battery') * 100).toFixed(2);
		},
		batteryColor: function (get) {
			return this.getColor(1 - get('battery'));
		},
		elapsedBackground: function (get) {
			var timestamp = get('timestamp');
			if (timestamp === null) {
				return this.getColor(1);
			}
			var elapsed = ((get('currentTime') - timestamp.getTime()) / 1000);
			return this.getColor(this.easeOutCubic(this.normalize(0, 10, elapsed)), true);
		},
		position: function (get) {
			var position = get('robotPosition') || {x: 0, y: 0};
			return {
				x: position.x.toFixed(2),
				y: position.y.toFixed(2)
			};
		},
		positionBackground: function (get) {
			var position = get('position');
			var width = Field.constants.FIELD_WIDTH;
			var length = Field.constants.FIELD_LENGTH;
			return this.getColor(Math.abs(position.x) <= length * 0.5 && Math.abs(position.y) <= width * 0.5);
		},
		positionColor: function (get) {
			return this.getFontColor(get('positionBackground'));
		},
		covariance: function (get) {
			var covariance = get('robotPositionCovariance') || {x: {x: 0, y: 0}, y: {x: 0, y: 0}};
			return {xx: covariance.x.x.toFixed(4), xy: covariance.x.y.toFixed(4), yy: covariance.y.y.toFixed(4)};
		},
		heading: function (get) {
			var heading = get('robotHeading') || {};
			return (Math.atan2(heading.y, heading.x) * 180 / Math.PI).toFixed(2);
		},
		ball: function (get) {
			var position = get('ballPosition') || {x: 0, y: 0};
			return {
				x: position.x.toFixed(2),
				y: position.y.toFixed(2)
			};
		},
		state: function (get) {
			return NU.TypeMap.get(API.Behaviour.State)[get('behaviourState')] || this.getUninitialised();
		},
		mode: function (get) {
			return NU.TypeMap.get(API.GameState.Data.Mode)[get('gameMode')] || this.getUninitialised();
		},
		phase: function (get) {
			return NU.TypeMap.get(API.GameState.Data.Phase)[get('gamePhase')] || this.getUninitialised();
		},
		penalty: function (get) {
			return NU.TypeMap.get(API.GameState.Data.PenaltyReason)[get('penaltyReason')] || this.getUninitialised();
		},
		penaltyBackground: function (get) {
			return this.getColor(get('penaltyReason') === API.GameState.Data.PenaltyReason.UNPENALISED);
		},
		penaltyColor: function (get) {
			return this.getFontColor(get('penaltyBackground'));
		},
		cameraImage: function (get) {
			var lastCameraImage = get('lastCameraImage');
			return lastCameraImage ? ((Date.now() - lastCameraImage.toNumber()) / 1000).toFixed(2) : 'Not seen';
		},
		lastCameraBackground: function (get) {
			if (get('lastCameraImage') === null) {
				return this.getColor(1);
			}
			return this.getColor(this.normalize(0, 3, get('cameraImage')));
		},
		lastCameraColor: function (get) {
			return this.getFontColor(get('lastCameraBackground'));
		},
		lastBall: function (get) {
			var lastSeenBall = get('lastSeenBall');
			return lastSeenBall ? ((Date.now() - lastSeenBall.toNumber()) / 1000).toFixed(2) : 'Not seen';
		},
		lastBallBackground: function (get) {
			if (get('lastSeenBall') === null) {
				return this.getColor(1);
			}
			return this.getColor(this.normalize(0, 5, get('lastBall')));
		},
		lastBallColor: function (get) {
			return this.getFontColor(get('lastBallBackground'));
		},
		lastGoal: function (get) {
			var lastSeenGoal = get('lastSeenGoal');
			return lastSeenGoal ? ((Date.now() - lastSeenGoal.toNumber()) / 1000).toFixed(2) : 'Not seen';
		},
		lastGoalBackground: function (get) {
			if (get('lastSeenGoal') === null) {
				return this.getColor(1);
			}
			return this.getColor(this.normalize(0, 5, get('lastGoal')));
		},
		lastGoalColor: function (get) {
			return this.getFontColor(get('lastGoalBackground'));
		}
	}
});
