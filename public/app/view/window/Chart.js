Ext.define('NU.view.window.Chart', {
    extend : 'NU.view.window.Display',
    alias: 'widget.nu_chart_window',
    controller: 'NU.controller.Chart',
    inject: [
        'streamsStore'
    ],
    config: {
        streamsStore: null
    },
    requires: [
        'Ext.ux.form.MultiSelect',
        'NU.view.robot.Selector'
    ],
    initComponent: function () {
        Ext.applyIf(this, {
            title: 'Chart Display',
            width: 320,
            height: 240,
            resizable: {
                preserveRatio: false
            },
            layout: 'border',
            items: [{
                xtype: 'component',
                region: 'center',
                width: 320,
                height: 240,
                autoEl: {
                    tag: 'canvas',
                    width: 320,
                    height: 240
                },
                itemId: 'canvas',
                layout: 'fit'
            }, {
                region: 'east',
                width: 150,
                items: [{
                    xtype: 'multiselect',
                    width: 148,
                    displayField: 'label',
                    itemId: 'streampicker',
                    store: this.getStreamsStore()
                }]
            }]
        });
        this.callParent(arguments);
    }
});
