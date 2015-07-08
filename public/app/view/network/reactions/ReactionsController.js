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
		NU.Network.getRobotStore().each(function (robot) {
			this.createGrid(robot);
		}, this);
	},

	/**
	 * Creates the grid view for a certain robot.
	 *
	 * @param robot The robot record from the robot store.
	 */
	createGrid: function (robot) {
		var robotIP = robot.get('ipAddress');
		// Add a mapping from the robot name to the view so it can be updated later.
		this.robots[robotIP] = this.getView().add(Ext.widget('nu_network_reactions_grid_panel', {
			robot: robot
		}));
	},

	/**
	 * An event triggered when the Network class receives a new robot. This method creates the grid view associated
	 * with the robot that was added to the network.
	 *
	 * @param robot The robot record from the robot store.
	 */
	onRobotIP: function (robot) {
		this.createGrid(robot);
	},

	/**
	 * An event triggered when a packet is sent to the network.
	 *
	 * @param robot The robot record from the robot store.
	 * @param type The type of the packet sent over the network.
	 * @param packet The packet information.
	 */
	onPacket: function (robot, type, packet) {
		// Obtain the grid and the key, then fire the update event.
		var grid = this.robots[robot.get('ipAddress')];
		var key = NU.Network.getTypeMap()[type];
		grid.fireEvent('update', key);
	}

});
