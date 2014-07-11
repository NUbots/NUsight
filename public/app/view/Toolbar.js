Ext.define('NU.view.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.nu_toolbar',
    controller: 'NU.controller.Toolbar',
    items: [{
        text: 'Localisation',
        itemId: 'add_localisation_display'
    }, {
        text: 'Vision',
        itemId: 'add_vision_display'
    }, {
        text: 'Chart',
        itemId: 'add_chart_display'
    }, {
        text: 'NUClear',
        itemId: 'add_nuclear_display'
    }, {
        text: 'Classifier',
        itemId: 'add_classifier_display'
    }, {
        text: 'Behaviour',
        itemId: 'add_behaviour_display'
    }, {
        text: 'GameState',
        itemId: 'add_gamestate_display'
    },'->', {
        text: 'Visualise',
        itemId: 'visualise'
    }, {
		text: 'Close All',
		itemId: 'close_all'
	}, {
		text: 'Settings',
		itemId: 'network_settings',
		iconCls: 'icon-cog'
	}]
});
