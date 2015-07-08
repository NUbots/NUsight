/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.network.reactions.Reactions', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.nu_network_reactions_panel',
	requires: [
		'NU.view.network.reactions.ReactionsController'
	],
	controller: 'NetworkReactions',
	title: 'Reactions',
	layout: 'hbox',
	overflowY: 'scroll'
});
