var util = require('util');
var RobotSimulator = require('./RobotSimulator');
var ConfigurationUtil = require('../../public/app/util/Configuration');

var sampleFileWalkEngine = {
	value: {
		name: {
			value: 'ConfigurationRobot'
		},
		positionX: {
			value: 0,
			tag: '<Slider(-10,10,1)>'
		},
		positionY: {
			value: 0,
			tag: '<Slider(-10,10,1)>'
		},
		areaColor: {
			value: {
				r: {
					value: '255'
				},
				g: {
					value: '255'
				},
				b: {
					value: '255'
				}
			}
		},
		locations: {
			value: [
				{ value: 'Home' },
				{ value: 'Work' }
			]
		}
	}
};

var sampleFileNetwork = {
	value: {
		ip: {
			value: '192.168.0.1',
		},
		port: {
			value: 8080
		}
	}
};

var sampleConfig = encodeConfig([
	{
		path: 'config/WalkEngine.yaml',
		content: sampleFileWalkEngine
	},
	{
		path: 'config/Network.yaml',
		content: sampleFileNetwork
	},
	{
		path: 'config/WalkEngine/WalkEngine.yaml',
		content: sampleFileWalkEngine
	},
	{
		path: 'config/Network/Network.yaml',
		content: sampleFileNetwork
	},
	{
		path: 'config/darwin1/WalkEngine.yaml',
		content: sampleFileWalkEngine
	},
	{
		path: 'config/darwin1/Network.yaml',
		content: sampleFileNetwork
	}
]);

function ConfigurationSimulator () {
	RobotSimulator.call(this);

	this.loadProto('message.support.nubugger.Command');
	this.loadProto('message.support.nubugger.Configuration');

	this.onMessage('message.support.nubugger.Command', function (message) {
		console.log('Command received', message.command);

		if (message.command === 'GET_CONFIGURATION') {
			this.sendConfiguration();
		}
	}.bind(this));

	this.onMessage('message.support.nubugger.Configuration', function (message) {
		console.log('Configuration received', message);
		this.updateConfiguration(message);
	}.bind(this));

	console.log('ConfigurationSimulator ready');
}

util.inherits(ConfigurationSimulator, RobotSimulator);

ConfigurationSimulator.prototype.sendConfiguration = function () {
	console.log(sampleConfig);

	var message = new this.API.message.support.nubugger.Configuration(sampleConfig);
	this.sendMessage(message);

	console.log('Configuration sent', message);
};

ConfigurationSimulator.prototype.updateConfiguration = function (configuration) {
	console.log('Persisting the configuration', configuration);
};

/**
 * Convert the given list of config files to be compatible with the Configuration
 * protobuf message
 *
 * @param  {Array} files 	The list of config files
 * @return {Array}
 */
function encodeConfig(files) {
	return files.map(function (file) {
		return {
			path: file.path,
			content: ConfigurationUtil.encodeField(file.content)
		};
	});
}

if (require.main === module) {
	new ConfigurationSimulator();
} else {
	module.exports = ConfigurationSimulator;
}
