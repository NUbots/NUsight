Ext.define('Ext.ux.NU.DisplayWindow', {
	extend : 'Ext.Window',
	alias : ['widget.nu.display_window'],
	itemId: "display_window",
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
				//{robotIP: '192.168.137.42'},
				//{robotIP: '145.144.172.182'},
				//{robotIP: '145.144.172.183'},
				//{robotIP: '145.144.172.184'},
				//{robotIP: '145.144.172.185'},
				//{robotIP: '145.144.172.186'},
				//{robotIP: '10.0.1.41'},
				//{robotIP: '10.0.1.42'},
				//{robotIP: '10.0.1.43'},
				//{robotIP: '10.0.1.44'},
				//{robotIP: '10.0.1.45'},
				//{robotIP: '10.0.1.46'},
				//{robotIP: '10.0.1.51'},
				//{robotIP: '10.0.1.52'},
				//{robotIP: '10.0.1.53'},
				//{robotIP: '10.0.1.54'},
				{robotIP: '10.0.1.52'},
                //{robotIP: '10.0.1.56'},
				//{robotIP: '10.0.1.56'}
			]
		}),
		listeners: {
			afterRender: function () {
				
				this.setValue(this.up("#display_window").robotIP);
				
			},
			select: function (combo, records, eOpts) {
				
				var robotIP = records[0].data.robotIP;
				
				var window = this.up("#display_window").robotIP = robotIP;
				
			}
		}
	}]
});