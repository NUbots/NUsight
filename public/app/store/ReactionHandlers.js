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
		{ name: 'Data Points', fieldName: 'dataPoints', enabled: true },
		{ name: 'Action Start', fieldName: 'actionStart', enabled: true },
		{ name: 'Action Kill', fieldName: 'actionKill', enabled: true },
		{ name: 'Register Action', fieldName: 'registerAction', enabled: true },
		{ name: 'Sensors', fieldName: 'sensors', enabled: true },
		{ name: 'Image', fieldName: 'image', enabled: true },
		{ name: 'Reaction Statistics', fieldName: 'reactionStatistics', enabled: false },
		{ name: 'Classified Image', fieldName: 'classifiedImage', enabled: true },
		{ name: 'Goals', fieldName: 'goals', enabled: true },
		{ name: 'Balls', fieldName: 'balls', enabled: true },
		{ name: 'Localisation', fieldName: 'localisation', enabled: true }
	]
});
