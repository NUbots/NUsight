Ext.define('NU.model.GameControllerPacket', {
	extend: 'Ext.data.Model',
	fields: [
		{name: 'time', type: 'date'},
		{name: 'eventName', type: 'string'},
		{name: 'metadata', type: 'auto'} // unstructured supporting metadata
	]
});