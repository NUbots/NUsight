var util = require('util');
var RobotSimulator = require('./RobotSimulator');
var SensorDataSimulator = require('./SensorDataSimulator');
var THREE = require('three');
var TAU = 2 * Math.PI;

function LocalisationSimulator (opts) {
	RobotSimulator.call(this, opts);
	this.started = Date.now();

	this.loadProto('message.input.Sensors');
	this.loadProto('message.mat44');
	this.loadProto('message.localisation.Self');


	this.sensors_message = new this.API.message.input.Sensors({
		timestamp: {seconds: (Date.now() / 1000).toFixed(0)},
		voltage: 12,
		battery: Math.random(),
		servo: this.createServos()
	});
}
util.inherits(LocalisationSimulator, RobotSimulator);

LocalisationSimulator.prototype.matrixToProto = function (matrix) {
	var el = matrix.elements;
	return new this.API.mat44({
		x: {x: el[0],  y: el[1],  z: el[2],  t: el[3]},
		y: {x: el[4],  y: el[5],  z: el[6],  t: el[7]},
		z: {x: el[8],  y: el[9],  z: el[10], t: el[11]},
		t: {x: el[12], y: el[13], z: el[14], t: el[15]},
	});
};

LocalisationSimulator.prototype.createServos = function () {
	var servos = [];
	for (var id = 0; id < 20; id++) {
		servos.push(this.createServo(id));
	}
	return servos;
};

LocalisationSimulator.prototype.createServo = function (id) {
	return {
		errorFlags: 0,
		id: id
	}
};
LocalisationSimulator.prototype.run = function () {
	var now = Date.now();
	var elapsedTime = now - this.started;
	var radius = 1;
	var message = new this.API.message.localisation.Self({
		locObject: {
			position: {x:0,y:0}
			// last_measurement_time : now
		},
		heading : {x:1,y:0},
		velocity : {x:0,y:0},
		covariance : {x:{x:1,y:0,z:0},y:{x:0,y:1,z:0},z:{x:0,y:0,z:1}}
	});
	var world_rot = new THREE.Matrix4()
	var world_trans = new THREE.Matrix4()
	world_rot.makeRotationZ(1.7);
	world_trans.makeTranslation(1,1,-0.2);
	this.sensors_message.world = this.matrixToProto(world_trans.multiply(world_rot));

	this.sendMessage(message);
	this.sendMessage(this.sensors_message);
};

if (require.main === module) {
	new LocalisationSimulator().runEvery(100);
}

module.exports = LocalisationSimulator;
