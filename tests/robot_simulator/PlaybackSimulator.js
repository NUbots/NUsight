var fs = require('fs');
var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function PlaybackSimulator (filename, loop, speed) {
	RobotSimulator.call(this);

	this.filename = filename;
	this.HEADER_SIZE = 4;
	this.loop = loop;
	this.speed = speed; // 1 is normal, 2 is double speed, 0.5 is half speed
}
util.inherits(PlaybackSimulator, RobotSimulator);


PlaybackSimulator.prototype.run = function () {

	var lastTimestamp = null;
	fs.open(this.filename, 'r', function (err, fd) {

		(function readMessage() {

			// Read the header into a buffer, containing the size of the data packet
			fs.read(fd, new Buffer(this.HEADER_SIZE), 0, this.HEADER_SIZE, null, function (err, bytesRead, header) {

				if (err || bytesRead === 0) {
					// End of file
					if (this.loop) {
						// Start from beginning of file again
						this.run();
					}
					return;
				}
				// Read the length of the data packet
				var dataLength = header.readUInt32LE(0);
				fs.read(fd, new Buffer(dataLength), 0, dataLength, null, function (err, bytesRead, data) {

					// Decode protobuf to get the type/filterId and update the timestamp
					var message = this.API.Message.decode(data);
					var timestamp = message.getUtcTimestamp().toNumber();
					var deltaTimestamp = lastTimestamp === null ? 0 : timestamp - lastTimestamp;

					// Delay sending of message until the deltaTimestamp has occurred (scaled by speed) to simulate proper timings
					setTimeout(function () {

						// Override timestamp
						message.setUtcTimestamp(Date.now());

						this.sendMessage(message);

						// Read next message in file
						readMessage.call(this);

					}.bind(this), deltaTimestamp / this.speed);

					lastTimestamp = timestamp;

				}.bind(this));

			}.bind(this));

		}.bind(this)());

	}.bind(this));

};

if (!module.parent) {
	var loop = true;
	var speed = 1;
	new PlaybackSimulator('../../logs/10.1.2.3/1435023512834.nbs', loop, speed).run();
}
