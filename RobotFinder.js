var net, util, events, zmq, dgram, os;

net = require('net');
util = require('util');
events = require('events');
dgram = require('dgram');
os = require('os');

function RobotFinder (host, port, iface) {

    this.host = host;
    this.port = port;
    this.interface = iface;
    this.socket = null;
    this.robotIPs = [];

}

util.inherits(RobotFinder, events.EventEmitter);

RobotFinder.prototype.listen = function () {

    var self = this;

    console.log('Listening for robots on multicast ' + this.host + ':' + this.port);

    var socket = this.socket = dgram.createSocket('udp4');

    socket.on('listening', function () {

        if (this.interface === undefined) {
            var ifaces = os.networkInterfaces();

            Object.keys(ifaces).forEach(function(ifacename) {

                var iface = ifaces[ifacename];

                iface.forEach(function (i) {
                    if (i.family === 'IPv4' && i.internal !== true) {
                        try {
                            socket.addMembership(self.host, ifacename);
                            console.log('Successfully listening to robots on interface \'' + ifacename + '\'');
                        } catch (err) {
                            console.log('Warning: Could not listen to robots on interface \'' + ifacename + '\'');
                        }
                    }
                })

            });
        } else {
            console.log('Adding multicast membership on interface: ' + self.interface);
            socket.addMembership(self.host, self.interface);
        }

    });

    socket.on('error', function (err) {
        console.log('Error in RobotFinder');
        console.log(err.stack);
        socket.close();
    });

    socket.on('message', function (message, rinfo) {

        var robotIP = rinfo.address;
        if (self.robotIPs.indexOf(robotIP) === -1) {
            console.log("Found Robot: " + robotIP);

            self.emit("robotIP", robotIP);
            self.robotIPs.push(robotIP);
        }

    });

    socket.on('close', function () {
        console.log('closed');

        socket.dropMembership(self.host);
    });

    socket.bind(this.port);

};

module.exports = RobotFinder;
