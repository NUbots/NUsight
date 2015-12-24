Ext.define('NU.view.window.ScatterPlotController', {
    extend: 'NU.view.window.DisplayController',
    alias: 'controller.ScatterPlot',
    requires: [
        'NU.util.TypeMap'
    ],
    config: {
        colours: [
            // 8 distinct colours from http://colorbrewer2.org/
            '#e41a1c',
            '#4daf4a',
            '#377eb8',
            '#984ea3',
            '#ff7f00',
            '#ffff33',
            '#a65628',
            '#f781bf'
        ],
        traceID: null,
        pause: null,
        chart: null,
        data: null,
        context: null,
        tx: null,
        ty: null,
        tz: null,
        lastDraw: 0,
        streams: null,
        servoMap: null
    },

    init: function () {
        this.setTraceID([]);
        this.setStreams([]);
        this.setPause(false);
        this.addEvents();
    },

    addEvents: function () {
        this.mon(NU.Network, {
            'messages.support.nubugger.proto.DataPoint': this.onDataPoint,
            'messages.input.proto.Sensors': this.onSensorData,
            scope: this
        });
        this.servoMap = NU.TypeMap.get(API.messages.input.proto.Sensors.ServoID);
    },

    onAfterRender: function () {
        var divElement = this.lookupReference('scatter');
        var divName = divElement.getEl().id;
        var div = document.getElementById(divName);

        var trace1 = {
            x: [1, 2, 3, 4, 5],
            y: [4, 4, 4, 4, 4],
            mode: 'markers',
            type: 'scattergl',
            marker: { size: 12 },
            stream: { maxpoints: 1},
            hoverinfo:"x+y"
        };

        var trace2 = {
            x: [1, 2, 3, 4, 5],
            y: [1, 1, 1, 1, 1],
            mode: 'markers',
            type: 'scattergl',
            marker: { size: 12 },
            stream: { maxpoints: 1},
            hoverinfo:"x+y"
        };

        var data = [trace1, trace2];

        var layout = {
            autosize: false,
            height: 163,
            width: 560,
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

    onMinChange: function (field, newValue, oldValue, eOpts) {
    },

    onMaxChange: function (field, newValue, oldValue, eOpts) {
    },

    onPeriodChange: function (field, newValue, oldValue, eOpts) {
    },

    onStreamSelect: function (obj, newValue, oldValue, e) {
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
                if(traces[i] === label) {
                    id = i;
                    break;
                }
            }

            if(id === null) {
                var trace = {
                    x: [values[0]],
                    y: [values[1]],
                    mode: 'markers',
                    type: 'scattergl',
                    hoverinfo:"x+y",
                    marker: { size: 12 },
                    name: label
                };
                id = this.getTraceID().push(label) - 1;
                Plotly.addTraces(divID, trace);
            }else {
                var data = this.getData();
                var dataSet = null;

                var update = {
                    x: [[values[0]]],
                    y: [[values[1]]]
                };

                if (values[0] !== null && values[1] !== null) {
                    Plotly.extendTraces(divID, update, [id], 100);
                }
            }
        }
    },

    getStream: function (label, values) {

    },

    onPause: function (button) {
        this.setPause(!this.getPause());
    }
});