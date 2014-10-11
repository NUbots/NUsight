Ext.define('NU.store.Camera', {
	extend: 'Ext.data.Store',
	requires: 'NU.model.Camera',
	model: 'NU.model.Camera',
	data: [
		{id: 0, name: 'Camera 0', enabled: true},
		{id: 1, name: 'Camera 1', enabled: true},
		{id: 2, name: 'Camera 2', enabled: true},
		{id: 3, name: 'Camera 3', enabled: true},
		{id: 4, name: 'Camera 4', enabled: true},
		{id: 5, name: 'Camera 5', enabled: true}
	]
});
