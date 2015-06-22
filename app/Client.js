function Client(socket) {
	
	this.socket = socket;
	this.mode = Client.modes.STREAM;
	this.logfile = null;
	this.cache = [];
	
	this.socket.on('stream', function () {
		
		this.stream();
		
	}.bind(this));
	
	this.socket.on('playback', function (filename) {
		
		this.playback(filename);
		
	}.bind(this));
	
	this.socket.on('pause', function () {
		
		this.pause();
		
	}.bind(this));
	
	this.socket.on('resume', function () {
		
		this.pause();
		
	}.bind(this));
	
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
