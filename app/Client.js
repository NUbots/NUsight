function Client(socket) {
	
	this.socket = socket;
	this.cache = [];
	
}

Client.prototype.sendMessage = function (robotIP, message) {

	// This code throttles packets that are marked as filterable.
	// It waits for the client to send back an acknowledgement after each message (of each particular type) before sending another.
	var type = message[0];
	var filterId = message[1];
	if (filterId === 0) {
		this.socket.emit('message', robotIP, message);
	} else {
		var hash = type + ':' + filterId + ':' + robotIP;
		var now = Date.now();
		var timeout = 1000 * 2;
		var timedOut = this.cache[hash] !== undefined && this.cache[hash] + timeout < now;
		if (this.cache[hash] === undefined || timedOut) {
			if (timedOut) {
				console.warn('ACK not received for:', hash);
			}
			this.cache[hash] = now;
			this.socket.emit('message', robotIP, message, function () {
				delete this.cache[hash];
			}.bind(this));
		}
	}

};

module.exports = Client;
