/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.network.reactions.grid.GridController', {
	extend: 'NU.view.window.DisplayController',
	alias: 'controller.NetworkReactionsGrid',
	init: function () {
		var viewModel = this.getViewModel();
		var robot = this.robot = this.getView().getRobot();
		this.messages = {};
		this.store = viewModel.getStore('grid');
		viewModel.set('robot', robot);

		this.mon(NU.Network, {
			addType: this.addType,
			dropType: this.dropType,
			scope: this
		});

		this.addData(this.store);
		NU.Network.sendCommand('get_reaction_handles', robot.get('id'));
		this.mon(NU.Network, 'message.support.nubugger.proto.ReactionHandles', this.onReactionHandles, this);
	},

	addType: function (type) {
		var i = type.lastIndexOf('.');
		var name = i === -1 ? type : type.substr(i + 1);
		this.messages[type.toLowerCase()] = this.store.add({
			name: name,
			type: type,
			packets: 0,
			enabled: true
		})[0];
	},

	dropType: function (type) {

	},

	/**
	 * An event triggered when the user selects the record button. It sets the robot record to either recording or
	 * not recording based on its previous state.
	 */
	onRecord: function () {
		this.robot.set('recording', !this.robot.get('recording'));
	},

	/**
	 * An event triggered when the user changes the enabled state of a reactions handle.
	 *
	 * @param column The checkcolumn that was altered.
	 * @param rowIndex The row within the store that had the checkbox toggled.
	 * @param checked The new state of the checkbox.
	 */
	onCheckChange: function (column, rowIndex, checked) {
		var record = this.store.getAt(rowIndex);
		// Update the state of the record enabled field.
		record.set('enabled', checked);

		// Create the reaction handles message and add the record data.
		var reactionHandles = new API.message.support.nubugger.proto.ReactionHandles();
		reactionHandles.handles.push({
			type: record.get('type'),
			enabled: record.get('enabled')
		});

		// Send the message.
		NU.Network.send(reactionHandles, this.robot.get('id'), true);
	},

	/**
	 * An event triggered when the reaction handles command is received.
	 *
	 * @param robotId The id of the robot.
	 * @param reactionHandles The reaction handles data.
	 * @param timestamp The time the command was received.
	 */
	onReactionHandles: function (robot, reactionHandles, timestamp) {
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
		var message = this.messages[key.toLowerCase()];
		if (message) {
			message.set('packets', message.get('packets') + 1);
		}
	}

});
