Ext.define('NU.view.network.reactions.grid.GridViewModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.NetworkReactionsGrid',
	data: {
		robot: null
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
	},
	formulas: {
		name: function (get) {
			return get('robot').get('name') || 'Unknown';
		}
	}
});
