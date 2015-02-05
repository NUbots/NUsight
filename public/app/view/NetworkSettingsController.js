Ext.define('NU.view.NetworkSettingsController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.NetworkSettings',
	requires: [
		'NU.Network'
	],
	onSave: function () {
		this.save();
	},
	save: function () {
		var message = new API.Message();
		message.setUtcTimestamp(Date.now());
		message.setType(API.Message.Type.REACTION_HANDLES);
		var reactionHandles = new API.Message.ReactionHandles();
		this.lookupReference('grid').getStore().each(function (reactionHandle) {
			reactionHandles.handles.push({
				name: reactionHandle.get('fieldName'),
				enabled: reactionHandle.get('enabled')
			});
		});
		message.setReactionHandles(reactionHandles);
		NU.Network.broadcast(message);
	}
});
