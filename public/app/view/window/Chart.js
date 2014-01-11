Ext.define('NU.view.window.Chart', {
    extend : 'NU.view.window.Display',
    alias : ['widget.nu_chart_window'],
    requires: ['Ext.ux.form.MultiSelect'],
    autoShow: true,
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
            anchor: '100%',
            xtype: 'multiselect',
            width: 148,
            store: 'Streams',
            blankText: 'No items available',
            itemId: 'streampicker'
        }]
    }]
});
