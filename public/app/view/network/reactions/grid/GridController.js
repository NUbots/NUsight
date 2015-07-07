/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.network.reactions.grid.GridController', {
	extend: 'NU.view.window.DisplayController',
	alias: 'controller.NetworkReactionsGrid',
	init: function () {
		var viewModel = this.getViewModel();
		this.messages = {};
		this.store = viewModel.getStore('grid');
		var robot = this.getView().getRobot();
		viewModel.set('name', robot.name);
		this.addData(this.store);
		NU.Network.sendCommand(robot.IP, 'get_reaction_handles');
		NU.Network.on('reaction_handles', this.onReactionHandles, this);
	},

	/**
	 * Add the data dynamically to the view model based off the message type enumeration.
	 *
	 * @param store The grid store in the view model.
	 */
	addData: function (store) {
		// Iterate through every message type.
		Ext.Object.each(API.Message.Type, function (key, value) {
			if (value !== API.Message.Type.PING) {
				// Capitalise the first letter and replace each underscore with a space.
				var name = key.substring(0, 1).toUpperCase() + key.substring(1).toLowerCase().replace(/_/g, ' ');
				// Add the key to the data and initialise its value.
				this.messages[key.toLowerCase()] = store.add({
					name: name,
					type: value,
					packets: 0,
					enabled: true
				})[0];
			}
		}, this);
	},

	/**
	 * An event triggered when the user changes the enabled state of a reactions handle.
	 *
	 * @param column The checkcolumn that was altered.
	 * @param rowIndex The row within the store that had the checkbox toggled.
	 * @param checked The new state of the checbox.
	 */
	onCheckChange: function (column, rowIndex, checked) {
		var record = this.store.getAt(rowIndex);
		// Update the state of the record enabled field.
		record.set('enabled', checked);
		// Create the reaction handles message and add the record data.
		var message = NU.Network.createMessage(API.Message.Type.REACTION_HANDLES, 0);
		var reactionHandles = new API.Message.ReactionHandles();
		reactionHandles.handles.push({
			type: record.get('type'),
			enabled: record.get('enabled')
		});
		message.setReactionHandles(reactionHandles);
		// Broadcast the message.
		NU.Network.broadcast(message);
	},

	/**
	 * An event triggered when the reaction handles command is received.
	 *
	 * @param robotIP The IP address of the robot.
	 * @param reactionHandles The reaction handles data.
	 * @param timestamp The time the command was received.
	 */
	onReactionHandles: function (robotIP, reactionHandles, timestamp) {
		var handles = reactionHandles.handles;
		Ext.each(handles, function (handle) {
			var message = this.messages[NU.Network.typeMap[handle.type]];
			if (message) {
				message.set('enabled', handle.enabled);
			}
		}, this);
	},

	/**
	 * Updates the store record that is associated with a particular key.
	 *
	 * @param key The store key.
	 */
	onUpdate: function (key) {
		var message = this.messages[key];
		if (message) {
			message.set('packets', message.get('packets') + 1);
		}
	}

});
