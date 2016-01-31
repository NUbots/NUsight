Ext.define('NU.view.window.ScatterPlotController', {
    extend: 'NU.view.window.DisplayController',
    alias: 'controller.ScatterPlot',
    requires: [
        'NU.util.TypeMap'
    ],
    config: {
        maxPoints: 100,
        yMin: null,
        yMax: null,
        xMin: null,
        xMax: null,
        traceID: null,
        pause: null,
        context: null,
        servoMap: null
    },

    init: function () {
        this.setTraceID([]);
        this.setPause(false);
        this.addEvents();
    },

    addEvents: function () {
        this.mon(NU.Network, {
            'message.support.nubugger.proto.DataPoint': this.onDataPoint,
            'message.input.proto.Sensors': this.onSensorData,
            scope: this
        });
        this.servoMap = NU.TypeMap.get(API.message.input.proto.Sensors.ServoID);
    },

    onAfterRender: function () {
        var divElement = this.lookupReference('scatter').getEl();
        var divName = divElement.id;
        var div = document.getElementById(divName);

        var data = [];

        var layout = {
            autosize: false,
            height: divElement.getWidth(),
            width: divElement.getHeight(),
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

    onResize: function (obj, width, height) {
        var divElement = this.lookupReference('scatter').getEl();

        var update = {
            width: divElement.getWidth(),
            height: divElement.getHeight()
        };

        Plotly.relayout(divElement.id, update);
    },

    onLineGraph: function (obj, newValue, oldValue, eOpts) {
        var divID = this.lookupReference('scatter').getEl().id;

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
        Plotly.restyle(divID, update);
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

        // Orientation
        var orientation = sensorData.getOrientation();
        this.onDataPoint(robotId, {
            label: "Orientation",
            value: [
                orientation.xx,
                orientation.yx,
                orientation.zx,
                orientation.xy,
                orientation.yy,
                orientation.zy,
                orientation.xz,
                orientation.yz,
                orientation.zz
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
        //TODO: Check Plotly.JS changelog for multi axes to allow a TimeStamp axis for single value
        if(!this.getPause()) {
            if (robot.get('id') !== this.getRobotId()) {
                return;
            }
            var label = dataPoint.label;
            var values = dataPoint.value;
            var divID = this.lookupReference('scatter').getEl().id;


            var id = null;
            var traces = this.getTraceID();

            for(var i = 0; i < traces.length; i++) {
                if(traces[i].label === label) {
                    id = i;
                    break;
                }
            }

            if(id === null) {
                var trace = null;

                if(values.length == 1) {
                    trace = {
                        x: [0],
                        y: [values[0]],
                        mode: 'markers',
                        type: 'scattergl',
                        hoverinfo: "x+y",
                        marker: {size: 12},
                        name: label
                    };
                }else {
                    trace = {
                        x: [values[0]],
                        y: [values[1]],
                        mode: 'markers',
                        type: 'scattergl',
                        hoverinfo: "x+y",
                        marker: {size: 12},
                        name: label
                    };
                }

                var info = {
                    label: label,
                    xVal: 0,
                    xLocation: 0,
                    yLocation: 1,
                };

                id = this.getTraceID().push(info) - 1;
                Plotly.addTraces(divID, trace);

                //add config option to the toolbar to allow selection of X and Y
                this.addConfigOption(label, id, values.length);
            }else {
                var update = null;
                if(values.length == 1) {
                    //cant support multiple axis to show a timestamp for traces that use a TimeStamp
                    //for now just increase by 1
                    traces[id].xVal += 1;

                    update = {
                        x: [[traces[id].xVal]],
                        y: [[values[traces[id].yLocation]]]
                    };
                }else {
                    if(values[0] !== null && values[1] !== null) {
                        update = {
                            x: [[values[traces[id].xLocation]]],
                            y: [[values[traces[id].yLocation]]]
                        };
                    }
                }
                if (update != null) {
                    Plotly.extendTraces(divID, update, [id], this.getMaxPoints());
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

        //create the radio buttons
        for(var i = 0; i < componentLength; i++) {
            //menu for X config
            radiobuttonX.push({
                boxLabel: String(i),
                name: name + ' X',
                inputValue: String(i),
                listeners: {
                    change: 'updateTraceXY'
                },
                axis: 'x',
                traceLocation: traceLocation,
                componentLocation: i
            });

            //menu for Y config
            radiobuttonY.push({
                boxLabel: String(i),
                name: name + ' Y',
                inputValue: String(i),
                listeners: {
                    change: 'updateTraceXY'
                },
                axis: 'y',
                traceLocation: traceLocation,
                componentLocation: i
            });
        }

        //get the toolbar for the window and add our radio buttons
        scatterPlotWindow.down('toolbar').add({
            text: 'Config - ' + name,
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
                }
            ]
        });
    },

    updateTraceXY: function(obj, newValue, oldValue, eOpts) {
        if(newValue){
            if(obj.axis === 'x') {
                this.getTraceID()[obj.traceLocation].xLocation = obj.componentLocation;
            }else {
                this.getTraceID()[obj.traceLocation].yLocation = obj.componentLocation;
            }
        }
    }
});