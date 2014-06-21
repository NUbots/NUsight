function Client(socket) {
	
	var self = this;
	
	this.socket = socket;
	this.mode = Client.modes.STREAM;
	this.logfile = null;
	
	this.socket.on('stream', function () {
		
		self.stream();
		
	});
	
	this.socket.on('playback', function (filename) {
		
		self.playback(filename);
		
	});
	
	this.socket.on('pause', function () {
		
		self.pause();
		
	});
	
	this.socket.on('resume', function () {
		
		self.pause();
		
	});
	
}

Client.modes = {
	STREAM: 0,
	PLAYBACK: 1
};

Client.prototype.stream = function () {
	
	this.setMode(Client.modes.STREAM);
	
};

Client.prototype.playback = function (logfile) {
	
	this.setMode(Client.modes.PLAYBACK);
	this.logfile = logfile;
	
};

Client.prototype.pause = function () {
	
};

Client.prototype.resume = function () {
	
};

Client.prototype.setMode = function (mode) {
	this.mode = mode;
};

module.exports = Client;