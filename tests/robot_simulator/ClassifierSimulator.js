var util = require('util');
var glm = require('gl-matrix');
var RobotSimulator = require('./RobotSimulator');

function ClassifierSimulator () {
	RobotSimulator.call(this);

	this.loadProto('message.vision.proto.LookUpTableDiff');

	this.classifications = [119, 103, 121, 111, 99, 109];
	this.numPoints = 10;
	this.speed = 10;
	this.points = this.getPoints(this.numPoints, this.speed);

	this.started = Date.now() / 1000;
	this.last = null;
}
util.inherits(ClassifierSimulator, RobotSimulator);

ClassifierSimulator.prototype.run = function () {
	var now = Date.now() / 1000;
	if (this.last === null) this.last = now;
	var timeDelta = now - this.last;
	var timeElapsed = now - this.started;

	var diffs = [];

	for (var i = 0; i < this.numPoints; i++) {
		var point = this.points[i];
		glm.vec3.scaleAndAdd(point.position, point.position, point.velocity, timeDelta);
		glm.vec3.scaleAndAdd(point.velocity, point.velocity, point.force, timeDelta);
		this.vec3mod(point.position, point.position, 256);
		diffs.push({
			lutIndex: this.getLUTIndex(point.position),
			classification: point.classification
		});
		if (timeElapsed > 2) {
			glm.vec3.random(point.force, this.speed);
			this.started = now;
		}
	}

	var message = new this.API.message.vision.proto.LookUpTableDiff({
		diff: diffs
	});

	this.sendMessage(message);
	this.last = now;
};

ClassifierSimulator.prototype.getPoints = function (numPoints, speed) {
	var points = [];
	var maxBound = 255;
	for (var i = 0; i < numPoints; i++) {
		points[i] = {
			position: glm.vec3.fromValues(
				Math.random() * maxBound,
				Math.random() * maxBound,
				Math.random() * maxBound
			),
			force: glm.vec3.random(glm.vec3.create(), speed),
			velocity: glm.vec3.create(),
			classification: this.classifications[i % this.classifications.length]
		}
	}
	return points;
};

ClassifierSimulator.prototype.vec3mod = function (out, a, n) {
	out[0] = a[0] % n;
	out[1] = a[1] % n;
	out[2] = a[2] % n;
	if (out[0] < 0) out[0] = n - out[0];
	if (out[1] < 0) out[1] = n - out[1];
	if (out[2] < 0) out[2] = n - out[2];
};

if (require.main === module) {
	new ClassifierSimulator().runEvery(50);
}
