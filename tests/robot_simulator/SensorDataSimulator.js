var util = require('util');
var RobotSimulator = require('./RobotSimulator');
var THREE = require('three');
var TAU = 2 * Math.PI;

function SensorDataSimulator (opts) {
	RobotSimulator.call(this, opts);

	this.loadProto('message.input.proto.Sensors');
	this.loadProto('message.mat44');

	this.started = Date.now();
	this.matrix = new THREE.Matrix4();

	this.message = new this.API.message.input.proto.Sensors({
		timestamp: Date.now(),
		voltage: 12,
		battery: Math.random(),
		servo: this.createServos()
	});
}
util.inherits(SensorDataSimulator, RobotSimulator);

SensorDataSimulator.prototype.matrixToProto = function (matrix) {
	var el = matrix.elements;
	return new this.API.message.mat44({
		x: {x: el[0],  y: el[1],  z: el[2],  t: el[3]},
		y: {x: el[4],  y: el[5],  z: el[6],  t: el[7]},
		z: {x: el[8],  y: el[9],  z: el[10], t: el[11]},
		t: {x: el[12], y: el[13], z: el[14], t: el[15]},
	});
};

SensorDataSimulator.prototype.createServos = function () {
	var servos = [];
	for (var id = 0; id < 20; id++) {
		servos.push(this.createServo(id));
	}
	return servos;
};

SensorDataSimulator.prototype.createServo = function (id) {
	return {
		errorFlags: 0,
		id: id
	}
};

SensorDataSimulator.prototype.run = function () {
	var now = Date.now();
	var elapsedTime = now - this.started;

	var radius = 2;
	var period = 19000;
	var x = radius * Math.cos(TAU * elapsedTime / period);
	var y =	radius * Math.sin(TAU * elapsedTime / period);
	var z = 0.2 * (Math.cos(TAU * elapsedTime / 3000) - 1);
	var rotX = Math.PI * Math.cos(TAU * elapsedTime / period);
	var rotY = Math.PI * Math.cos(TAU * elapsedTime / period);
	var rotZ = Math.PI * Math.cos(TAU * elapsedTime / period);
	var quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(rotX, rotY, rotZ));
	var pos = new THREE.Vector3(x, y, z).applyQuaternion(quat);
	var scale = new THREE.Vector3(1, 1, 1);
	this.matrix.compose(pos, quat, scale);
	this.message.world = this.matrixToProto(this.matrix);

	this.message.getServo().forEach(function (servo) {

		if (servo.__clockwise__ === undefined) {
			servo.__clockwise__ = true;
		}

		if (Math.random() < 0.05) {
			servo.__clockwise__ = !servo.__clockwise__;
		}

		servo.setPresentPosition(servo.getPresentPosition() + (servo.__clockwise__ ? 1 : -1) * Math.PI / 180);
	}, this);

	this.sendMessage(this.message);
};

if (require.main === module) {
	new SensorDataSimulator().runEvery(50);
}

module.exports = SensorDataSimulator;
