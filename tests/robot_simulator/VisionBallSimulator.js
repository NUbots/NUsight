var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function VisionBallSimulator () {
    RobotSimulator.call(this);

    this.loadProto('message.vision.VisionObjects');
}
util.inherits(VisionBallSimulator, RobotSimulator);

VisionBallSimulator.prototype.run = function () {
    var ball = {};
    ball.circle = {};
    ball.circle.centre = {};
    ball.circle.centre.x = 50;
    ball.circle.centre.y = 50;
    ball.circle.radius = 50;

    var message = new this.API.message.vision.NUsightBalls({
        balls: [ball]
    });

    this.sendMessage(message);

};

if (require.main === module) {
    new VisionBallSimulator().runEvery(100);
}