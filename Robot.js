var net, util, events, zmq;

net = require('net');
util = require('util');
events = require('events');
zmq = require('zmq');
fs = require('fs');

function Robot (host, port) {
    
    if (port === undefined) {
        port = 12000;
    }
    
    this.host = host;
    this.port = port;
    this.socket = null;
}

util.inherits(Robot, events.EventEmitter);

Robot.prototype.connect = function () {
    
    var self;
    
    self = this;
    
    self.socket = zmq.socket('sub');
    self.socket.connect('tcp://' + self.host + ':' + self.port);
    console.log('tcp://' + self.host + ':' + self.port);
    self.socket.subscribe("");
    
    self.socket.on('message', function () {
        
        self.onMessage.apply(self, arguments);
        
    });
    
};

Robot.prototype.connect2 = function () {
    
    console.log('yes');
    
    //fs.readFile('/cygdrive/c/Users/1260/Dropbox/education/University/Courses/nubots/NUbugger/logs/6_robots_data.log', function (err, data) {
    
    var filename = 'c:/Users/1260/Dropbox/education/University/Courses/nubots/NUbugger/logs/6_robots_data.log';
    
    var input = fs.createReadStream(filename);
    
    var remaining = '';
    
    var self = this;
    
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
    });
    
    input.on('line', function (line) {
        
        //console.log(line);
        //self.onMessage(line);
        
    });
    
    /*fs.open(filename, 'r', function (fd) {
    fs.read(fd, function (err, data) {
        
        console.log('salkdfjasldkfjs');
        
        console.log(err, data.length);
        
        var lines = data.split("\n");
        
        lines.forEach(function (line) {
            
            // base64 decode? maybe not
            // emit as event
            console.log('test');
            
        });
        
    });*/
    
};

Robot.prototype.onMessage = function (data) {
    
    var self;
    
    self = this;
    
    try {
        self.emit("message", data);
    } catch (err) {
        console.log(err);
    }
    
};

module.exports = Robot;
