Ext.define('NU.view.window.ScatterPlotController', {
    extend: 'NU.view.window.DisplayController',
    alias: 'controller.ScatterPlot',
    requires: [
        'NU.util.TypeMap'
    ],
    config: {
        divID: null,
        nextTraceID: 0,
        maxPoints: 100,
        intervalId: null,
        graphUpdateX: {},
        graphUpdateY: {},
        graphUpdateZ: {},
        yMin: null,
        yMax: null,
        xMin: null,
        xMax: null,
        traceID: null,
        pause: null,
        context: null,
        servoMap: null,
        symbolTypes: [
            //[Text, symbolName] https://plot.ly/javascript/reference/#scatter-marker-symbol
            ['Circle', 'circle'],
            ['Square', 'square'],
            ['Cross', 'cross'],
            ['Diamond', 'diamond']
        ]
    },

    init: function () {
        this.setTraceID([]);
        this.setPause(false);
        this.addEvents();
        var me = this;

        //redraw the graph at 60 fps
        this.setIntervalId(setInterval(function() {
            if(!me.getPause() && Object.keys(me.getGraphUpdateX()).length > 0) {

                //x = [ [trace 1 x values], [trace 2 x values], ... ]
                var update = {
                    x: Object.values(me.getGraphUpdateX()),
                    y: Object.values(me.getGraphUpdateY()),
                    z: Object.values(me.getGraphUpdateZ())
                }

                //extend the graph
                Plotly.extendTraces(me.getDivID(), update, Object.keys(me.getGraphUpdateX()).map(Number), me.getMaxPoints());

                //reset the values to update the graph
                me.setGraphUpdateX({});
                me.setGraphUpdateY({});
                me.setGraphUpdateZ({});
            }
        }, 1000 / 60));

    },

    addEvents: function () {
        this.mon(NU.Network, {
            'message.support.nubugger.DataPoint': this.onDataPoint,
            'message.input.Sensors': this.onSensorData,
            scope: this
        });
        this.servoMap = NU.TypeMap.get({
            R_SHOULDER_PITCH    : 0,
            L_SHOULDER_PITCH    : 1,
            R_SHOULDER_ROLL     : 2,
            L_SHOULDER_ROLL     : 3,
            R_ELBOW             : 4,
            L_ELBOW             : 5,
            R_HIP_YAW           : 6,
            L_HIP_YAW           : 7,
            R_HIP_ROLL          : 8,
            L_HIP_ROLL          : 9,
            R_HIP_PITCH         : 10,
            L_HIP_PITCH         : 11,
            R_KNEE              : 12,
            L_KNEE              : 13,
            R_ANKLE_PITCH       : 14,
            L_ANKLE_PITCH       : 15,
            R_ANKLE_ROLL        : 16,
            L_ANKLE_ROLL        : 17,
            HEAD_PAN            : 18,
            HEAD_TILT           : 19,
        });
    },

    onAfterRender: function () {
        var divElement = this.lookupReference('scatter').getEl();
        var divName = divElement.id;
        this.setDivID(divName);

        var data = [];

        var layout = {
            autosize: false,
            height: divElement.getHeight(),
            width: divElement.getWidth(),
            margin: {
                l: 50,
                r: 50,
                b: 30,
                t: 40,
                pad: 4
            }
        };

        Plotly.newPlot(divName, data, layout);
    },

    onClose: function() {
        if(this.getIntervalId() != null) {
            clearInterval(this.getIntervalId());
        }
    },

    onYMinChange: function (field, newValue, oldValue, eOpts) {
        var divID = this.lookupReference('scatter').getEl().id;
        this.setYMin(newValue);
        var update = {
            yaxis: {
                range: [newValue, this.getYMax()]
            }
        };

        Plotly.relayout(divID, update);
    },

    onYMaxChange: function (field, newValue, oldValue, eOpts) {
        var divID = this.lookupReference('scatter').getEl().id;
        this.setYMax(newValue);
        var update = {
            yaxis: {
                range: [this.getYMin(), newValue]
            }
        };
        Plotly.relayout(divID, update)
    },

    onXMinChange: function (field, newValue, oldValue, eOpts) {
        var divID = this.lookupReference('scatter').getEl().id;
        this.setXMin(newValue);
        var update = {
            xaxis: {
                range: [newValue, this.getXMax()]
            }
        };

        Plotly.relayout(divID, update);
    },

    onXMaxChange: function (field, newValue, oldValue, eOpts) {
        var divID = this.lookupReference('scatter').getEl().id;
        this.setXMax(newValue);
        var update = {
            xaxis: {
                range: [this.getXMin(), newValue]
            }
        };
        Plotly.relayout(divID, update)
    },

    onPointsChange: function (field, newValue, oldValue, eOpts) {
        this.setMaxPoints(newValue);
    },

    onGraphTypeChange: function (obj, newValue, oldValue, eOpts) {
        if (newValue) {
            var update;

            update = {
                type: obj.type
            };

            //restyle the specific trace with update
            Plotly.restyle(this.getDivID(), update);
            Plotly.redraw(this.getDivID());
        }
    },

    onResize: function (obj, width, height) {
        var divElement = this.lookupReference('scatter').getEl();

        var update = {
            width: divElement.getWidth(),
            height: divElement.getHeight()
        };

        Plotly.relayout(divElement.id, update);
    },

    onSensorData: function (robotId, sensorData, timestamp) {
        // Accelerometer
        var accel = sensorData.getAccelerometer();
        this.onDataPoint(robotId, {
            label: "Accelerometer",
            value: [
                accel.x,
                accel.y,
                accel.z
            ]
        }, timestamp);

        // Gyroscope
        var gyro = sensorData.getGyroscope();
        this.onDataPoint(robotId, {
            label: "Gyroscope",
            value: [
                gyro.x,
                gyro.y,
                gyro.z
            ]
        }, timestamp);

        // World
        var world = sensorData.getWorld();
        this.onDataPoint(robotId, {
            label: "World",
            value: [
                world.x.x,
                world.y.x,
                world.z.x,
                world.t.x,
                world.x.y,
                world.y.y,
                world.z.y,
                world.t.y,
                world.x.z,
                world.y.z,
                world.z.z,
                world.t.z,
                world.x.t,
                world.y.t,
                world.z.t,
                world.t.t
            ]
        }, timestamp);

        Ext.each(sensorData.servo, function(servo) {

            var name = this.servoMap[servo.getId()]; // TODO use the ID to get a name from a cache

            // PID gain
            this.onDataPoint(robotId, {
                label: name + " Gain",
                value: [
                    servo.getPGain(),
                    servo.getIGain(),
                    servo.getDGain()
                ]
            }, timestamp);

            // Goal position
            this.onDataPoint(robotId, {
                label: name + " Goal Position",
                value: [
                    servo.getGoalPosition()
                ]
            }, timestamp);

            // Goal Velocity
            this.onDataPoint(robotId, {
                label: name + " Goal Velocity",
                value: [
                    servo.getGoalVelocity()
                ]
            }, timestamp);

            // Present position
            this.onDataPoint(robotId, {
                label: name + " Present Position",
                value: [
                    servo.getPresentPosition()
                ]
            }, timestamp);

            // Present Velocity
            this.onDataPoint(robotId, {
                label: name + " Present Velocity",
                value: [
                    servo.getPresentVelocity()
                ]
            }, timestamp);

            // Load
            this.onDataPoint(robotId, {
                label: name + " Load",
                value: [
                    servo.getLoad()
                ]
            }, timestamp);

            // Voltage
            this.onDataPoint(robotId, {
                label: name + " Voltage",
                value: [
                    servo.getVoltage()
                ]
            }, timestamp);

            // Temperature
            this.onDataPoint(robotId, {
                label: name + " Temperature",
                value: [
                    servo.getTemperature()
                ]
            }, timestamp);

        }, this);
    },

    onDataPoint: function (robot, dataPoint, timestamp) {
        if(!this.getPause()) {
            if (robot.get('id') !== this.getRobotId()) {
                return;
            }
            var label = dataPoint.label;
            var values = dataPoint.value;
            var id = null;
            var trace = this.getTraceID()[label];

            if(trace === undefined) {
                var info = {
                    label: label,
                    xVal: 0,
                    xLocation: 0,
                    yLocation: 1,
                    zLocation: -1,
                    id: null,
                    display: false,
                    shouldAddTrace: false
                };

                //add the trace info as a key based array.
                this.getTraceID()[label] = info;

                //add config option to the toolbar to allow selection of X and Y
                this.addConfigOption(label, id, values.length);
            }else {
                //check to make sure the trace has not been added previously.
                if(trace.id !== null) {
                    trace.shouldAddTrace = false;
                }

                //if the trace was just selected to be displayed
                if (trace.shouldAddTrace) {
                    trace.shouldAddTrace = false;
                    trace.displayed = true;
                    trace.id = this.getNextTraceID();
                    this.setNextTraceID(trace.id + 1);

                    var newTrace = null;

                    if (values.length == 1) {
                        newTrace = {
                            x: [0],
                            y: [values[trace.yLocation]],
                            z: [(trace.zLocation == -1) ? 0 : values[trace.yLocation]],
                            mode: 'markers',
                            type: 'scattergl',
                            hoverinfo: "x+y",
                            marker: {size: 12},
                            name: label
                        };
                    } else {
                        newTrace = {
                            x: [values[trace.xLocation]],
                            y: [values[trace.yLocation]],
                            z: [(trace.zLocation == -1) ? 0 : values[trace.yLocation]],
                            mode: 'markers',
                            type: 'scattergl',
                            hoverinfo: "x+y",
                            marker: {size: 12},
                            name: label
                        };
                    }

                    Plotly.addTraces(this.getDivID(), newTrace);
                } else if(trace.display) { //if the trace has already been added and still wants to update
                    var update = null;
                    if (values.length == 1) {
                        //cant support multiple axis to show a timestamp for traces that use a TimeStamp
                        //for now just increase by 1
                        trace.xVal += 1;

                        // update = {
                        //     x: [[trace.xVal]],
                        //     y: [[values[trace.yLocation]]],
                        //     z: [[(trace.zLocation == -1) ? 0 : values[trace.yLocation]]]
                        // };
                        if(this.getGraphUpdateX()[trace.id] == null) {
                            this.getGraphUpdateX()[trace.id] = [trace.xVal];
                        } else {
                            this.getGraphUpdateX()[trace.id].push(trace.xVal);
                        }
                        if(this.getGraphUpdateY()[trace.id] == null) {
                            this.getGraphUpdateY()[trace.id] = [values[trace.yLocation]];
                        } else {
                            this.getGraphUpdateY()[trace.id].push(values[trace.yLocation]);
                        }
                        if(this.getGraphUpdateZ()[trace.id] == null) {
                            this.getGraphUpdateZ()[trace.id] = [(trace.zLocation == -1) ? 0 : values[trace.yLocation]];
                        } else {
                            this.getGraphUpdateZ()[trace.id].push((trace.zLocation == -1) ? 0 : values[trace.yLocation]);
                        }
                        //Plotly.extendTraces(this.getDivID(), update, [trace.id], this.getMaxPoints());
                    } else {
                        var x = values[trace.xLocation];
                        var y = values[trace.yLocation];
                        if (x !== null && y !== null) {
                            // update = {
                            //     x: [[x]],
                            //     y: [[y]],
                            //     z: [[(trace.zLocation == -1) ? 0 : values[trace.yLocation]]]
                            // };
                            if(this.getGraphUpdateX()[trace.id] == null) {
                                this.getGraphUpdateX()[trace.id] = [x];
                            } else {
                                this.getGraphUpdateX()[trace.id].push(x);
                            }
                            if(this.getGraphUpdateY()[trace.id] == null) {
                                this.getGraphUpdateY()[trace.id] = [y];
                            } else {
                                this.getGraphUpdateY()[trace.id].push(y);
                            }
                            if(this.getGraphUpdateZ()[trace.id] == null) {
                                this.getGraphUpdateZ()[trace.id] = [(trace.zLocation == -1) ? 0 : values[trace.yLocation]];
                            } else {
                                this.getGraphUpdateZ()[trace.id].push((trace.zLocation == -1) ? 0 : values[trace.yLocation]);
                            }
                            //Plotly.extendTraces(this.getDivID(), update, [trace.id], this.getMaxPoints());
                        }
                    }
                }
            }
        }
    },

    onPause: function (button) {
        this.setPause(!this.getPause());
    },

    addConfigOption: function(name, traceLocation, componentLength) {
        //gets the ScatterPlot window view
        var scatterPlotWindow = Ext.ComponentQuery.query('window[id=scatterPlotWindow]')[0];

        var radiobuttonX = [];
        var radiobuttonY = [];
        var radiobuttonZ = [];
        var radiobuttonSymbols = [];

        //create the radio buttons
        for(var i = 0; i < componentLength; i++) {
            //menu for X config
            radiobuttonX.push({
                boxLabel: String(i),
                name: name + ' X',
                inputValue: String(i),
                listeners: {
                    change: 'updateTraceXYZ'
                },
                axis: 'x',
                traceLocation: name,
                componentLocation: i
            });

            //menu for Y config
            radiobuttonY.push({
                boxLabel: String(i),
                name: name + ' Y',
                inputValue: String(i),
                listeners: {
                    change: 'updateTraceXYZ'
                },
                axis: 'y',
                traceLocation: name,
                componentLocation: i
            });

            //menu for Z config
            radiobuttonZ.push({
                boxLabel: String(i),
                name: name + ' Z',
                inputValue: String(i),
                listeners: {
                    change: 'updateTraceXYZ'
                },
                axis: 'z',
                traceLocation: name,
                componentLocation: i
            });
        }

        //add every symbol to the trace's config
        this.getSymbolTypes().forEach(function(symbol) {
            radiobuttonSymbols.push({
                boxLabel: symbol[0],
                name: name + ' Symbol',
                inputValue: symbol[0],
                listeners: {
                    change: 'updateTraceSymbol'
                },
                traceLocation: name,
                symbolType: symbol[1]
            });
        });

        //get the toolbar for the window and add our menu
        //scatterPlotWindow.down('toolbar').add({

        //get the right side bar toolbar from the window and add our menu
        scatterPlotWindow.down('#rightbar').add({
            text: '' + name,
            width: 140,
            listeners: {
                afterrender: function(menu) {
                    Ext.tip.QuickTipManager.register({
                        target: menu.getId(),
                        title : name,  // QuickTip Header
                        //text  : '' // Tip content
                    });
                }
            },
            menu: [
                {
                    text: 'X',
                    menu: [
                        {
                            xtype: 'radiogroup',
                            columns: 1,
                            vertical: true,
                            items: radiobuttonX
                        }
                    ]
                }, {
                    text: 'Y',
                    menu: [
                        {
                            xtype: 'radiogroup',
                            columns: 1,
                            vertical: true,
                            items: radiobuttonY
                        }
                    ]
                },{
                    text: 'Z',
                    menu: [
                        {
                            xtype: 'radiogroup',
                            columns: 1,
                            vertical: true,
                            items: radiobuttonZ
                        }
                    ]
                }, {
                    text: 'Symbol',
                    menu: [
                        {
                            xtype: 'radiogroup',
                            columns: 1,
                            vertical: true,
                            items: radiobuttonSymbols
                        }
                    ]
                }, {
                    xtype: 'checkbox',
                    fieldLabel: 'Display Trace',
                    checked: false,
                    listeners: {
                        change: 'displayTrace'
                    },
                    traceLocation: name
                }, {
                    xtype: 'checkbox',
                    fieldLabel: 'Line Graph',
                    checked: false,
                    listeners: {
                        change: 'onLineGraph'
                    },
                    traceLocation: name
                }
            ]
        });
    },

    updateTraceSymbol: function(obj, newValue, oldValue, eOpts) {
        if(newValue){
            update = {
                marker: {
                    symbol: obj.symbolType,
                    size: 12
                }
            };
            Plotly.restyle(this.getDivID(), update, [this.getTraceID()[obj.traceLocation].id]);
        }
    },

    updateTraceXYZ: function(obj, newValue, oldValue, eOpts) {
        if(newValue){
            if(obj.axis === 'x') {
                this.getTraceID()[obj.traceLocation].xLocation = obj.componentLocation;
            }else if(obj.axis === 'y') {
                this.getTraceID()[obj.traceLocation].yLocation = obj.componentLocation;
            }else {
                this.getTraceID()[obj.traceLocation].zLocation = obj.componentLocation;
            }
        }
    },

    displayTrace: function(obj, newValue, oldValue, eOpts) {
        var trace = this.getTraceID()[obj.traceLocation];
        if(newValue) {
            trace.shouldAddTrace = true;
            trace.display = true;
        }else {
            trace.display = false;
        }
    },

    onLineGraph: function (obj, newValue, oldValue, eOpts) {
        var update;
        if (newValue) {
            update = {
                mode: 'lines+markers'
            };
        }else {
            update = {
                mode: 'markers'
            };
        }

        //restyle the specific trace with update
        Plotly.restyle(this.getDivID(), update, [this.getTraceID()[obj.traceLocation].id]);
    },
});
