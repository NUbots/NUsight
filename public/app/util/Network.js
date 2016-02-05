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

		// We use the command protocol buffer
		this.loadProto('message.support.nubugger.proto.Command');

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

			// Tell socket.io it can send a new packet
			event.ackCallback();
		}, this);
	},

	loadProto: function (protocolBuffer) {
		// Load the protocol buffer file and build it
		dcodeIO.ProtoBuf.loadProtoFile({
			root: 'resources/js/proto',
			file: protocolBuffer.replace(/\./g, '/') + '.proto'
		}, this.protoBuilder);
		var proto = this.protoBuilder.build(protocolBuffer);

		// Update our API
		window.API = this.protoBuilder.build();

		return proto;
	},

	setupSocket: function () {
		var socket = io.connect(document.location.origin);
		socket.on('updateRobot', this.updateRobot.bind(this));
		socket.on('message', this.onMessage.bind(this));

		// When reconnecting, re request all of the network types we wanted
		socket.on('connect', function () {
			Object.keys(this.deserialisers).forEach(function (key) {
				this.socket.emit('addType', key);
			}, this);
		}.bind(this));

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
				key !== 'addType' &&
				key !== 'dropType' &&
				key !== 'addRobot' &&
				key !== 'removeRobot' &&
				!this.hasListener(key.toLowerCase())) {

				var proto = this.loadProto(key);

				// Add a deserialiser for this
				this.deserialisers[key] = function (data) {
					return proto.decode(data);
				};

				this.fireEvent('addType', key);

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
			messageType !== 'addType' &&
			messageType !== 'dropType' &&
			messageType !== 'addRobot' &&
			messageType !== 'removeRobot' &&
			!this.hasListener(messageType.toLowerCase())) {
			delete this.deserialisers[messageType];
			this.fireEvent('dropType', messageType);
			this.socket.emit('dropType', messageType);
		}
	},

	recordRobots: function (recording) {
		var robotStore = this.getRobotStore();
		var robotIds = [];

		robotStore.each(function (robot) {
			var isRecording = robot.get('recording');
			if (recording !== isRecording) {
				robotIds.push(robot.get('id'));
				robot.set('recording', recording);
			}
		}, this);

		this.socket.emit('recordRobots', robotIds, recording);
	},

	updateRobot: function (robot) {
		// Try to find this robot
		if (this.getRobotStore().find('id', robot.id) === -1) {

			var record = this.getRobotStore().add(robot)[0];

			this.fireEvent('addRobot', record);
		}
		else {
			var record = this.getRobotStore().findRecord('id', robot.id);
			record.set(robot);
		}
	},

	onMessage: function (robot, messageType, protobuf, filterId, timestamp, ackCallback) {
		var record = this.getRobotStore().findRecord('id', robot.id);
		if(record) {
			if (filterId > 0) {
				// Store in the cache for the next animation frame
				var hash = messageType + ':' + filterId + ':' + record.get('id');
				this.cache[hash] = {
					messageType: messageType,
					robot: record,
					protobuf: protobuf,
					timestamp: new Date(timestamp),
					ackCallback: ackCallback
				};
			}
			else if (this.hasListener(messageType.toLowerCase())) {
				// Do it right away
				this.fireEvent(messageType, record, this.deserialisers[messageType](protobuf), new Date(timestamp));
			}

			this.fireEvent('packet', record, messageType, protobuf);
		}
	},

	send: function (message, target, reliable) {

		// Shunt up our types
		if(typeof target === 'boolean') {
			reliable = target;
			target = undefined;
		}

		this.socket.emit('message', message.$type.toString().substr(1), message.toArrayBuffer(), target, reliable);
	},

	getRobotStore: function () {
		return Ext.getStore('Robots');
	},

	/**
	 * Creates a message and command of a particular name to send over the network.
	 *
	 * @param command The name of the command.
	 * @param target The id of the robot associated with the command.
	 */
	sendCommand: function (command, target) {

		var msg = new API.message.support.nubugger.proto.Command();
		msg.setCommand(command);

		this.send(msg, target, true);
	}
});
