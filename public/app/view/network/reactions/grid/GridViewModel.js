Ext.define('NU.view.network.reactions.grid.GridViewModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.NetworkReactionsGrid',
	data: {
		name: ''
	},
	stores: {
		grid: {
			fields: [
				'name',
				'type',
				'packets',
				'enabled'
			],
			sorters: [{
				property: 'name',
				direction: 'asc'
			}]
		}
	}
});
