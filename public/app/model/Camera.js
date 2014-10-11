Ext.define('NU.model.Camera', {
	extend: 'Ext.data.Model',
	fields: [
		{name: 'id', type: 'int'},
		{name: 'name', type: 'string'},
		{name: 'enabled', type: 'boolean', defaultValue: true}
	],
	proxy: {
		type: 'memory',
		reader: {
			type: 'json'
		}
	}
});
