Ext.define('NU.controller.NetworkSettings', {
	extend: 'Deft.mvc.ViewController',
	inject: 'reactionHandlesStore',
	config: {
		reactionHandlesStore: null
	},
	control: {
		'save': {
			click: function () {
				this.save();
			}
		}
	},
	save: function () {
		var message = new API.Message();
		message.setUtcTimestamp(Date.now());
		message.setType(API.Message.Type.REACTION_HANDLES);
		var reactionHandles = new API.Message.ReactionHandles();
		this.getReactionHandlesStore().each(function (reactionHandle) {
			reactionHandles.handles.push({
				name: reactionHandle.get('fieldName'),
				enabled: reactionHandle.get('enabled')
			});
		});
		message.setReactionHandles(reactionHandles);
		NU.util.Network.broadcast(message);
	}
});
