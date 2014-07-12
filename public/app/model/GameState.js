Ext.define('NU.model.GameState', {
	extend: 'Ext.data.Model',
	fields: [
		{name: 'time', type: 'date'},
		{name: 'robotIP', type: 'string'},
		{name: 'eventName', type: 'string'},
		{name: 'state', type: 'auto'} // full state
	]
});