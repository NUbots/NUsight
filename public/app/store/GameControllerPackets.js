Ext.define('NU.store.GameControllerPackets', {
	extend: 'Ext.data.Store',
	model: 'NU.model.GameControllerPacket',
	proxy: {
		type: 'memory',
		reader: {
			type: 'json'
		}
	},
	data: [{
		time: new Date(),
		eventName: 'stateInitial',
		metadata: {}
	}, {
		time: new Date(),
		eventName: 'statePlaying',
		metadata: {
			endHalf: new Date(),
			ballFree: new Date()
		}
	}]
});
