var util = require('util');
var RobotSimulator = require('./RobotSimulator');

var sampleFileWalkEngine = {
	value: {
		name: {
			value: 'x',
			tag: '<Slider(0,1,0.1)>'
		},
		age: {
			value: 23
		},
		color: {
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
				{ value: 'Home'},
				{ value: 'Work'}
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
			content: encodeField(file.content)
		};
	});
}

/**
 * Convert the field to be compatible with the Configuration protobuf message
 *
 * @param  {Object} field 	The field to convert
 * @param  {String} name    The name (key) of the field
 * @return {Object}
 */
function encodeField(field, name) {
    var value = field.value;
    var tag = field.tag;

	if (typeof value === undefined || value === null) {
		return wrapField({ tag: tag, nullValue: 0 }, name);
	}

    if (typeof value === 'string') {
        return wrapField({ tag: tag, stringValue: value }, name);
    }

    if (typeof value === 'number') {
        return wrapField({ tag: tag, numberValue: value}, name);
    }

    if (typeof value === 'boolean') {
        return wrapField({ tag: tag, boolValue: value }, name);
    }

	if (Array.isArray(value)) {
		var encoded = {
            tag: tag,
            listValue: {
            	values: value.map(function(value) {
	            	return encodeField(value)
	            })
            }
        };

		return wrapField(encoded, name);
	}

    if (isObject(value)) {
        var encoded = {
            mapValue: {
                fields: {}
            }
        };

        for (var subfield in value) {
            encoded.mapValue.fields[subfield] = encodeField(value[subfield], subfield)[subfield];
        }

        return wrapField(encoded, name);
    }

    return 'LOL';
};

/**
 * Check if the given JS value is an object
 *
 * @param  {Any}  value 	The value to check
 * @return {Boolean}
 */
function isObject(value) {
	return typeof value === 'object' &&
		value &&
		Object.prototype.toString.call(value) !== '[object Array]'
}

/**
 * Create an object with the given field nested in the given name
 *
 * @param  {Object} field   The field to wrap
 * @param  {[type]} name    The name (key) to nest the field in
 * @return {Object}
 */
function wrapField(field, name) {
	if (!name) {
		return field;
	}

	var wrapper = {};
	wrapper[name] = field;

	return wrapper;
}

if (require.main === module) {
	new ConfigurationSimulator();
} else {
	module.exports = ConfigurationSimulator;
}
