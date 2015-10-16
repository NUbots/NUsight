var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function OverviewSimulator () {
	RobotSimulator.call(this);
	this.loadProto('messages.support.nubugger.proto.Overview');
}
util.inherits(OverviewSimulator, RobotSimulator);

OverviewSimulator.prototype.run = function () {
	var now = Date.now();
	var robotPosition = this.randomFieldPosition();
	var robotHeading = this.randUnitVector();
	var ballPosition = this.randomFieldPosition();
	var ballWorldPosition = this.randomFieldPosition();

	var message = new this.API.messages.support.nubugger.proto.Overview({
		roleName: 'Overview Simulator',
		voltage: this.randFloat(10, 13),
		battery: Math.random(),
		behaviourState: this.API.messages.behaviour.proto.Behaviour.State.INIT,
		robotPosition: robotPosition,
		robotPositionCovariance: {x: {x: Math.random(), y: Math.random()}, y: {x: Math.random(), y: Math.random()}},
		robotHeading: robotHeading,
		ballPosition: ballPosition,
		ballWorldPosition: ballWorldPosition,
		gameMode: this.API.messages.input.proto.GameState.Data.Mode.NORMAL,
		gamePhase: this.API.messages.input.proto.GameState.Data.Phase.INITIAL,
		penaltyReason: this.API.messages.input.proto.GameState.Data.PenaltyReason.UNPENALISED,
		lastCameraImage: now - 5000 * Math.random(),
		lastSeenBall: now - 5000 * Math.random(),
		lastSeenGoal: now - 15000 * Math.random(),
		pathPlan: [robotPosition, this.randomFieldPosition(), this.randomFieldPosition(), this.randomFieldPosition(), ballWorldPosition],
		kickTarget: this.randomFieldPosition()
	});

	this.sendMessage(message);
};

if (require.main === module) {
	new OverviewSimulator().runEvery(1000);
}
