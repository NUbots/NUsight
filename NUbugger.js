var Robot = require('./Robot');

function NUbugger (io) {
    
    var self = this;
    
    self.io = io;
    self.robot = new Robot('10.0.1.51');
    self.robot.connect();
    self.robot.on('error', function (e) {
	console.log('error!', e);
    });
    
    var count = 0;
    setInterval(function () {
	console.log('count', count);
	count = 0;
    }, 1000);
    self.io.sockets.on('connection', function (socket) {
	
	// TODO: make it one callback!?
	
	self.robot.on("message", function (message) {
	    
	    count++;
	    socket.emit("message", message.toString('base64'));
	    
	});
        
    });
    
}

module.exports = NUbugger;