Ext.define('NU.util.Network', {
	singleton: true,
	alternateClassName: 'NU.Network',
	mixins: {
		observable: 'Ext.mixin.Observable'
	},
	socket: null,
	cache: null,
	deserialisers: null,
	protoBuilder: null,

	constructor: function (config) {
		this.mixins.observable.constructor.call(this, config);
		this.initConfig(config);
		this.cache = [];
		this.deserialisers = {};
	},

	init: function () {

		this.setupSocket();

		this.protoBuilder = dcodeIO.ProtoBuf.newBuilder({ convertFieldsToCamelCase: true });

		this.on('addListener', this.addHandler.bind(this));
		this.on('removeListener', this.removeHandler.bind(this));

		requestAnimationFrame(this.onAnimationFrame.bind(this));
	},

	onAnimationFrame: function () {
		requestAnimationFrame(this.onAnimationFrame.bind(this));

		Ext.Object.each(this.cache, function (hash, event) {

			delete this.cache[hash];
			if(this.hasListener(event.messageType.toLowerCase())) {
				this.fireEvent(event.messageType
					, event.robot
					, this.deserialisers[event.messageType](event.protobuf)
					, event.timestamp);
			}
		}, this);
	},

	setupSocket: function () {
		var socket = io.connect(document.location.origin);
		socket.on('updateRobot', this.updateRobot.bind(this));
		socket.on('message', this.onMessage.bind(this));
		this.socket = socket;
	},

	addHandler: function(messageType) {

		// If it's a string, make it an object
		if (typeof messageType === 'string') {
			var tmp = {};
			tmp[messageType] = null;
			messageType = tmp;
		}

		Object.keys(messageType).forEach(function (key) {
			// If we need to tell node.js to start listening for this
			if(key !== 'scope' &&
				key !== 'packet' &&
				key !== 'addListener' &&
				key !== 'removeListener' &&
				key !== 'addRobot' &&
				key !== 'removeRobot' &&
				!this.hasListener(key.toLowerCase())) {

				// Load the protocol buffer file and build it
				dcodeIO.ProtoBuf.loadProtoFile({
					root: 'resources/js/proto',
					file: key.replace(/\./g, '/') + '.proto'
				}, this.protoBuilder);
				var proto = this.protoBuilder.build(key);

				// Update our API
				window.API = this.protoBuilder.build();

				// Add a deserialiser for this
				this.deserialisers[key] = function (data) {
					return proto.decode(data);
				};

				this.socket.emit('addType', key);
			}
		}, this);
	},
	removeHandler: function (messageType) {

		// If this was the last one
		// Send a message to unbind the reaction on the node.js side
		if(messageType !== 'scope' &&
			messageType !== 'packet' &&
			messageType !== 'addListener' &&
			messageType !== 'removeListener' &&
			messageType !== 'addRobot' &&
			messageType !== 'removeRobot' &&
			!this.hasListener(messageType.toLowerCase())) {
			delete this.deserialisers[messageType];
			this.socket.emit('dropType', messageType);
		}
	},

	recordRobots: function (recording) {
		var robotStore = this.getRobotStore();
		var robotIds = [];

		robotStore.each(function (robot) {
			var isRecording = robot.get('recording');
			if (recording !== isRecording) {
				robotIds.push(robot.id);
				robot.set('recording', recording);
			}
		}, this);

		this.socket.emit('recordRobots', robotIds, recording);
	},

	updateRobot: function (robot) {
		// Try to find this robot
		if (this.getRobotStore().find('id', robot.id) === -1) {

			this.getRobotStore().add(robot);

			// TODO ADD AN ADD ROBOT EVENT
			this.fireEvent('addRobot', robot);
		}
		else {
			// TODO NUCLEARNET LEARN HOW TO UPDATE A RECORD
		}
	},

	onMessage: function (robot, messageType, protobuf, filterId, timestamp, callback) {

		if (filterId > 0) {
			// Store in the cache for the next animation frame
			var hash = messageType + ':' + filterId + ':' + robot.id;
			this.cache[hash] = { messageType: messageType, robot: robot, protobuf: protobuf, timestamp: new Date(timestamp) };
		}
		else if (this.hasListener(messageType.toLowerCase())) {
			// Do it right away
			this.fireEvent(messageType, robot, this.deserialisers[messageType](protobuf), new Date(timestamp));
		}

		this.fireEvent('packet', robot, messageType, protobuf);

		if(callback) {
			callback();
		}
	},

	send: function (robotId, message) {
		// TODO NUCLEARNET UPGRADE THIS TO HAVE TARGET, AND RELIABLE
		// TODO emit('message', MESSAGENAME, message.toArrayBuffer(), TARGET, RELIABLE);
		this.socket.emit('message', robotId, message.encode().toArrayBuffer());
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
		// TODO NUCLEARNET DELETE THIS
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
		// TODO NUCLEARNET DELETE THIS
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
