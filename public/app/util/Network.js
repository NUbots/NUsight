Ext.define('NU.util.Network', {
	extend: 'Ext.util.Observable',
	config: {
		socket: null,
		robotsStore: null,
		cache: null
	},
	inject: [
		'robotsStore'
	],
	singleton: true,
	constructor: function () {

		this.initConfig();

		this.setCache([]);

		this.addEvents(
			'robot_ip',
			'sensor_data',
			'vision',
			'localisation'
		);

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
		window.API.Image = this.builder.build("messages.input.proto.Image")

		var typeMap = {};
		Ext.iterate(API.Message.Type, function (key, type) {
			var eventName = key.toLowerCase();
			typeMap[type] = eventName;
		}, this);
		this.typeMap = typeMap;

		this.mon(this.getRobotsStore(), 'add', this.onAddRobot, this);
		this.mon(this.getRobotsStore(), 'update', this.onUpdateRobot, this);
		this.mon(this.getRobotsStore(), 'remove', this.onRemoveRobot, this);

		var me = this;
		requestAnimationFrame(function () {
			me.onAnimationFrame();
		});

		return this.callParent(arguments);

	},
	onAnimationFrame: function () {
		var me = this;

		var cache = this.getCache();
		Ext.Object.each(cache, function (hash, event) {
			var api_message = API.Message.decode(event.message);
			var api_event = api_message[event.name];
			var time = new Date(api_message.getUtcTimestamp().toNumber());
			this.fireEvent(event.name, event.robotIP, api_event, time);
//			console.log(event.robotIP, event.name);
			delete cache[hash];
		}, this);

		requestAnimationFrame(function () {
			me.onAnimationFrame();
		});
	},
	processPacket: function (packet) {
		var message, eventName, robotIP, event, cache, hash;
		robotIP = packet.robotIP;
		message = new Uint8ClampedArray(packet.message);
		eventName = this.typeMap[message[0]];

		cache = this.getCache();
		hash = eventName + ':' + robotIP;
		event = {
			name: eventName,
			robotIP: robotIP,
			message: packet.message.slice(1)
		};
		cache[hash] = event;
	},
	setupSocket: function () {

		var socket = io.connect(document.location.origin);
		socket.on('robotIP', Ext.bind(this.onRobotIP, this));
		socket.on('message', Ext.bind(this.onMessage, this));
		this.setSocket(socket);
	},
	onAddRobot: function (store, records, index, eOpts) {
		Ext.each(records, function (record) {
			if (record.get('ipAddress') !== "") {
				this.getSocket().emit('addRobot', record.get('ipAddress'), record.get('name'));
				this.fireEvent('addRobot', record.get('ipAddress'));
			}
		}, this);
	},
	onUpdateRobot: function (store, record, operation, eOpts) {
		if (eOpts.indexOf("ipAddress") !== -1) {
			// ipAddress modified
			if (record.get('ipAddress') !== "") {
				this.getSocket().emit('addRobot', record.get('ipAddress'));
				this.fireEvent('addRobot', record.get('ipAddress'));
			}
		}
	},
	onRemoveRobot: function (store, records, indexes, isMove, eOpts) {
		Ext.each(records, function (record) {
			this.getSocket().emit('removeRobot', record.get('ipAddress'));
			this.fireEvent('removeRobot', record.get('ipAddress'));
		}, this);
	},
	onRobotIP: function (robotIP, robotName) {
		var store = this.getRobotsStore();
		var robotIndex = store.find("ipAddress", robotIP);
		if (robotIndex === -1) {
			store.add({
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
		this.getSocket().emit('message', robotIP, message.encode().toArrayBuffer());
	},
	broadcast: function (message) {
		this.getSocket().emit('broadcast', message.encode().toArrayBuffer());
	},
	getRobotIPs: function () {
		var result = [];
		this.getRobotsStore().each(function (record) {
			result.push(record.get('ipAddress'));
		});
		return result;
	}
});