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
        pause: false,
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
        //this.addEvents();
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
        var divName = this.lookupReference('scatter').getEl().id;
        var div = document.getElementById(divName);
        div.style.width = "100%";
        div.style.height = "100%";
        var trace1 = {
            x: [1, 2, 3, 4, 5],
            y: [1, 6, 3, 6, 1],
            mode: 'markers',
            type: 'scattergl',
            marker: { size: 12 },
            stream: { maxpoints: 1}
        };

        var data = [ trace1 ];

        var layout = {
            width: div.width,
            height: div.height,
            xaxis: {
                range: [ 0, 50 ]
            },
            yaxis: {
                range: [0, 20]
            }
            //title:'Data Labels Hover'
        };

        Plotly.newPlot(divName, data, layout);

        var start = new Date().getTime();
        var b = 0;
        var that = this;


        setInterval(function() {
            that.onDataPoint(-1,
                {
                    label: name + "Load",
                    value: [
                        Math.random() * 40, Math.random() * 20
                    ]
                }, new Date().getTime());
        }, 20);
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

    },

    onSensorData: function (robotId, sensorData, timestamp) {
        // Accelerometer
/*        var accel = sensorData.getAccelerometer();
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
        }, timestamp);*/

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
            // TODO: remove
            /*  if (robot.get('id') !== this.getRobotId()) {
             return;
             }*/
            //console.log('adding data');
            var label = dataPoint.label;
            var values = dataPoint.value;

            var data = this.getData();
            var dataSet = null;

            var update = {
                x: [[values[0]]],
                y: [[values[1]]]
            };

            if (values[0] !== null && values[1] !== null && values.length === 2) {
                Plotly.extendTraces(this.lookupReference('scatter').getEl().id, update, [0], 100);
            }
        }
    },

    getStream: function (label, values) {
    },

    onPause: function (button) {
        this.setPause(!this.getPause());
    }
});