Ext.define('NU.util.Network', {
	singleton: true,
	alternateClassName: 'NU.Network',
	mixins: {
		observable: 'Ext.mixin.Observable'
	},
	socket: null,
	cache: null,

	constructor: function (config) {
		this.mixins.observable.constructor.call(this, config);
		this.initConfig(config);
		this.cache = [];
	},

	init: function () {

		this.setupSocket();
		this.setupAPI();
		this.setupTypeMap();

		Ext.getStore('Robots').on({
			add: this.onAddRobot,
			update: this.onUpdateRobot,
			remove: this.onRemoveRobot,
			scope: this
		});

		requestAnimationFrame(this.onAnimationFrame.bind(this));

	},

	getTypeMap: function () {
		return this.typeMap;
	},

	onAnimationFrame: function () {
		requestAnimationFrame(this.onAnimationFrame.bind(this));

		Ext.Object.each(this.cache, function (hash, event) {
			if (this.hasListener(event.name)) {
				delete this.cache[hash];
				this.processMessage(event);
			}
		}, this);
	},

	processPacket: function (packet) {
		var message, type, eventName, filterId, robotIP, event, hash;
		robotIP = packet.robotIP;
		message = new Uint8ClampedArray(packet.message);
		type = message[0];
		eventName = this.typeMap[type];
		filterId = message[1];

		event = {
			name: eventName,
			robotIP: robotIP,
			message: packet.message.slice(2)
		};

		if (filterId > 0) {
			hash = eventName + ':' + filterId + ':' + robotIP;
			this.cache[hash] = event;
		} else {
			if (this.hasListener(event.name)) {
				this.processMessage(event);
			}
		}

		this.fireEvent('packet', robotIP, type, packet);
	},

	processMessage: function (event) {
		var api_message = API.Message.decode(event.message);
		var api_event = api_message[event.name];
		var time = new Date(api_message.getUtcTimestamp().toNumber());
		this.fireEvent(event.name, event.robotIP, api_event, time);
		//console.log(event.robotIP, event.name);
	},

	setupSocket: function () {
		var socket = io.connect(document.location.origin);
		socket.on('robotIP', this.onRobotIP.bind(this));
		socket.on('message', this.onMessage.bind(this));
		this.socket = socket;
	},

	setupAPI: function () {
		var builder = this.builder = dcodeIO.ProtoBuf.loadProtoFile({
			root: 'resources/js/proto',
			file: 'messages/support/nubugger/proto/Message.proto'
		});

		window.API = builder.build('messages.support.nubugger.proto');
		// cry :'(
		window.API.Behaviour = builder.build('messages.behaviour.proto.Behaviour');
		window.API.Configuration = builder.build('messages.support.nubugger.proto.ConfigurationState');
		window.API.GameState = builder.build('messages.input.proto.GameState');
		window.API.Image = builder.build('messages.input.proto.Image');
		window.API.Sensors = builder.build('messages.input.proto.Sensors');
		window.API.Subsumption = builder.build('messages.behaviour.proto.Subsumption');
		window.API.Vision = builder.build('messages.vision.proto');
	},

	setupTypeMap: function () {
		var typeMap = {};
		Ext.iterate(API.Message.Type, function (key, type) {
			typeMap[type] = key.toLowerCase();
		}, this);
		this.typeMap = typeMap;
	},

	onAddRobot: function (store, records, index, eOpts) {
		Ext.each(records, function (record) {
			if (record.get('ipAddress') !== '') {
				this.socket.emit('addRobot', record.get('ipAddress'), record.get('name'));
				this.fireEvent('addRobot', record.get('ipAddress'));
			}
		}, this);
	},

	onUpdateRobot: function (store, record, operation, modifiedFieldNames) {
		var robotIP = record.get('ipAddress');
		// Check if the IP address of the robot was modified.
		if (modifiedFieldNames.indexOf('ipAddress') !== -1) {
			if (robotIP !== '') {
				this.socket.emit('addRobot', robotIP);
				this.fireEvent('addRobot', robotIP);
			}
		}
		// Check if the enabled flag of the robot was modified.
		if (modifiedFieldNames.indexOf('enabled') !== 1) {
			var enabled = record.get('enabled');
			if (enabled) {
				this.socket.emit('enableRobot', robotIP);
			} else {
				this.socket.emit('disableRobot', robotIP);
			}
		}
	},

	onRemoveRobot: function (store, records, indexes, isMove, eOpts) {
		Ext.each(records, function (record) {
			var robotIP = record.get('ipAddress');
			this.socket.emit('removeRobot', robotIP);
			this.fireEvent('removeRobot', robotIP);
		}, this);
	},

	reconnect: function () {
		this.socket.emit('reconnectRobots');
	},

	onRobotIP: function (robotIP, robotName) {
		var robotsStore = Ext.getStore('Robots');
		var robotIndex = robotsStore.find('ipAddress', robotIP);
		if (robotIndex === -1) {
			robotsStore.add({
				ipAddress: robotIP,
				name: robotName !== undefined ? robotName : robotIP
			});
		}
	},

	onMessage: function (robotIP, message, callback) {
		var packet = {
			robotIP: robotIP,
			message: message
		};

		this.processPacket(packet);
		if (callback) {
			callback();
		}
	},

	send: function (robotIP, message) {
		this.socket.emit('message', robotIP, message.encode().toArrayBuffer());
	},

	broadcast: function (message) {
		this.socket.emit('broadcast', message.encode().toArrayBuffer());
	},

	getRobotIPs: function () {
		var result = [];
		var robotsStore = Ext.getStore('Robots');
		robotsStore.each(function (record) {
			result.push(record.get('ipAddress'));
		});
		return result;
	},
	getRobotStore: function () {
		return Ext.getStore('Robots');
	},
	/**
	 * Creates a message of a particular type and filter identifier that can be used to send over the network.
	 *
	 * @param type The type of message being created.
	 * @param filterId The filter identifier for the message.
	 */
	createMessage: function (type, filterId) {
		// Create the message.
		var message = new API.Message();
		// Set the type, filter identifier and timestamp of the message.
		message.setType(type);
		message.setFilterId(filterId);
		message.setUtcTimestamp(Date.now() / 1000);
		// Return the message that was created].
		return message;
	},

	/**
	 * Creates a message and command of a particular name to send over the network.
	 *
	 * @param robotIP The IP address of the robot associated with the command.
	 * @param commandName The name of the command.
	 * @param [filterId] The filter identifier for the message.
	 */
	sendCommand: function (robotIP, commandName, filterId) {
		// Create the message of type command.
		var message = this.createMessage(API.Message.Type.COMMAND, filterId || 0);
		// Create the command and set its name.
		var command = new API.Message.Command();
		command.setCommand(commandName);
		// Set the command of the message
		message.setCommand(command);
		// Send the command message over the network.
		this.send(robotIP, message);
	}
});
