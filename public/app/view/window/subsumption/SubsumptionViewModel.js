/**
 * @author Monica Olejniczak
 */
Ext.define('NU.view.window.subsumption.SubsumptionViewModel', {
	extend: 'Ext.app.ViewModel',
	alias: 'viewmodel.Subsumption',
	requires: [
		'NU.model.ActionStateChange'
	],
	stores: {
		ActionRegister: {
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
		},
		ActionStateChange: {
			model: 'NU.model.ActionStateChange',
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
		}
	}
});
