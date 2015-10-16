function Client(socket) {
	
	this.socket = socket;
	this.cache = [];
	this.listeners = {};
	
}

Client.prototype.sendMessage = function (robot, messageType, protobuf, filterId, timestamp) {

	// This code throttles packets that are marked as filterable.
	// It waits for the client to send back an acknowledgement after each message (of each particular type) before sending another.
	if (filterId === 0) {
		this.socket.emit('message', robot, messageType, protobuf, filterId, timestamp);
	} else {
		var hash = messageType + ':' + filterId + ':' + robot.id;
		var now = Date.now();
		var timeout = 1000 * 2;
		var timedOut = this.cache[hash] !== undefined && this.cache[hash] + timeout < now;
		if (this.cache[hash] === undefined || timedOut) {
			if (timedOut) {
				console.warn('ACK not received for:', hash);
			}
			this.cache[hash] = now;
			this.socket.emit('message', robot, messageType, protobuf, filterId, timestamp, function () {
				delete this.cache[hash];
			}.bind(this));
		}
	}

};

module.exports = Client;
