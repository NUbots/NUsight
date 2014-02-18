Ext.define('NU.view.window.Chart', {
    extend : 'NU.view.window.Display',
    alias: 'widget.nu_chart_window',
    requires: 'Ext.ux.form.MultiSelect',
    controller: 'NU.controller.Chart',
    inject: 'streamsStore',
    config: {
        streamsStore: null
    },
    initComponent: function () {
        Ext.apply(this, {
            title: 'Chart Display',
            width: 320,
            height: 240,
            resizable: {
                preserveRatio: false
            },
            layout: 'border',
            tbar: [{
                xtype: 'robot_selector'
            }, {
                xtype: 'numberfield',
                itemId: 'min',
                fieldLabel: 'Min',
                labelStyle: 'white-space: nowrap',
                labelWidth: 30,
                width: 120
            }, {
                xtype: 'numberfield',
                itemId: 'max',
                fieldLabel: 'Max',
                labelStyle: 'white-space: nowrap',
                labelWidth: 30,
                width: 120
            }],
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
                    store: this.getStreamsStore() //Ext.create('NU.store.Streams')
                }]
            }]
        });
        this.callParent(arguments);
    }
});
