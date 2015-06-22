var ProtoBuf = require('protobufjs');
var zmq = require('zmq');
var glm = require('gl-matrix');

var builder = ProtoBuf.loadProtoFile({
	root: '../../public/resources/js/proto',
	file: 'messages/support/nubugger/proto/Message.proto'
});

var API = builder.build('messages.support.nubugger.proto');
API.LookUpTableDiff = builder.build('messages.vision.proto.LookUpTableDiff');
//var classifications = [117, 119, 103, 121, 111, 99, 109];
var classifications = [119, 103, 121, 111, 99, 109];

var socket = zmq.socket('pub');
socket.bindSync('tcp://0.0.0.0:12000');

var numPoints = 10;
var points = [];
var speed = 10;
for (var i = 0; i < numPoints; i++) {
	var maxBound = 255;
	points[i] = {
		position: glm.vec3.fromValues(
			Math.random() * maxBound,
			Math.random() * maxBound,
			Math.random() * maxBound
		),
		force: glm.vec3.random(glm.vec3.create(), speed),
		velocity: glm.vec3.create(),
		classification: classifications[i % classifications.length]
	}
}


var last = null;
var started = Date.now() / 1000;

glm.vec3.mod = function (out, a, n) {
	out[0] = a[0] % n;
	out[1] = a[1] % n;
	out[2] = a[2] % n;
	if (out[0] < 0) out[0] = n - out[0];
	if (out[1] < 0) out[1] = n - out[1];
	if (out[2] < 0) out[2] = n - out[2];
};

setInterval(function () {
	var now = Date.now() / 1000;
	if (last === null) last = now;
	var timeDelta = now - last;
	var timeElapsed = now - started;

	var diffs = [];

	for (var i = 0; i < numPoints; i++) {
		var point = points[i];
		glm.vec3.scaleAndAdd(point.position, point.position, point.velocity, timeDelta);
		glm.vec3.scaleAndAdd(point.velocity, point.velocity, point.force, timeDelta);
		glm.vec3.mod(point.position, point.position, 256);
		diffs.push({
			lut_index: getLUTIndex(point.position),
			classification: point.classification
		});
		if (timeElapsed > 2) {
			glm.vec3.random(point.force, speed);
			started = now;
		}
	}

	var message = new API.Message({
		type: API.Message.Type.LOOKUP_TABLE_DIFF,
		filter_id: 0,
		utc_timestamp: Date.now(),
		lookup_table_diff: {
			diff: diffs
		}
	});

	var buffer = message.toBuffer();
	var finalBuffer = new Buffer(buffer.length + 2);
	finalBuffer.writeUInt8(API.Message.Type.LOOKUP_TABLE_DIFF, 0);
	finalBuffer.writeUInt8(0, 1);
	buffer.copy(finalBuffer, 2);
	socket.send(finalBuffer);

	last = now;

}, 50);

function getLUTIndex (ycbcr) {
	var bitsY = 6;
	var bitsCb = 6;
	var bitsCr = 6;
	var bitsRemovedY = 8 - bitsY;
	var bitsRemovedCb = 8 - bitsCb;
	var bitsRemovedCr = 8 - bitsCr;

	var index = 0;
	index |= Math.floor(ycbcr[0]) >> bitsRemovedY;
	index <<= bitsCb;
	index |= Math.floor(ycbcr[1]) >> bitsRemovedCb;
	index <<= bitsCr;
	index |= Math.floor(ycbcr[2]) >> bitsRemovedCr;

	return index;
}
