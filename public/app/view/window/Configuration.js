/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.window.Configuration', {
    extend : 'NU.view.window.Display',
    alias: 'widget.nu_configuration_window',
    requires: [
        'NU.view.window.ConfigurationViewModel',
        'NU.view.window.ConfigurationController',
        'Ext.layout.container.Column'
    ],
    viewModel: {
        type: 'Configuration'
    },
    controller: 'Configuration',
    title: 'Configuration',
    width: 1000,
    height: 550,
    tbar: [
        {
            xtype: 'robot_selector',
            listeners: {
                selectRobot: 'onSelectRobot'
            }
        }
    ],
    items: [
        {
            xtype: 'panel',
            layout: {
                type: 'hbox',
                pack: 'start',
                align: 'stretch'
            },
            height: '100%',
            width: '100%',
            bodyStyle: {
                'border-top': '1px solid #999!important'
            },
            items: [
                {
                    xtype: 'panel',
                    height: '100%',
                    width: '30%',
                    reference: 'filesPanel',
                    bodyStyle: {
                        'border-right': '1px solid #999!important'
                    }
                },
                {
                    xtype: 'panel',
                    height: '100%',
                    width: '70%',
                    reference: 'editPanel'
                }
            ]
        }
    ]
});
