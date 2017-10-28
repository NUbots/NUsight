var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function ObstacleSimulator () {
	RobotSimulator.call(this);

	this.loadProto('message.vision.NUsightObstacles');
}
util.inherits(ObstacleSimulator, RobotSimulator);

ObstacleSimulator.prototype.run = function () {
	var message = new this.API.message.vision.NUsightObstacles({
	    obstacles: [
	        {
	            shape: {
	                points: [
	                    {
	                        x: 0,
	                        y: 0
	                    },
	                    {
	                        x: 0,
	                        y: 10
	                    },
	                    {
	                        x: 10,
	                        y: 10
	                    },
	                    {
	                        x: 10,
	                        y: 0
	                    }
	                ]
	            },
	            team: 'UNKNOWN_TEAM'
	        },
	        {
	            shape: {
	                points: [
	                    {
	                        x: 50,
	                        y: 50
	                    },
	                    {
	                        x: 50,
	                        y: 100
	                    },
	                    {
	                        x: 100,
	                        y: 100
	                    },
	                    {
	                        x: 100,
	                        y: 50
	                    }
	                ]
	            },
	            team: 'UNKNOWN_TEAM'
	        }
	    ]
	});

	this.sendMessage(message);
};

if (require.main === module) {
	new ObstacleSimulator().runEvery(5000);
}



