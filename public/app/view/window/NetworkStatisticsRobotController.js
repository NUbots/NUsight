/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.window.NetworkStatisticsRobotController', {
	extend: 'NU.view.window.DisplayController',
	alias: 'controller.NetworkStatisticsRobot',
	init: function () {
		var viewModel = this.getViewModel();
		viewModel.set('name', this.getView().getRobot().name);
		this.messages = {};
		this.addData(viewModel.getStore('grid'));
		NU.Network.on('packet', this.onPacket, this);
	},

	/**
	 * Add the data dynamically to the view model based off the message type enumeration.
	 *
	 * @param store The grid store in the view model.
	 */
	addData: function (store) {
		// Iterate through every message type.
		Ext.Object.each(API.Message.Type, function (key, value) {
			// Capitalise the first letter and replace each underscore with a space.
			var type = key.substring(0, 1) + key.substring(1).toLowerCase().replace('_', ' ');
			// Add the key to the data and initialise its value.
			this.messages[key.toLowerCase()] = store.add({
				type: type,
				value: 0
			})[0];
		}, this);
	},

	/**
	 * Updates the store record that is associated with a particular key.
	 *
	 * @param key The store key.
	 */
	onUpdate: function (key) {
		this.messages[key].set('value', this.messages[key].get('value') + 1);
	}

});
