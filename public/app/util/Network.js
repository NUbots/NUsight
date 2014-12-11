Ext.define('NU.util.Network', {
	mixins: {
		observable: 'Ext.util.Observable'
	},
	socket: null,
	cache: null,
	singleton: true,
	constructor: function (config) {
		this.mixins.observable.constructor.call(this, config);

		this.initConfig(config);

		this.cache = [];
	},
	init: function () {
		var robotsStore = Ext.getStore('Robots');

		this.setupSocket();

		this.builder = dcodeIO.ProtoBuf.loadProtoFile({
			root: "resources/js/proto",
			file: "messages/support/nubugger/proto/Message.proto"
		});

		window.API = this.builder.build("messages.support.nubugger.proto");
		// cry :'(
		window.API.Sensors = this.builder.build("messages.input.proto.Sensors");
        window.API.Vision = this.builder.build("messages.vision.proto");
		window.API.Behaviour = this.builder.build("messages.behaviour.proto.Behaviour");
		window.API.ActionStateChange = this.builder.build("messages.behaviour.proto.ActionStateChange");
		window.API.Image = this.builder.build("messages.input.proto.Image");
        window.API.Configuration = this.builder.build("messages.support.nubugger.proto.ConfigurationState");

		var typeMap = {};
		Ext.iterate(API.Message.Type, function (key, type) {
			typeMap[type] = key.toLowerCase();
		}, this);
		this.typeMap = typeMap;

		this.mon(robotsStore, 'add', this.onAddRobot, this);
		this.mon(robotsStore, 'update', this.onUpdateRobot, this);
		this.mon(robotsStore, 'remove', this.onRemoveRobot, this);

		var me = this;
		requestAnimationFrame(function () {
			me.onAnimationFrame();
		});

	},
	onAnimationFrame: function () {
		var me = this;

		Ext.Object.each(this.cache, function (hash, event) {
			var api_message = API.Message.decode(event.message);
			var api_event = api_message[event.name];
			var time = new Date(api_message.getUtcTimestamp().toNumber());
			delete this.cache[hash];
			this.fireEvent(event.name, event.robotIP, api_event, time);
//			console.log(event.robotIP, event.name);
		}, this);

		requestAnimationFrame(function () {
			me.onAnimationFrame();
		});
	},
	processPacket: function (packet) {
		var message, eventName, filterId, robotIP, event, hash;
		robotIP = packet.robotIP;
		message = new Uint8ClampedArray(packet.message);
		eventName = this.typeMap[message[0]];
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
			var api_message = API.Message.decode(event.message);
			var api_event = api_message[event.name];
			var time = new Date(api_message.getUtcTimestamp().toNumber());
			this.fireEvent(event.name, event.robotIP, api_event, time);
//			console.log(event.robotIP, event.name);
		}

		this.fireEvent('packet', robotIP, packet);
	},
	setupSocket: function () {

		var socket = io.connect(document.location.origin);
		socket.on('robotIP', Ext.bind(this.onRobotIP, this));
		socket.on('message', Ext.bind(this.onMessage, this));
		this.socket = socket;
	},
	onAddRobot: function (store, records, index, eOpts) {
		Ext.each(records, function (record) {
			if (record.get('ipAddress') !== "") {
				this.socket.emit('addRobot', record.get('ipAddress'), record.get('name'));
				this.fireEvent('addRobot', record.get('ipAddress'));
			}
		}, this);
	},
	onUpdateRobot: function (store, record, operation, eOpts) {
		if (eOpts.indexOf("ipAddress") !== -1) {
			// ipAddress modified
			if (record.get('ipAddress') !== "") {
				this.socket.emit('addRobot', record.get('ipAddress'));
				this.fireEvent('addRobot', record.get('ipAddress'));
			}
		}
	},
	onRemoveRobot: function (store, records, indexes, isMove, eOpts) {
		Ext.each(records, function (record) {
			this.socket.emit('removeRobot', record.get('ipAddress'));
			this.fireEvent('removeRobot', record.get('ipAddress'));
		}, this);
	},
	onRobotIP: function (robotIP, robotName) {
		var robotsStore = Ext.getStore('Robots');
		var robotIndex = robotsStore.find("ipAddress", robotIP);
		if (robotIndex === -1) {
			robotsStore.add({
				ipAddress: robotIP,
				name: robotName !== undefined ? robotName : robotIP
			});
		}
	},
	onMessage: function (robotIP, message) {
		var packet = {
			robotIP: robotIP,
			message: message
		};

		this.processPacket(packet);
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
	}
});