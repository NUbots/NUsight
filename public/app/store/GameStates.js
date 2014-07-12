Ext.define('NU.store.GameStates', {
	extend: 'Ext.data.Store',
	model: 'NU.model.GameState',
	proxy: {
		type: 'memory',
		reader: {
			type: 'json'
		}
	},
	sorters: [{
		property: 'time',
		direction: 'desc'
	}]
});
