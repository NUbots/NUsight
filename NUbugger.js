var Robot = require('./Robot');
var fs = require('fs');
var util = require('util');
var events = require('events');

function NUbugger (io) {
	
	var self = this;
	
	self.io = io;
	self.robots = [];
	self.robotIPs = [];
	self.addRobots([
		'10.0.1.51',
		'10.0.1.52',
		'10.0.1.53',
		'10.0.1.54',
		'10.0.1.55',
		'10.0.1.56'
	]);
	self.clients = [];
	
	self.io.sockets.on('connection', function (socket) {
	
		self.clients.push(socket);
		
		socket.emit('robot_ips', self.robotIPs);
		
		console.log('new client', self.clients.length);
		
		socket.on('disconnect', function () {
			
			self.clients.splice(self.clients.indexOf(socket), 1);
			
			console.log('lost client', self.clients.length);
			
		});
	
	});
	
	self.on('message', function (robotIP, message) {
	
		self.onMessage(robotIP, message);
	
	});
	
}

util.inherits(NUbugger, events.EventEmitter);

NUbugger.prototype.addRobots = function (robotIPs)
{
	var self;
	
	self = this;
	
	if (!Array.isArray(robotIPs))
	{
		robotIPs = [robotIPs];
	}
	
	robotIPs.forEach(function (robotIP) {
	
		var robot = new Robot(robotIP);
		robot.connect();
		robot.on('message', function (message) {
			
			self.emit('message', robotIP, message);
			
		});
		
		self.robots.push(robot);
		self.robotIPs.push(robotIP);
		
	});
};

NUbugger.prototype.onMessage = function (robotIP, message)
{
	var self;
	
	self = this;
	
	//console.log(robotIP, message.length);
	//var timestamp = Date.now();
	var filename = "data.log";
	
	//fs.appendFile(filename, message.toString('base64') + "\n");
	
	self.clients.forEach(function (client) {
	
		//console.log(client);
		
		client.emit('message', robotIP, message.toString('base64'));
	
	});
	
	//var timestamp = Date.now();
	//var filename = "logs/log_" + timestamp + ".log";
	//
	// TODO: make it one callback!?
	//
	//self.robot.on("message", function (message) {
	//
	//count++;
	////fs.appendFile(filename, message);
	//socket.emit("message", message.toString('base64'));
	//
	//});
	
};

module.exports = NUbugger;
