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
		robot: null,
		roleName: null,
		localisation: null,
		battery: null,
		// Localisation
		robotPosition: null,
		robotPositionCovariance: null,
		robotHeading: null,
		ballPosition: null,
		ballWorldPosition: null,
		// Behaviour
		behaviourState: null,
		kickTarget: null,
		// Game controller
		gameMode: null,
		gamePhase: null,
		penaltyReason: null,
		// Hardware
		lastCameraImage: null,
		// Vision
		lastSeenBall: null,
		lastSeenGoal: null,
		// Walk engine
		walkCommand: null,
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

	roundObject: function (object, precision) {
		Ext.Object.each(object, function (key, value) {
			if (typeof value === 'object') {
				return this.roundObject(value, precision);
			}
			object[key] = value ? value.toFixed(precision) : 'N/A';
		}, this);
		return object;
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
		name: function (get) {
			return get('robot.name') || 'Unknown';
		},
		role: function (get) {
			return get('roleName') || 'Unknown';
		},
		disabled: function (get) {
			return !get('robot.enabled');
		},
		mask: function (get) {
			var elapsed = get('elapsedBackground');
			return elapsed === this.getView().getColors().DANGER;
		},
		maskBackground: function (get) {
			return get('mask') ? 'white' : '';
		},
		maskOpacity: function (get) {
			return get('mask') ? 0.25 : 1;
		},
		batteryPercentage: function (get) {
			return (get('battery') * 100).toFixed(2);
		},
		batteryColor: function (get) {
			var cls = 'danger';
			var view = this.getView();
			var color = this.getColor(1 - get('battery'));
			if (color === view.getColors().DANGER) {
				if (!get('mask')) {
					view.addCls(cls);
					color = view.getColors().WARNING;
				}
			} else {
				view.removeCls(cls);
			}
			return color;
		},
		elapsed: function (get) {
			var timestamp = get('timestamp');
			return timestamp ? ((get('currentTime') - timestamp.getTime()) / 1000) : null;
		},
		elapsedBackground: function (get) {
			var elapsed = get('elapsed');
			return elapsed ? this.getColor(this.easeOutCubic(this.normalize(0, 10, elapsed)), true) : this.getColor(1);
		},
		position: function (get) {
			var position = this.roundObject(get('robotPosition')) || {x: 'N/A', y: 'N/A'};
			return {
				x: position.x,
				y: position.y
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
			var covariance = this.roundObject(get('robotPositionCovariance'), 4) || {x: {x: 'N/A', y: 'N/A'}, y: {x: 'N/A', y: 'N/A'}};
			return {xx: covariance.x.x, xy: covariance.x.y, yy: covariance.y.y};
		},
		heading: function (get) {
			var heading = get('robotHeading') || {};
			return (Math.atan2(heading.y, heading.x) * 180 / Math.PI).toFixed(2);
		},
		ball: function (get) {
			var position = this.roundObject(get('ballPosition'), 2) || {x: 'N/A', y: 'N/A'};
			return {
				x: position.x,
				y: position.y
			};
		},
		state: function (get) {
			return NU.TypeMap.get(API.message.behaviour.Behaviour.State)[get('behaviourState')] || this.getUninitialised();
		},
		mode: function (get) {
			return NU.TypeMap.get(API.message.input.GameState.Data.Mode)[get('gameMode')] || this.getUninitialised();
		},
		phase: function (get) {
			return NU.TypeMap.get(API.message.input.GameState.Data.Phase)[get('gamePhase')] || this.getUninitialised();
		},
		walk: function (get) {
			var walkCommand = this.roundObject(get('walkCommand'), 2) || {x: 'N/A', y: 'N/A', z: 'N/A'};
			return {
				x: walkCommand.x,
				y: walkCommand.y,
				z: walkCommand.z
			};
		},
		penalty: function (get) {
			return NU.TypeMap.get(API.message.input.GameState.Data.PenaltyReason)[get('penaltyReason')] || this.getUninitialised();
		},
		penaltyBackground: function (get) {
			var penaltyReason = get('penaltyReason');
			if (penaltyReason === null && get('elapsed') === null) {
				return this.getColor(0);
			}
			return this.getColor(penaltyReason === API.message.input.GameState.Data.PenaltyReason.UNPENALISED);
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
				var color = get('elapsed') ? 1 : 0;
				return this.getColor(color);
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
				var color = get('elapsed') ? 1 : 0;
				return this.getColor(color);
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
				var color = get('elapsed') ? 1 : 0;
				return this.getColor(color);
			}
			return this.getColor(this.normalize(0, 5, get('lastGoal')));
		},
		lastGoalColor: function (get) {
			return this.getFontColor(get('lastGoalBackground'));
		}
	}
});
