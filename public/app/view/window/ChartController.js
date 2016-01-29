Ext.define('NU.view.window.ChartController', {
    extend: 'NU.view.window.DisplayController',
    alias: 'controller.Chart',
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
        smoothie: null,
        context: null,
        tx: null,
        ty: null,
        tz: null,
        lastDraw: 0,
        streams: null,
        servoMap: null
    },
    init: function () {
        this.setStreams([]);
        this.paused = false;
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
        // setup canvas
        var canvas = this.lookupReference('canvas');
        var canvasDom = canvas.getEl().dom;
        this.setContext(canvasDom.getContext('2d'));

        // setup smoothie
        var smoothie = new SmoothieChart({interpolation: 'linear'});
        this.setSmoothie(smoothie);
        smoothie.streamTo(canvasDom, 0);

        var view = this.getView();
        this.onResize(view, view.getWidth(), view.getHeight());
    },

    onMinChange: function (field, newValue, oldValue, eOpts) {
		var smoothie = this.getSmoothie();
		smoothie.options.minValue = newValue;
	},

    onMaxChange: function (field, newValue, oldValue, eOpts) {
        var smoothie = this.getSmoothie();
        smoothie.options.maxValue = newValue;
    },

    onPeriodChange: function (field, newValue, oldValue, eOpts) {
        var smoothie = this.getSmoothie();
        smoothie.options.millisPerPixel = newValue === null ? 20 : newValue / this.getView().getWidth() * 1000;
    },

    onStreamSelect: function (obj, newValue, oldValue, e) {
        var colours = this.getColours();
        var numColours = colours.length;
        var colourIndex = 0;
        var smoothie = this.getSmoothie();
        Ext.each(this.getStreams(), function (stream) {
            var found = false;
            Ext.each(newValue, function (value) {
                if (value == stream.label) {
                    found = true;
                    return false;
                }
            }, this);
            Ext.each(stream.series, function (ts) {
                if (found) {
                    if (!stream.enabled) {
                        var colour;
                        if (colourIndex < numColours) {
                            colour = colours[colourIndex];
                            colourIndex++;
                        } else {
                            var r = Math.round(Math.random() * 255);
                            var g = Math.round(Math.random() * 255);
                            var b = Math.round(Math.random() * 255);
                            colour = 'rgb(' + r + ', ' + g + ', ' + b + ')';
                        }
                        smoothie.addTimeSeries(ts, {strokeStyle: colour, lineWidth: 2});
                    }
                } else {
                    smoothie.removeTimeSeries(ts);
                }
            }, this);
            stream.enabled = found;
            if (found) {
                this.lookupReference('offset').setValue(stream.offset);
            }
        }, this);
    },

    onResize: function (obj, width, height) {

        var canvas = this.lookupReference('canvas');
        var canvasEl = canvas.getEl();
        var canvasDom = canvasEl.dom;

        if (canvas !== null) {
            canvasDom.width = canvasEl.getWidth();
            canvasDom.height = canvasEl.getHeight();


            var period = this.lookupReference('period').getValue();
            this.getSmoothie().options.millisPerPixel = period === null ? 20 : period / canvasDom.width * 1000;
        }

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

        // Left FSR
        //var lFSR = sensorData.getLeftFSR();
        //this.onDataPoint(robotId, {
        //    label: "Left FSR Position",
        //    value: [
        //        lFSR.x,
        //        lFSR.y
        //    ]
        //}, timestamp);
        //this.onDataPoint(robotId, {
        //    label: "Left FSR Force",
        //    value: [
        //        lFSR.z
        //    ]
        //}, timestamp);

        // Right FSR
        //var rFSR = sensorData.getRightFSR();
        //this.onDataPoint(robotId, {
        //    label: "Right FSR Position",
        //    value: [
        //        rFSR.x,
        //        rFSR.y
        //    ]
        //}, timestamp);
        //this.onDataPoint(robotId, {
        //    label: "Right FSR Force",
        //    value: [
        //        rFSR.z
        //    ]
        //}, timestamp);

        // Servos
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

        // TODO: remove
        if (robot.get('id') !== this.getRobotId()) {
            return;
        }

        //console.log(api_message);
        var label = dataPoint.label;
        var values = dataPoint.value;

        var stream = this.getStream(label, values);

        var now = Date.now();
        var offset = now - timestamp;
        stream.timestampValues.push(offset);
        stream.timestampSum += offset;
        stream.timestampNum++;
        if (stream.timestampNum > 5) {
            stream.timestampSum -= stream.timestampValues.shift();
            stream.timestampNum--;
        }
        var average = stream.timestampSum / stream.timestampNum;
        var difference = average - stream.offset;
        if (Math.abs(difference) > 1000) {
            stream.offset = average;
            this.lookupReference('offset').setValue(average);
        }
        Ext.each(values, function (value, i) {
            stream.series[i].append(new Date(timestamp.getTime() + stream.offset), value);
        }, this);
    },

    getStream: function (label, values) {
        var value = null;
        Ext.each(this.getStreams(), function (stream) {
            if (stream.label == label) {
                value = stream;
                return false;
            }
        });
        if (value !== null) {
            return value;
        }
        var size = values.length;
        var series = [];
        for (var i = 0; i < size; i++) {
            var ts = new TimeSeries();
            series.push(ts);
        }
        value = {
            label: label,
            size: size,
            series: series,
            offset: 0,
            timestampValues: [],
            timestampSum: 0,
            timestampNum: 0,
            enabled: false
        };
        this.getStreams().push(value);
        this.lookupReference('streampicker').getStore().add(value);
        return value;
    },

    onPause: function (button) {
        var smoothie = this.getSmoothie();
        if (this.paused) {
            smoothie.start();
        } else {
            smoothie.stop();
        }
        this.paused = !this.paused;
        button.setPressed(this.paused);
    }

});
