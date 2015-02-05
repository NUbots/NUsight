/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.window.Configuration', {
    extend : 'NU.view.window.Display',
    requires: [
        'NU.view.window.ConfigurationViewModel',
        'NU.view.column.Widget',
        'NU.view.factory.Widget',
        'NU.view.window.ConfigurationController'
    ],
    alias: 'widget.nu_configuration_window',
    controller: 'Configuration',
    title: 'Configuration',
    width: 1000,
    height: 550,
    listeners: {
        close: 'onClose'
    },
    tbar: [{
        xtype: 'robot_selector',
        listeners: {
            selectRobot: 'onSelectRobot'
        }
    }, {
        xtype: 'component',
        reference: 'currentMode',
        tpl: '<strong>Current mode: </strong> {name}',
        flex: 2,
        listeners: {
            afterRender: 'onCurrentModeAfterRender'
        }
    }, {
        xtype: 'button',
        reference: 'save',
        text: 'Save',
        handler: 'onSave',
        flex: 0.5,
        listeners: {
            afterRender: 'onSaveAfterRender'
        }
    }, {
        xtype: 'button',
        reference: 'live',
        text: 'Live',
        enableToggle: true,
        flex: 1,
        toggleHandler: 'onToggleMode',
        listeners: {
            afterRender: 'onLiveAfterRender'
        }
    }],
    items: [{
        xtype: 'treepanel',
        reference: 'configurations',
        referenceHolder: true,
        viewModel: {
            type: 'Configuration'
        },
        bind: {
            store: '{store}'
        },
        title: 'Robot Configurations',
        autoLoad: true,
        rootVisible: false,
        rowLines: true,
        columnLines: true,
        viewConfig: {
            stripeRows: true
        },
        tools: [{
            type: 'refresh',
            handler: 'onRefresh'
        }],
        columns: [{
            xtype: 'treecolumn',
            text: 'Path',
            dataIndex: 'name',
            sortable: false,
            flex: 1
        }, {
            xtype: 'widgetColumn',
            text: 'Configurations',
            widget: {
                xtype: 'factoryWidget'
            },
            sortable: false,
            listeners: {
                updateWidget: 'onUpdateWidget'
            },
            flex: 1
        }]
    }]
});
