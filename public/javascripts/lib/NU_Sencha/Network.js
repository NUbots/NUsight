Ext.define('NU.Network', {
	extend: 'Ext.util.Observable',
	config: {
		robotIPs: []
	},
	singleton: true,
	constructor: function () {
		
		var self;
		
		self = this;
		
		this.addEvents(
			'robot_ips',
			'sensor_data',
			'vision',
			'localisation'
		);
		
		self.setupSocket();
		
		self.callParent(arguments);
		
		return self;
		
	},
	setupSocket: function () {
		
		var self, socket;
		
		self = this;
		
		socket = io.connect(document.location.origin);
		
		socket.on('robot_ips', function (robotIPs) {
			
			self.setRobotIPs(robotIPs);
			setTimeout(function () {	
				self.fireEvent('robot_ips', self.robotIPs);
			}, 1000); // hack since display isn't rendered yet :(
			
		});
		
		socket.on('message', function (robotIP, message) {
			
			var api_message, array, stream, eventName;
			
			api_message = new API.Message;
			array = Base64Binary.decodeArrayBuffer(message);
			stream = new PROTO.ArrayBufferStream(array, array.byteLength);
			api_message.ParseFromStream(stream);
			
			eventName = API.Message.Type[api_message.type].toLowerCase();
			
			//console.log(eventName);
			
			self.fireEvent(eventName, robotIP, api_message);
		});
		
	},
	listeners: {
		vision: function () {
			//console.log('yes')
		}
	}
});