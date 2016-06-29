var util = require('util');
var RobotSimulator = require('./RobotSimulator');

function LocalisationSimulator (opts) {
  RobotSimulator.call(this, opts);

  this.loadProto('message.localisation.proto.Localisation');
}
util.inherits(LocalisationSimulator, RobotSimulator);

LocalisationSimulator.prototype.run = function () {
  var message = new this.API.message.localisation.proto.Localisation({
    fieldObject: [{
      name: 'self',
      models: [{
        modelId: 0,
        wmX: 2,
        wmY: 3,
        sdX: 1E-1,
        sdY: 2E-1,
        srXx: 3E-1,
        srXy: 4E-1,
        srYy: 5E-1,
        heading: Math.PI / 4,
        sdHeading: 1E-1,
        lost: false
      }]
    }]
  });

  this.sendMessage(message);
};

if (require.main === module) {
  new LocalisationSimulator().runEvery(100);
}

module.exports = LocalisationSimulator;
