Ext.define('NU.controller.NetworkSettings', {
	extend: 'Deft.mvc.ViewController',
	inject: 'reactionHandlersStore',
	config: {
		reactionHandlersStore: null
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
		message.setType(API.Message.Type.REACTION_HANDLERS);
		var reactionHandlers = new API.Message.ReactionHandlers();
		this.getReactionHandlersStore().each(function (reactionHandler) {
			var fieldName = reactionHandler.get('fieldName');
			var setter = 'set' + fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
			reactionHandlers[setter](reactionHandler.get('enabled'));
		});
		message.setReactionHandlers(reactionHandlers);
		NU.util.Network.broadcast(message);
	}
});
