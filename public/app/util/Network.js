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
		var robot = this.getRobot(packet.robotId);
		var message = new Uint8ClampedArray(packet.message);
		var type = message[0];
		var eventName = this.typeMap[type];
		var filterId = message[1];

		event = {
			name: eventName,
			robotId: robot.id,
			message: packet.message.slice(2)
		};

		if (filterId > 0) {
			var hash = eventName + ':' + filterId + ':' + robot.id;
			this.cache[hash] = event;
		} else {
			if (this.hasListener(event.name)) {
				this.processMessage(event);
			}
		}

		this.fireEvent('packet', robot, type, packet);
	},

	processMessage: function (event) {
		var api_message = API.Message.decode(event.message);
		var api_event = api_message[event.name];
		var time = new Date(api_message.getUtcTimestamp().toNumber());
		this.fireEvent(event.name, event.robotId, api_event, time);
		//console.log(event.robotIP, event.name);
	},

	setupSocket: function () {
		var socket = io.connect(document.location.origin);
		socket.on('addRemoteRobot', this.onAddRemoteRobot.bind(this));
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
				this.socket.emit('addRobot', record.get('id'), record.get('ipAddress'), record.get('port'), record.get('name'));
				this.fireEvent('addRobot', record);
			}
		}, this);
	},

	onUpdateRobot: function (store, record, operation, modifiedFieldNames) {
		var robotId = record.get('id');
		// Check if the IP address of the robot was modified.
		if (modifiedFieldNames.indexOf('ipAddress') !== -1) {
			if (robotIP !== '') {
				// TODO
				//this.socket.emit('addRobot', robotIP);
				//this.fireEvent('addRobot', record);
			}
		}
		// Check if the enabled flag of the robot was modified.
		if (modifiedFieldNames.indexOf('enabled') !== -1) {
			var enabled = record.get('enabled');
			if (enabled) {
				this.socket.emit('enableRobot', robotId);
				this.fireEvent('enableRobot', record);
			} else {
				this.socket.emit('disableRobot', robotId);
				this.fireEvent('disableRobot', record);
			}
		}
	},

	onRemoveRobot: function (store, records, indexes, isMove, eOpts) {
		Ext.each(records, function (record) {
			this.socket.emit('removeRobot', record.get('id'));
			this.fireEvent('removeRobot', record);
		}, this);
	},

	reconnect: function () {
		this.socket.emit('reconnectRobots');
	},

	onAddRemoteRobot: function (robot) {
		var robotsStore = Ext.getStore('Robots');
		var robotIndex = robotsStore.find('id', robot.id);
		if (robotIndex === -1) {
			robotsStore.add(robot);
		}
	},

	onMessage: function (robotId, message, callback) {
		this.processPacket({
			robotId: robotId,
			message: message
		});

		if (callback) {
			callback();
		}
	},

	send: function (robotId, message) {
		this.socket.emit('message', robotId, message.encode().toArrayBuffer());
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

	getRobot: function (robotId) {
		var store = this.getRobotStore();
		return store.findRecord('id', robotId);
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
	 * @param robotId The id of the robot associated with the command.
	 * @param commandName The name of the command.
	 * @param [filterId] The filter identifier for the message.
	 */
	sendCommand: function (robotId, commandName, filterId) {
		// Create the message of type command.
		var message = this.createMessage(API.Message.Type.COMMAND, filterId || 0);
		// Create the command and set its name.
		var command = new API.Message.Command();
		command.setCommand(commandName);
		// Set the command of the message
		message.setCommand(command);
		// Send the command message over the network.
		this.send(robotId, message);
	}
});
