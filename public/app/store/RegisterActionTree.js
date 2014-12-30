Ext.define('NU.store.RegisterActionTree', {
	extend: 'Ext.data.TreeStore',
	model: 'NU.model.RegisterAction',
	proxy: {
		type: 'memory',
		reader: {
			type: 'json',
			rootProperty: 'items'
		}
	}
});
