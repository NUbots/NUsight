var NUClearNet = require('nuclearnet.js').NUClearNet;
var LocalisationSimulator = require('./LocalisationSimulator');
var SensorDataSimulator = require('./SensorDataSimulator');

if (require.main === module) {
	var net = new NUClearNet();
	this.net.connect({
		name: 'LocalisationSensorSimulator',
		address: '10.1.255.255' // TODO: (Josephus/Trent) Remove hardcoded address after RoboCup 2017
	});
	new LocalisationSimulator({
		net: net
	}).runEvery(30);

	new SensorDataSimulator({
		net: net
	}).runEvery(30);
}
