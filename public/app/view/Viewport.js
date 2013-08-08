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

var combo = new Ext.form.ComboBox({
    store: store,
    displayField: 'state',
    typeAhead: true,
    mode: 'local',
    triggerAction: 'all',
    emptyText:'Select a state...',
    selectOnFocus:true,
    width:135
});

Ext.define('NUbugger.view.Viewport', {
    extend: 'Ext.container.Viewport',
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
                    new Ext.ux.NU.VisionWindow({
                        x: 5,
                        y: 1124,//810,
                        robotIP: '10.0.1.51',
                        renderTo: renderTo
                    }),
                    new Ext.ux.NU.VisionWindow({
                        x: 340,
                        y: 1124,////810,
                        robotIP: '10.0.1.52',
                        renderTo: renderTo
                    }),
                    new Ext.ux.NU.VisionWindow({
                        x: 675,
                        y: 1124,//810,
                        robotIP: '10.0.1.53',
                        renderTo: renderTo
                    }),
                    new Ext.ux.NU.VisionWindow({
                        x: 1010,
                        y: 1124,//810,
                        robotIP: '10.0.1.54',
                        renderTo: renderTo
                    }),
                    new Ext.ux.NU.VisionWindow({
                        x: 1345,
                        y: 1124,//810,
                        robotIP: '10.0.1.55',
                        renderTo: renderTo
                    }),
                    new Ext.ux.NU.VisionWindow({
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
        }]
    }, {
        xtype: 'container',
        region: 'center',
        id: 'main_display',
        items: [{
            xtype: 'nu.field_window',
            x: 5,
            y: 5,
            robotIP: '10.0.1.55'
        }, {
            xtype: 'nu.chart_window',
            x: 5,
            y: 5,
            robotIP: '10.0.1.55'
        }]
    }]
});



/*, {
            xtype: 'window',
            title: 'sup',
            x: 0,
            y: 0,
            width: 640,
            height: 640,
            autoShow: false,
            constrain: true,
            layout: 'fit',
            items: [{
                //id: 'graph_display',
                layout: 'fit',
                html: '<div id="graph_display" style="width: 640px; height: 640px;"></div>'
            }]
        }, {
            xtype: 'window',
            title: 'Image Display',
            x: 5,
            y: 5,
            width: 334,
            height: 274,
            autoShow: false,
            constrain: true,
            layout: 'fit',
                resizable: {
                    preserveRatio: true
                },
            items: [{
                layout: 'fit',
                //html: '<canvas id="image_display" style="width: 320px; height: 240px;"></div>'
                //<img id="image_display" style="display: none; width: 320px; height: 240px; -webkit-transform: scaleX(-1); position: absolute;" />
                html: '<canvas id="the_canvas" width="320" height="240" style="background-image: url(\'images/image_placeholder.png\'); background-position: center; background-repeat: no-repeat; background-color: #0e0e0e"></canvas>',
                listeners: {
                    resize: function (window, width, height) {
                        
                        var c = document.getElementById("the_canvas");
                        //var con = c.getContext('2d');
                        //var newWidth = c.width * height/c.height;
                        //con.scale(newWidth/c.width, height/c.height);
                        c.style.width = width + "px";
                        c.style.height = height + "px";
                        
                    }
                }
            }]
        }, {
            xtype: 'window',
            title: 'Classified Image Display',
            x: 5,
            y: 285,
            width: 334,
            height: 274,
            autoShow: false,
            constrain: true,
            layout: 'fit',
            resizable: {
                preserveRatio: true
            },
            items: [{
                layout: 'fit',
                //html: '<canvas id="image_display" style="width: 320px; height: 240px;"></div>'
                //<img id="image_display" style="display: none; width: 320px; height: 240px; -webkit-transform: scaleX(-1); position: absolute;" />
                html: '<canvas id="the_classified_canvas" width="320" height="240" style="background-image: url(\'images/image_placeholder.png\'); background-position: center; background-repeat: no-repeat; background-color: #0e0e0e;"></canvas>',
                listeners: {
                    resize: function (window, width, height) {
                        
                        var c = document.getElementById("the_classified_canvas");
                        //var con = c.getContext('2d');
                        //var newWidth = c.width * height/c.height;
                        //con.scale(newWidth/c.width, height/c.height);
                        c.style.width = width + "px";
                        c.style.height = height + "px";
                        
                    }
                }
            }]
        },
        
        {
            xtype: 'window',
            title: 'Chart Display',
            width: 334,
            height: 368,
            x: 5,
            y: 285,
            autoShow: false,
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
                        title: {
                            text: 'Proper Acceleration'
                        }
                    },
                    xAxis: {
                        labels: {
                            enabled: false
                        },
                        title: {
                            text: 'Time'
                        }
                    }
                }
            }]
        }, */