var net, util, events;

net = require('net');
util = require('util');
events = require('events');

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
    
    var self, socket;
    
    self = this;
    
    socket = net.createConnection({
        host: self.host,
        port: self.port
    }, function (socket) {
       //console.log("connected!"); 
    });
    
    socket.setEncoding('utf8');
    socket.buffer = [];
    socket.on('data', function () {
        self.onData.apply(self, arguments);
    });
    socket.on('line', function () {
        self.onLine.apply(self, arguments);
    });
    socket.on('error', function (e) {
        self.emit('error', e);
    });
    self.socket = socket;
    
}

Robot.prototype.disconnect = function () {
    
    var self;
    
    self = this;
    
    if (self.socket !== null)
    {
        self.socket.end();
        self.socket = null;
    }
    
}

Robot.prototype.onData = function (data) {
    
    var self, index, remainingData;
    
    self = this;
    
    if (typeof data === Buffer) {
        try {
            data = data.toString();
        } catch (err) {
            console.log(err);
        }
    }
    
   // console.log(data);
    
    index = data.indexOf('\n');
    if (index > -1) {
        self.socket.buffer.push(data.substring(0, index));
        self.socket.emit('line', self.socket.buffer.join(''));
        self.socket.buffer = [];
        remainingData = data.substring(index + 1);
        if (remainingData.length) {
            self.socket.emit('data', remainingData);
        }
    } else {
        self.socket.buffer.push(data);
    }
    
}

Robot.prototype.onLine = function (data) {
    
    var self, event;
    
    self = this;
    
    try {
        event = JSON.parse(data);
        self.emit(event.event, event);
    } catch (err) {
        console.log(err);
    }
    
}

Robot.prototype.getOrientation = function () {
    
    return 1;

}

module.exports = Robot;