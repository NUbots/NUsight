Ext.define('NU.store.ReactionHandlers', {
	extend: 'Ext.data.Store',
	model: 'NU.model.ReactionHandler',
	proxy: {
		type: 'memory',
		reader: {
			type: 'json'
		}
	},
	data: [
		{ name: 'Data Points', enabled: true },
		{ name: 'Action Start', enabled: true },
		{ name: 'Action Kill', enabled: true },
		{ name: 'Register Action', enabled: true },
		{ name: 'Sensors', enabled: true },
		{ name: 'Image', enabled: true },
		{ name: 'Reaction Statistics', enabled: true },
		{ name: 'Classified Image', enabled: true },
		{ name: 'Goals', enabled: true },
		{ name: 'Balls', enabled: true },
		{ name: 'Localisation', enabled: true }
	]
});
