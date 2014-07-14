Ext.define('NU.store.ReactionHandles', {
	extend: 'Ext.data.Store',
	model: 'NU.model.ReactionHandle',
	proxy: {
		type: 'memory',
		reader: {
			type: 'json'
		}
	},
	data: [
		{ name: 'Data Points', fieldName: 'data_points', enabled: true },
		{ name: 'Game Controller', fieldName: 'game_controller', enabled: true },
		{ name: 'Behaviour', fieldName: 'behaviour', enabled: true },
		{ name: 'Sensors', fieldName: 'sensors', enabled: true },
		{ name: 'Image', fieldName: 'image', enabled: true },
		{ name: 'Reaction Statistics', fieldName: 'reaction_statistics', enabled: false },
		{ name: 'Classified Image', fieldName: 'classified_image', enabled: true },
		{ name: 'Goals', fieldName: 'goals', enabled: true },
		{ name: 'Balls', fieldName: 'balls', enabled: true },
		{ name: 'Localisation', fieldName: 'localisation', enabled: true }
	]
});
