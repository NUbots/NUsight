Ext.define('NU.view.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.nu_toolbar',
    controller: 'NU.controller.Toolbar',
    items: [{
        text: 'Add Localisation Display',
        itemId: 'add_localisation_display'
    }, {
        text: 'Add Vision Display',
        itemId: 'add_vision_display'
    }, {
        text: 'Add Chart Display',
        itemId: 'add_chart_display'
    }, {
        text: 'Add NUClear Display',
        itemId: 'add_nuclear_display'
    }, {
        text: 'Add Classifier Display',
        itemId: 'add_classifier_display'
    }, {
        text: 'Add Behaviour Display',
        itemId: 'add_behaviour_display'
    },'->', {
        text: 'Visualise',
        itemId: 'visualise'
    }, {
		text: 'Close All',
		itemId: 'close_all'
	}, {
		text: 'Robots',
		itemId: 'list_robots',
		iconCls: 'icon-cog'
	}]
});
