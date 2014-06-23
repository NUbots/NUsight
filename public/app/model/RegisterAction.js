Ext.define('NU.model.RegisterAction', {
	extend: 'Ext.data.Model',
	fields: [
		{name: 'id', type: 'int'},
		{name: 'name', type: 'string'},
		{name: 'limbs', type: 'auto'} // array
	]
});
