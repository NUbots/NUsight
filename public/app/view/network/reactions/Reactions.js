/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.network.reactions.Reactions', {
	extend: 'Ext.container.Container',
	alias: 'widget.nu_network_reactions',
	requires: [
		'Ext.layout.container.Column',
		'NU.view.network.reactions.ReactionsController'
	],
	controller: 'NetworkReactions',
	title: 'Reactions',
	layout: 'column',
	autoScroll: true
});
