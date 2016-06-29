var NUClearNet = require('nuclearnet.js');
var LocalisationSimulator = require('./LocalisationSimulator');
var SensorDataSimulator = require('./SensorDataSimulator');

if (require.main === module) {
  var net = new NUClearNet('LocalisationSensorDataSimulator', '239.226.152.162', 7447);
  
  new LocalisationSimulator({
    net: net
  }).runEvery(100);
  
  new SensorDataSimulator({
    net: net
  }).runEvery(50);
}
