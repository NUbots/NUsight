/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.window.NetworkStatistics', {
	extend : 'NU.view.window.Display',
	alias: 'widget.nu_network_statistics_window',
	requires: [
		'Ext.grid.Panel',
		'Ext.grid.column.Number',
		'NU.view.window.NetworkStatisticsController'
	],
	controller: 'NetworkStatistics',
	title: 'Network Statistics',
	tbar: [],
	width: 1000,
	height: 500,
	layout: 'hbox',
	overflowY: 'scroll'
});
