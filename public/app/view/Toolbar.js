Ext.define('NU.view.Toolbar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.nu_toolbar',
    requires: 'NU.view.ToolbarController',
    controller: 'Toolbar',
    layout: {
        overflowHandler: 'Menu'
    },
    items: [{
        text: 'Dashboard',
        listeners: {
            click: 'onDashboardDisplay'
        }
    }, {
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
        text: 'Subsumption',
        listeners: {
            click: 'onSubsumptionDisplay'
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
        text: 'Configuration',
        iconCls: 'icon-cog',
        listeners: {
            click: 'onConfiguration'
        }
	}, {
		text: 'Settings',
		iconCls: 'icon-cog',
        listeners: {
            click: 'onNetworkSettings'
        }
	}, {
        type: 'refresh',
        iconCls: 'x-tool-img x-tool-refresh',
        tooltip: 'Reconnect robots',
        overflowText: 'Reconnect',
        listeners: {
            click: 'onReconnect'
        }
    }]
});
