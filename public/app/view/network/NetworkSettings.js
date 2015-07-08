Ext.define('NU.view.network.NetworkSettings', {
	extend: 'Ext.tab.Panel',
	requires: [
		'NU.view.robot.List',
		'NU.view.network.reactions.Reactions'
	],
	alias: 'widget.networksettings',
	items: [{
		title: 'Robots',
		xtype: 'robotlist'
	}, {
		xtype: 'nu_network_reactions'
	}]
});
