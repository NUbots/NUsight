var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function OverviewSimulator () {
	RobotSimulator.call(this);
	this.loadProto('message.support.nubugger.Overview');
}
util.inherits(OverviewSimulator, RobotSimulator);

OverviewSimulator.prototype.run = function () {
	var now = (Date.now() / 1000).toFixed(0);
	var robotPosition = this.randomFieldPosition();
	var robotHeading = this.randUnitVector();
	var ballPosition = this.randomFieldPosition();
	var ballWorldPosition = this.randomFieldPosition();

	var message = new this.API.message.support.nubugger.Overview({
		roleName: 'Overview Simulator',
		voltage: this.randFloat(10, 13),
		battery: Math.random(),
		behaviourState: this.API.message.behaviour.Behaviour.State.INIT,
		robotPosition: robotPosition,
		robotPositionCovariance: {x: {x: Math.random(), y: Math.random()}, y: {x: Math.random(), y: Math.random()}},
		robotHeading: robotHeading,
		ballPosition: ballPosition,
		ballWorldPosition: ballWorldPosition,
		gameMode: this.API.message.input.GameState.Data.Mode.NORMAL,
		gamePhase: this.API.message.input.GameState.Data.Phase.INITIAL,
		penaltyReason: this.API.message.input.GameState.Data.PenaltyReason.UNPENALISED,
		lastCameraImage: {seconds: now - 5 * Math.random()},
		lastSeenBall: {seconds: now - 5 * Math.random()},
		lastSeenGoal: {seconds: now - 15 * Math.random()},
		pathPlan: [robotPosition, this.randomFieldPosition(), this.randomFieldPosition(), this.randomFieldPosition(), ballWorldPosition],
		kickTarget: this.randomFieldPosition()
	});

	this.sendMessage(message);
};

if (require.main === module) {
	new OverviewSimulator().runEvery(1000);
}
