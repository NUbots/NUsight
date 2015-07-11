var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function OverviewSimulator () {
	RobotSimulator.call(this);
}
util.inherits(OverviewSimulator, RobotSimulator);

OverviewSimulator.prototype.run = function () {
	var now = Date.now();
	var robotPosition = this.randomFieldPosition();
	var robotHeading = this.randUnitVector();
	var ballPosition = this.randomFieldPosition();
	var ballWorldPosition = this.randomFieldPosition();

	var message = new this.API.Message({
		type: this.API.Message.Type.OVERVIEW,
		filter_id: 0,
		utc_timestamp: Date.now(),
		overview: {
			role_name: 'Overview Simulator',
			voltage: this.randFloat(10, 13),
			battery: Math.random(),
			behaviour_state: this.API.Behaviour.State.INIT,
			robot_position: robotPosition,
			robot_position_covariance: {x: {x: Math.random(), y: Math.random()}, y: {x: Math.random(), y: Math.random()}},
			robot_heading: robotHeading,
			ball_position: ballPosition,
			ball_world_position: ballWorldPosition,
			game_mode: this.API.GameState.Data.Mode.NORMAL,
			game_phase: this.API.GameState.Data.Phase.INITIAL,
			penalty_reason: this.API.GameState.Data.PenaltyReason.UNPENALISED,
			last_camera_image: now - 5000 * Math.random(),
			last_seen_ball: now - 5000 * Math.random(),
			last_seen_goal: now - 15000 * Math.random(),
			path_plan: [robotPosition, this.randomFieldPosition(), this.randomFieldPosition(), this.randomFieldPosition(), ballWorldPosition],
			kick_target: this.randomFieldPosition()
		}
	});

	this.sendMessage(message);
};

if (require.main === module) {
	new OverviewSimulator().runEvery(1000);
}
