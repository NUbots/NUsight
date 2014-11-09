Ext.define('NU.view.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.nu_toolbar',
    requires: 'NU.controller.Toolbar',
    controller: 'Toolbar',
    items: [{
        text: 'Localisation',
        itemId: 'add_localisation_display',
        listeners: {
            click: 'onLocalisationDisplay'
        }
    }, {
        text: 'Vision',
        itemId: 'add_vision_display',
        listeners: {
            click: 'onVisionDisplay'
        }
    }, {
        text: 'Chart',
        itemId: 'add_chart_display',
        listeners: {
            click: 'onChartDisplay'
        }
    }, {
        text: 'NUClear',
        itemId: 'add_nuclear_display',
        listeners: {
            click: 'onNUClearDisplay'
        }
    }, {
        text: 'Classifier',
        itemId: 'add_classifier_display',
        listeners: {
            click: 'onClassifierDisplay'
        }
    }, {
        text: 'Behaviour',
        itemId: 'add_behaviour_display',
        listeners: {
            click: 'onBehaviourDisplay'
        }
    }, {
        text: 'GameState',
        itemId: 'add_gamestate_display',
        listeners: {
            click: 'onGameStateDisplay'
        }
    },'->', {
        text: 'Visualise',
        itemId: 'visualise',
        listeners: {
            click: 'onVisualise'
        }
    }, {
		text: 'Close All',
		itemId: 'close_all',
        listeners: {
            click: 'onCloseAll'
        }
	}, {
		text: 'Settings',
		itemId: 'network_settings',
		iconCls: 'icon-cog',
        listeners: {
            click: 'onNetworkSettings'
        }
	}]
});
