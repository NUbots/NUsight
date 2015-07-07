/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.network.reactions.ReactionsController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.NetworkReactions',
	requires: [
		'NU.view.network.reactions.grid.Grid'
	],
	init: function () {
		this.robots = {};
		NU.Network.on({
			robotIP: this.onRobotIP,
			packet: this.onPacket,
			scope: this
		});
		// Iterate through each robot and create the dashboard panel for it.
		NU.Network.getRobotIPs().forEach(function (robotIP) {
			this.createGrid(robotIP, robotIP);
		}, this);
	},

	/**
	 * Creates the grid view for a certain robot.
	 *
	 * @param robotIP The IP address of the robot.
	 * @param robotName The name of the robot.
	 */
	createGrid: function (robotIP, robotName) {
		// Add a mapping from the robot name to the view so it can be updated later.
		this.robots[robotName] = this.getView().add(Ext.widget('nu_network_reactions_grid_panel', {
			robot: {
				name: robotName,
				IP: robotIP
			}
		}));
	},

	/**
	 * An event triggered when the Network class receives a new robot. This method creates the grid view associated
	 * with the robot that was added to the network.
	 *
	 * @param robotIP The IP address of the robot.
	 * @param robotName The name of the robot.
	 */
	onRobotIP: function (robotIP, robotName) {
		this.createGrid(robotIP, robotName);
	},

	/**
	 * An event triggered when a packet is sent to the network.
	 *
	 * @param robotIP The IP address of the robot.
	 * @param type The type of the packet sent over the network.
	 * @param packet The packet information.
	 */
	onPacket: function (robotIP, type, packet) {
		// Obtain the robot and the key.
		var robot = this.robots[robotIP];
		var key = NU.Network.getTypeMap()[type];
		robot.fireEvent('update', key);
	}

});
