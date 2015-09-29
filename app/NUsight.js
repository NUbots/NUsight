//var Robot = require('./Robot');
//var RobotList = require('./RobotList');
var Client = require('./Client');
var NUClearNet = require('nuclearnet.js');
var fs = require('fs');
var util = require('util');

function NUsight (io) {

	this.io = io;
	this.clients = [];
	this.files = [];
	this.robots = [];
	this.recordings = {};
	this.network = new NUClearNet('nusight', '238.158.129.230', 7447);

	// Robot joined
	this.network.on('nuclear_join', function (name) {
		console.log('Robot', name, 'connected.');

		var robot;

		// If we have never seen this robot before
		if (this.robots[name] === undefined) {
			robot = { name: name, enabled: true, recording: false };
			this.robots.push(robot);
		}
		else {
			this.robots[name].enabled = true;
		}

		this.clients.forEach(function (client) {
			client.socket.emit('updateRobot', robot);
		}, this);
	}.bind(this));

	// Robot left
	this.network.on('nuclear_leave', function (name) {
		console.log('Robot', name, 'disconnected.');

		// This robot is no longer active
		this.robots[name].enabled = false;

		// Send a message to all clients that this disconnected
		this.clients.forEach(function (client) {
			client.socket.emit('updateRobot', robot);
		});
	}.bind(this));

	this.io.sockets.on('connection', function (socket) {

		console.log('New web client', this.clients.length);

		var client = new Client(socket);

		this.clients.push(client);

		// Send all of our current robots
		this.robots.forEach(function (robot) {
			socket.emit('updateRobot', robot);
		}, this);

		socket.on('message', function (typeName, data, target, reliable) {
			this.network.send(typeName, data, target, reliable);
		}.bind(this));

		socket.on('disconnect', function () {
			console.log('Lost web client', this.clients.length);

			// Remove our client from the list
			var client = this.clients.splice(this.clients.indexOf(client), 1);

			// Remove all our listeners
			Object.keys(client[0].listeners).forEach(function (key) {
				this.network.removeListener(key, client[0].listeners[key]);
			}, this);
		}.bind(this));

		socket.on('addListener', function (socket, messageType) {
			// Add a callback function for this
			client.listeners[messageType] = function (source, data) {
				this.socket.emit('message', source.name, messageType, data);
			}.bind(client);

			// Link it to the NUClear networking
			this.network.on(messageType, client.listeners[messageType]);
		}.bind(this, client));

		socket.on('removeListener', function (socket, messageType) {
			// Remove listeners and stop sending stuff
			this.network.removeListener(messageType, client.listeners[messageType]);
			delete client.listeners[messageType];
		}.bind(this, socket));

		socket.on('recordRobots', function (robotIds, recording) {
			robotIds.forEach(function (robotId) {
				var robot = this.robots[robotId];

				if(!robot.recording && recording) {
					// Make our log directory
					try { fs.mkdirSync('logs'); } catch(e) {}
					try { fs.mkdirSync('logs/' + this.host + "_" + this.port); } catch(e) {}

					// Create a recording file
					this.recordings[robotId] = fs.createWriteStream('logs/' + this.host + "_" + this.port + '/' + Date.now() + '.nbs');
				}
				else if(robot.recording && !recording) {
					// End our recording file and delete the reference to it
					this.recordings[robotId].end();
					delete this.recordings[robotId];
				}

			}, this);

		}.bind(this));

	}.bind(this));

}

module.exports = NUsight;
