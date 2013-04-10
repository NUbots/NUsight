var net, util, events, zmq;

net = require('net');
util = require('util');
events = require('events');
zmq = require('zmq');

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
    self.socket.subscribe("");
    
    self.socket.on('message', function () {
        
        self.onMessage.apply(self, arguments);
        
    });
    
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