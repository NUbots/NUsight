Ext.define('Ext.ux.NU.DisplayWindow', {
	extend : 'Ext.Window',
	alias : ['widget.nu.network_window'],
	itemId: "network_window",
	constrain: true,
	robotIP: null,
	tbar: [{
		itemId: 'robotIP',
		fieldLabel: 'Robot',
		labelWidth: 40,
		xtype: 'combo',
		queryMode: 'local',
		forceSelection: true,
		editable: false,
		displayField: 'robotIP',
		valueField: 'robotIP',
		store: new Ext.data.JsonStore({
			fields: ['robotIP'],
			data: [
				{robotIP: '145.144.174.186'},
				{robotIP: '10.0.1.42'},
				{robotIP: '10.0.1.43'},
				{robotIP: '10.0.1.44'},
				{robotIP: '10.0.1.45'},
				{robotIP: '10.0.1.46'}
			]
		}),
		listeners: {
			afterRender: function () {
				
				this.setValue(this.up("#network_window").robotIP);
				
			},
			select: function (combo, records, eOpts) {
				
				var robotIP = records[0].data.robotIP;
				
				var window = this.up("#network_window").robotIP = robotIP;
				
			}
		}
	}]
});