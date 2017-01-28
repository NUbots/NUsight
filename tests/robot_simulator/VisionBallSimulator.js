var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function VisionBallSimulator () {
    RobotSimulator.call(this);

    this.loadProto('message.vision.NUsightBalls');
}
util.inherits(VisionBallSimulator, RobotSimulator);

VisionBallSimulator.prototype.run = function () {
    var width = 320;
    var height = 240;

    var ball = {};
    ball.circle = {};
    ball.circle.centre = {};
    ball.circle.centre.x = this.randInt(0, width);
    ball.circle.centre.y = this.randInt(0, height);
    ball.circle.radius = 50;

    var message = new this.API.message.vision.NUsightBalls({
        balls: [ball]
    });

    this.sendMessage(message);

};

if (require.main === module) {
    new VisionBallSimulator().runEvery(100);
}