//var Robot = require('./Robot');
//var RobotList = require('./RobotList');
var Client = require('./Client');
var NUClearNet = require('nuclearnet.js').NUClearNet;
var fs = require('fs');
var util = require('util');
var int53 = require('int53');

function NUsight (io) {

	this.io = io;
	this.clients = [];
	this.files = [];
	this.robots = {};
	this.recordings = {};
	console.log(NUClearNet);
	this.network = new NUClearNet();
	this.network.connect({
		name: 'nusight',
	});

	// Robot joined
	this.network.on('nuclear_join', function (peer) {
		var name = peer.name;
		var address = peer.address;
		console.log(address);
		if(name === 'nusight') {
			return;
		}

		console.log('Robot', name, 'connected.');

		var robot;

		// If we have never seen this robot before
		if (this.robots[name] === undefined) {
			robot = { id: name, host: address, enabled: true, recording: false };
			this.robots[name] = robot;
		}
		else {
			robot = this.robots[name];
			robot.enabled = true;
		}

		this.clients.forEach(function (client) {
			client.socket.emit('updateRobot', robot);
		}, this);
	}.bind(this));

	// Robot left
	this.network.on('nuclear_leave', function (peer) {
		var name = peer.name;

		if(name === 'nusight') {
			return;
		}
		console.log('Robot', name, 'disconnected.');

		var robot = this.robots[name];

		// This robot is no longer active
		robot.enabled = false;

		// Send a message to all clients that this disconnected
		this.clients.forEach(function (client) {
			client.socket.emit('updateRobot', robot);
		});
	}.bind(this));

	// We started listening to a type
	this.network.on('listen', function (event) {
		console.log('Started listening to', event);
	});

	// We stopped listening to a type
	this.network.on('unlisten', function (event) {
		console.log('Stopped listening to', event);
	});

	this.io.on('connection', function (socket) {

		console.log('New web client', this.clients.length);

		var client = new Client(socket);

		this.clients.push(client);

		// Send all of our current robots
		Object.keys(this.robots).forEach(function (key) {
			socket.emit('updateRobot', this.robots[key]);
		}, this);

		socket.on('message', function (typeName, data, target, reliable) {
			this.network.send({
				type: typeName, 
				payload: data, 
				target: target, 
				reliable: reliable});
		}.bind(this));

		socket.on('disconnect', function () {
			console.log('Lost web client', this.clients.length);

			// Remove our client from the list
			var client = this.clients.splice(this.clients.indexOf(client), 1);

			// Remove all our listeners
			Object.keys(client[0].listeners).forEach(function (key) {
				this.network.removeListener('NUsight<' + key + '>', client[0].listeners[key]);
			}, this);
		}.bind(this));

		socket.on('addType', function (socket, messageType) {
			console.log('Started listening to', messageType);

			// Add a callback function for this
			client.listeners[messageType] = function (packet) {
				var source = packet.peer;
				var data = packet.payload;

				var filterId = data.readUInt8(0);
				var timestamp = int53.readUInt64LE(data, 1);
				var protobuf = data.slice(9);

				this.sendMessage({ id: source.name, host: source.address }, messageType, protobuf, filterId, timestamp);
			}.bind(client);

			// Link it to the NUClear networking using the NUsight wrapper
			this.network.on('NUsight<' + messageType + '>', client.listeners[messageType]);
		}.bind(this, client));

		socket.on('dropType', function (client, messageType) {
			console.log('Stopped listening to', messageType);
			// Remove listeners and stop sending stuff
			var func = client.listeners[messageType];
			if(func) {
				this.network.removeListener('NUsight<' + messageType + '>', func);
				delete client.listeners[messageType];
			}
		}.bind(this, client));

		socket.on('recordRobots', function (robotIds, recording) {
			robotIds.forEach(function (robotId) {
				var robot = this.robots[robotId];

				if(!robot.recording && recording) {
					console.log('Started recording', robotId);
					robot.recording = true;

					// Make our log directory
					try { fs.mkdirSync('logs'); } catch(e) {}
					try { fs.mkdirSync('logs/' + robotId); } catch(e) {}

					// Create a recording file
					this.recordings[robotId] = fs.createWriteStream('logs/' + robotId + '/' + Date.now() + '.nbs');

					// TODO make a callback that gets all network data from this robot
				}
				else if(robot.recording && !recording) {
					console.log('Stopped recording', robotId);
					robot.recording = false;
					// End our recording file and delete the reference to it
					this.recordings[robotId].end();
					delete this.recordings[robotId];
				}

			}, this);

		}.bind(this));

	}.bind(this));

}

module.exports = NUsight;
