Ext.define('NU.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: [
        'NU.view.window.Field',
        'NU.view.window.Chart',
        'NU.view.window.NUClear',
        //'window.VisionWindow',
    ],
    cls: 'desktop',
    layout: 'border',
    items: [{
        xtype: 'toolbar',
        region: 'north',
        items: [{
            text: 'Add All Vision Display',
            handler: function () {

                var renderTo = Ext.getCmp('main_display').getEl();

                Ext.getCmp('main_display').add([
                    new NU.VisionWindow({
                        x: 5,
                        y: 1124,//810,
                        robotIP: '10.0.1.51',
                        renderTo: renderTo
                    }),
                    new NU.VisionWindow({
                        x: 340,
                        y: 1124,//810,
                        robotIP: '10.0.1.52',
                        renderTo: renderTo
                    }),
                    new NU.VisionWindow({
                        x: 675,
                        y: 1124,//810,
                        robotIP: '10.0.1.53',
                        renderTo: renderTo
                    }),
                    new NU.VisionWindow({
                        x: 1010,
                        y: 1124,//810,
                        robotIP: '10.0.1.54',
                        renderTo: renderTo
                    }),
                    new NU.VisionWindow({
                        x: 1345,
                        y: 1124,//810,
                        robotIP: '10.0.1.55',
                        renderTo: renderTo
                    }),
                    new NU.VisionWindow({
                        x: 1680,
                        y: 1124,//810,
                        robotIP: '10.0.1.56',
                        renderTo: renderTo
                    }),
                ]);

            }
        }, {
            text: 'Add Vision Display',
            handler: function () {

                Ext.create('Ext.ux.NU.VisionWindow', {
                    x: 5,
                    y: 810,
                    renderTo: Ext.getCmp('main_display').getEl()
                });

            }
        }, '->', {
            text: 'Robots',
            iconCls: 'icon-cog',
            handler: function () {

                Ext.create('Ext.Window', {
                    title: 'Robots',
                    autoShow: true,
                    modal: true,
                    items: [{
                        xtype: 'grid',
                        columns: [{
                            text: 'Name',
                            dataIndex: 'robotName'
                        }, {
                            text: 'Robot IP',
                            dataIndex: 'robotIP'
                        }]
                    }]
                });
            }
        }]
    }, {
        xtype: 'container',
        region: 'center',
        id: 'main_display',
        style: {
            backgroundColor: '#000'
        },
        items: [{
            xtype: 'nu_field_window',
            x: 5,
            y: 5
        }, {
            xtype: 'nu_chart_window',
            x: 5,
            y: 5
        }, {
            xtype: 'nu_nuclear_window',
            x: 5,
            y: 500
        }]
    }]
});
