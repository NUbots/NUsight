/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.window.DashboardController', {
	extend: 'NU.view.window.DisplayController',
	alias: 'controller.Dashboard',
	requires: [
		'NU.util.TypeMap'
	],
	init: function () {
		NU.Network.on('overview', this.onOverview, this);
	},

	/**
	 * Retrieves the robot record from the grid store based of its IP address.
	 *
	 * @param robotIP The IP address of the robot.
	 * @returns {*}
	 */
	getRobot: function (robotIP) {
		// Get the robot from the object.
		var robot = this.robots[robotIP];
		// Check if the robot does not exist.
		if (!robot) {
			// Initialise the record with the robotIP.
			var record = {
				robotName: robotIP
			};
			// Iterate through every message.
			for (var i = 0, len = this.messages.length; i < len; i++) {
				// Add the message to the record and initialise the value to 0.
				record[this.messages[i]] = 0;
			}
			// Add a mapping from the robot IP to the record so it can be updated later.
			robot = this.robots[robotIP] = this.store.add(record)[0];
		}
		return robot;
	},

	onOverview: function (robotIP, overview, timestamp) {
		// Get the robot from the robotIP and update the voltage and battery data.
		var robot = this.getRobot(robotIP);
		// Set the data obtained from the overview to update the view model for the selected robot.
		robot.set('voltage', overview.getVoltage());
		robot.set('battery', overview.getBattery() * 100);
		robot.set('behaviourState', NU.TypeMap.get(API.Behaviour.State)[overview.getBehaviourState()]);
		robot.set('robotPosition', this.parseVec2(overview.getRobotPosition()));
		robot.set('robotHeading', this.parseAngle(overview.getRobotHeading()));
	},

	parseVec2: function (vector) {
		return Ext.String.format('({0}, {1})', vector.x, vector.y);
	},

	parseAngle: function (vector) {
		return (Math.atan2(vector.y, vector.x) * 180 / Math.PI).toFixed(2);
	}

});
