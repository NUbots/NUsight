Ext.define('NU.store.ActionStateChange', {
	extend: 'Ext.data.Store',
	model: 'NU.model.ActionStateChange',
	proxy: {
		type: 'memory',
		reader: {
			type: 'json',
			rootProperty: 'items'
		}
	},
	sorters: [{
		property: 'time',
		direction: 'desc'
	}, {
		property: 'state',
		direction: 'asc'
	}]
});
