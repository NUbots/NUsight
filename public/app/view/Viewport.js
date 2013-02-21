var model = Ext.define('Vector', {
    extend : 'Ext.data.Model',
    fields : [{
        name : 'time',
        type : 'string'
    }, {
        name : 'x',
        type : 'float'
    }, {
        name : 'y',
        type : 'float'
    }, {
        name : 'z',
        type : 'float'
    }]
});

var store = window.store = Ext.create('Ext.data.Store', {
    model : 'Vector',
    data: []
});

Ext.define('NUbugger.view.Viewport', {
    extend: 'Ext.container.Viewport',
    cls: 'desktop', 
    layout: 'border',
    items: [{
        xtype: 'toolbar',
        region: 'north',
        items: [{
            iconCls: 'icon-cog',
            text: 'Settings'
        }]
    }, {
        xtype: 'container',
        region: 'center',
        items: [{
            xtype: 'window',
            title: 'Main Display',
            x: 0,
            y: 0,
            width: 800,
            height: 648,
            autoShow: true,
            constrain: true,
            layout: 'fit',
            //items: [{
            //    id: 'main_3d_display',
            //    layout: 'fit',
            //    listeners: {
            //        resize: function (window, width, height) {
            //            
            //            resizeScene(width, height);
            //            
            //        }
            //    }
            //}]
            items: [{
                xtype: 'threejs',
                itemId: 'mainscene',
                id: 'mainscene'
            }],
            tbar: [{
                text: 'HawkEye',
                handler: function () {
                    
                    var controls = this.findParentByType('window').getComponent('mainscene').controls;
                    controls.yawObject.position.set(0, 3.5, 0);
                    controls.yawObject.rotation.set(0, 0, 0);
                    controls.pitchObject.rotation.set(-Math.PI / 2, 0, 0);
                    
                }
            }, {
                text: 'Perspective',
                handler: function () {
                    
                    var controls = this.findParentByType('window').getComponent('mainscene').controls;
                    controls.yawObject.position.set(-3, 1.6, 3);
                    controls.yawObject.rotation.set(0, -6.9, 0);
                    controls.pitchObject.rotation.set(-0.5, 0, 0);
                    
                }
            }, {
                text: 'Side',
                handler: function () {
                    
                    var controls = this.findParentByType('window').getComponent('mainscene').controls;
                    controls.yawObject.position.set(0, 1.9, -4.5);
                    controls.yawObject.rotation.set(0, Math.PI, 0);
                    controls.pitchObject.rotation.set(-0.6, 0, 0);
                    
                }
            }]
            //autoShow: false
        }, {
            xtype: 'window',
            title: 'sup',
            x: 0,
            y: 0,
            width: 640,
            height: 640,
            autoShow: true,
            constrain: true,
            layout: 'fit',
            items: [{
                //id: 'graph_display',
                layout: 'fit',
                html: '<div id="graph_display" style="width: 640px; height: 640px;"></div>'
            }],
            autoShow: false
        }, {
            xtype: 'window',
            title: 'Highcharts',
            width: 640,
            height: 480,
            autoShow: true,
            layout: 'fit',
            items: [{
                xtype: 'highchart',
                id: 'main_chart',
                initAnimAfterLoad: false,
                defaultSerieType: 'line',
                animation: false,
                refreshOnChange: true,
                series:[{
                    dataIndex : 'x',
                    name : 'X Axis'
                }, {
                    dataIndex : 'y',
                    name : 'Y Axis'
                }, {
                    dataIndex : 'z',
                    name : 'Z Axis'
                }],
                xField: 'time',
                store: store,
                chartConfig: {
                    chart: {
                        type: 'spline'
                    },
                    title: {
                        text: 'Accelerometer'
                    },
                    tooltip: {
                        enabled: false
                    },
                    yAxis: {
                        min: -1200,
                        max: 1200,
                    },
                    xAxis: {
                        labels: {
                            enabled: false
                        }
                    }
                }
            }]
        }]
    }]
});