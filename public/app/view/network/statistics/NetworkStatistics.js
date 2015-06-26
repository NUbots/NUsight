/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.network.statistics.NetworkStatistics', {
	extend : 'Ext.panel.Panel',
	alias: 'widget.nu_network_statistics_panel',
	requires: [
		'NU.view.network.statistics.NetworkStatisticsController'
	],
	controller: 'NetworkStatistics',
	title: 'Statistics',
	layout: 'hbox',
	overflowY: 'scroll'
});
