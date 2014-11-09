Ext.define('NU.view.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.nu_toolbar',
    requires: 'NU.controller.Toolbar',
    controller: 'Toolbar',
    items: [{
        text: 'Localisation',
        listeners: {
            click: 'onLocalisationDisplay'
        }
    }, {
        text: 'Vision',
        listeners: {
            click: 'onVisionDisplay'
        }
    }, {
        text: 'Chart',
        listeners: {
            click: 'onChartDisplay'
        }
    }, {
        text: 'NUClear',
        listeners: {
            click: 'onNUClearDisplay'
        }
    }, {
        text: 'Classifier',
        listeners: {
            click: 'onClassifierDisplay'
        }
    }, {
        text: 'Behaviour',
        listeners: {
            click: 'onBehaviourDisplay'
        }
    }, {
        text: 'GameState',
        listeners: {
            click: 'onGameStateDisplay'
        }
    },'->', {
        text: 'Visualise',
        listeners: {
            click: 'onVisualise'
        }
    }, {
		text: 'Close All',
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
