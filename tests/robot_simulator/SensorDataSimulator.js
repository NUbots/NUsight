var util = require('util');
var RobotSimulator = require('./RobotSimulator');
var THREE = require('three');
var TAU = 2 * Math.PI;

function SensorDataSimulator (opts) {
	RobotSimulator.call(this, opts);

	this.loadProto('message.input.Sensors');
	this.loadProto('message.mat44');

	this.started = Date.now();
	this.matrix = new THREE.Matrix4();

	this.message = new this.API.message.input.Sensors({
		timestamp: {seconds: (Date.now() / 1000).toFixed(0)},
		voltage: 12,
		battery: Math.random(),
		servo: this.createServos()
	});
}
util.inherits(SensorDataSimulator, RobotSimulator);

SensorDataSimulator.prototype.matrixToProto = function (matrix) {
	var el = matrix.elements;
	return new this.API.mat44({
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

SensorDataSimulator.prototype.run = (function() {
	var vector = new THREE.Vector3();
	var euler = new THREE.Euler();

	return function () {
		var now = Date.now();
		var elapsedTime = now - this.started;

		var radius = 2;
		var period = 19000;
		var x = radius * Math.cos(TAU * elapsedTime / period);
		var y =	radius * Math.sin(TAU * elapsedTime / period);
		var z = 0.2 * (Math.cos(TAU * elapsedTime / 3000) - 1);
		var rotX = Math.PI * Math.cos(TAU * elapsedTime / (2 * period / 3));
		var rotY = Math.PI * Math.cos(TAU * elapsedTime / (2 * period / 5));
		var rotZ = Math.PI * Math.cos(TAU * elapsedTime / (2 * period / 7));

		euler.set(rotX, rotY, rotZ);
		this.matrix.makeRotationFromEuler(euler);
		this.matrix.setPosition(vector.set(x, y, z).applyMatrix4(this.matrix));

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
	}
}());

if (require.main === module) {
	new SensorDataSimulator().runEvery(50);
}

module.exports = SensorDataSimulator;
