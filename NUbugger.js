var Robot = require('./Robot');
var Client = require('./Client');
var fs = require('fs');
var util = require('util');
var events = require('events');

function NUbugger (io) {
	
	var self = this;
	
	self.io = io;
	self.robots = [];
	self.robotIPs = [];
	self.addRobots([
		//'192.168.137.42',
		//'145.144.172.182',
		//'145.144.172.183',
		//'145.144.172.184',
		//'145.144.172.185',
		//'145.144.172.186',
		//'10.0.1.41',
		//'10.0.1.42',
		//'10.0.1.43',
		//'10.0.1.44',
		//'10.0.1.45',
		//'10.0.1.46',
		//'10.0.1.51',
		//'10.0.1.52',
		//'10.0.1.53',
		//'10.0.1.54',
		'10.0.1.41',
		//'10.0.1.56'
	]);
	self.clients = [];
	
	self.io.sockets.on('connection', function (socket) {
		
		var client = new Client(socket);
		
		self.clients.push(client);
		
		socket.emit('robot_ips', self.robotIPs);
		
		console.log('new client', self.clients.length);
		
		socket.on('disconnect', function () {
			
			self.clients.splice(self.clients.indexOf(client), 1);
			
			console.log('lost client', self.clients.length);
			
		});
	
	});
	
	self.on('message', function (robotIP, message) {
	
		self.onMessage(robotIP, message);
	
	});
	
	//var filename = 'c:/Users/1260/Dropbox/education/University/Courses/nubots/NUbugger/logs/6_robots_data.log';
	/*var filename = 'c:/Users/1260/Dropbox/education/University/Courses/nubots/NUbugger/logs/test.log';
    var input = fs.createReadStream(filename);
    var remaining = '';
    var self = this;
	var lines = [];
	var index = 0;
    
    input.on('data', function(data) {
        remaining += data;
        var index = remaining.indexOf('\n');
        while (index > -1) {
            var line = remaining.substring(0, index);
            remaining = remaining.substring(index + 1);
            input.emit('line', line);
            index = remaining.indexOf('\n');
        }
    });
    
    input.on('end', function() {
        if (remaining.length > 0) {
            input.emit('line', line);
        }
		
		setInterval(function () {
			
			//console.log('message', '10.0.1.54', lines[index]);//, index, lines.length);
			
			self.emit('message', '10.0.1.54', lines[index]);
			
			index = (index + 1) % lines.length;
			
		}, 10);
    });
    
    input.on('line', function (line) {
        
        lines.push(line);
        
    });*/
	
	/*while (true) {
		lines.forEach(function (line) {
			self.emit(line);
		})
	}*/
	
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
	var filename = "c:/Users/Brendan/Documents/data.log";
	
	//fs.appendFile(filename, message.toString('base64') + "\n");
	
	self.clients.forEach(function (client) {
	
		//console.log(message);
		
		client.socket.emit('message', robotIP, message.toString('base64'));
		//client.socket.emit('message', robotIP, message);
	
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
