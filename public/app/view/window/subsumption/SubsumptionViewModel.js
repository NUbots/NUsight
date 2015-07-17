/**
 * @author Monica Olejniczak
 */
Ext.define('NU.view.window.subsumption.SubsumptionViewModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.Subsumption',
	// TODO fix horrible hackery
	stores: {
		ActionRegister: Ext.create('Ext.data.Store', {
			fields: [
				{name: 'actionId', type: 'int'},
				{name: 'name', type: 'string'},
				{name: 'robotId', type: 'int'},
				{name: 'time', type: 'date'},
				{name: 'limbs', type: 'auto'}, // array
				{name: 'priority', type: 'int'}
			],
			proxy: {
				type: 'memory',
				reader: {
					type: 'json',
					rootProperty: 'items'
				}
			},
			sorters: [{
				property: 'name',
				direction: 'asc'
			}, {
				property: 'priority',
				direction: 'asc'
			}]
		}),
		ActionStateChange: Ext.create('Ext.data.Store', {
			model: Ext.create('NU.model.ActionStateChange'),
			proxy: {
				type: 'memory',
				reader: {
					type: 'json',
					rootProperty: 'items'
				}
			},
			sorters: [{
				property: 'time',
				direction: 'desc'
			}, {
				property: 'state',
				direction: 'asc'
			}]
		})
	}
});
