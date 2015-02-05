Ext.define('NU.view.window.ChartController', {
    extend: 'NU.view.window.DisplayController',
    alias: 'controller.Chart',
    canvas3d: null,
    mathbox: null,
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
        displayMode: null
    },
    statics: {
        DisplayMode: {
            StreamingLineChart: 0,
            Rotation3D: 1
        }
    },
    init: function () {
        // init array
        this.setStreams([]);
        this.setDisplayMode(this.self.DisplayMode.StreamingLineChart);
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

        // setup network hook
		var view = this.getView();
        view.mon(NU.Network, 'data_point', this.onDataPoint, this);
        view.mon(NU.Network, 'sensor_data', this.onSensorData, this);

        this.onResize(view, view.getWidth(), view.getHeight());
    },
    onCanvas3dAfterRender: function () {
        ThreeBox.preload([
            '/lib/mathbox/build/MathBox.glsl.html'
        ], function () {
            // Do stuff with MathBox here
            var canvas3dContainer = this.lookupReference('canvas3dContainer');
            var mathbox = this.mathbox = mathBox(canvas3dContainer.getEl().dom, {
                cameraControls: true,
                controlClass: ThreeBox.OrbitControls,
                stats: false
            });

            // HACK, this is needed as mathbox/tquery does not support supplying a canvas element
            this.canvas3d = Ext.get(canvas3dContainer.getEl().dom.children[0]);

            mathbox.viewport({
                type: 'cartesian',
                range: [[-1, 1], [-1, 1], [-1, 1]], // Range in X, Y, Z
                scale: [0.7, 0.7, 0.7],                   // Scale in X, Y, Z
                rotation: [-Math.PI / 2, 0, Math.PI / 2], // Convert to robot coordinates: x forward, y left, z up
                position: [0, 0, 0]                 // Viewport position in XYZ
            }).axis({
                id: 'x-axis',
                axis: 0,
                color: 0xaa0000,
                size: .02,
                labels: false
            }).axis({
				id: 'y-axis',
				axis: 1,
				color: 0x00aa00,
				size: .02,
				labels: false
			}).axis({
				id: 'z-axis',
				axis: 2,
				color: 0x0000aa,
				size: .02,
				labels: false
			})/*.grid({
				axis: [1, 2],
                offset: [1, 0, 0],
				color: 0xc0c0c0,
				lineWidth: 1
			}).grid({
				axis: [0, 2],
                offset: [0, 1, 0],
				color: 0xc0c0c0,
				lineWidth: 1
			}).grid({
				axis: [0, 1],
                offset: [0, 0, -1],
				color: 0xc0c0c0,
				lineWidth: 1
			})*/.vector({
                id: "vecX",
				color: 0xff0000,
                n: 1,
                data: [[0,0,0],[1,0,0]]
            }).vector({
                id: "vecY",
				color: 0x00ff00,
                n: 1,
                data: [[0,0,0],[0,1,0]]
            }).vector({
                id: "vecZ",
				color: 0x0000ff,
                n: 1,
                data: [[0,0,0],[0,0,1]]
            }).start();
        }.bind(this));
    },
    onStreamingLineChartClick: function () {
        this.setDisplayMode(this.self.DisplayMode.StreamingLineChart);
    },
    onRotation3DModeClick: function () {
        this.setDisplayMode(this.self.DisplayMode.Rotation3D);
    },
    onMinChange: function (field, newValue, oldValue, eOpts) {
		var smoothie = this.getSmoothie();
		smoothie.options.minValue = newValue;
	},
    onMaxChange: function (field, newValue, oldValue, eOpts) {
        var smoothie = this.getSmoothie();
        smoothie.options.maxValue = newValue;
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
        }, this);
    },
    onResize: function (obj, width, height) {

        // TODO: fix onload size
        var canvas = this.lookupReference('canvas');
        var canvasEl = canvas.getEl();
        var canvasDom = canvasEl.dom;

        if (canvas !== null) {
            canvasDom.width = canvasEl.getWidth();
            canvasDom.height = canvasEl.getHeight();
        }

        if (this.canvas3d !== null) {
            // TODO: This is a horrible horrible hack, please figure out how to replace me with reasonableness
            this.mathbox._world._tqData._threeBoxContext.elementResize.callback();
        }

    },
    onSensorData: function (robotIP, sensorData, timestamp) {

        return;

        var Type = API.DataPoint.Type;

        // Accelerometer
        var accel = sensorData.getAccelerometer();
        this.onDataPoint(robotIP, new API.DataPoint({
            label: "Accelerometer",
            value: [
                accel.x,
                accel.y,
                accel.z
            ],
            type: Type.FLOAT_LIST
        }), timestamp);

        // Gyroscope
        var gyro = sensorData.getGyroscope();
        this.onDataPoint(robotIP, new API.DataPoint({
            label: "Gyroscope",
            value: [
                gyro.x,
                gyro.y,
                gyro.z
            ],
            type: Type.FLOAT_LIST
        }), timestamp);

        // Orientation
        var orientation = sensorData.getOrientation();
        this.onDataPoint(robotIP, new API.DataPoint({
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
            ],
            type: Type.ROTATION_3D
        }), timestamp);

        // Left FSR
        var lFSR = sensorData.getLeftFSR();
        this.onDataPoint(robotIP, new API.DataPoint({
            label: "Left FSR Position",
            value: [
                lFSR.x,
                lFSR.y
            ],
            type: Type.FLOAT_LIST
        }), timestamp);
        this.onDataPoint(robotIP, new API.DataPoint({
            label: "Left FSR Force",
            value: [
                lFSR.z
            ],
            type: Type.FLOAT_LIST
        }), timestamp);

        // Right FSR
        var rFSR = sensorData.getRightFSR();
        this.onDataPoint(robotIP, new API.DataPoint({
            label: "Right FSR Position",
            value: [
                rFSR.x,
                rFSR.y
            ],
            type: Type.FLOAT_LIST
        }), timestamp);
        this.onDataPoint(robotIP, new API.DataPoint({
            label: "Right FSR Force",
            value: [
                rFSR.z
            ],
            type: Type.FLOAT_LIST
        }), timestamp);

        // Servos
        Ext.each(sensorData.servo, function(servo) {

            var id = servo.getId();
            var name = id; // TODO use the ID to get a name from a cache

            // PID gain
            this.onDataPoint(robotIP, new API.DataPoint({
                label: name + " Gain",
                value: [
                    servo.getPGain(),
                    servo.getIGain(),
                    servo.getDGain()
                ],
                type: Type.FLOAT_LIST
            }), timestamp);

            // Goal position
            this.onDataPoint(robotIP, new API.DataPoint({
                label: name + " Goal Position",
                value: [
                    servo.getGoalPosition()
                ],
                type: Type.FLOAT_LIST
            }), timestamp);

            // Goal Velocity
            this.onDataPoint(robotIP, new API.DataPoint({
                label: name + " Goal Velocity",
                value: [
                    servo.getGoalSpeed()
                ],
                type: Type.FLOAT_LIST
            }), timestamp);

            // Present position
            this.onDataPoint(robotIP, new API.DataPoint({
                label: name + " Present Position",
                value: [
                    servo.getPresentPosition()
                ],
                type: Type.FLOAT_LIST
            }), timestamp);

            // Present Velocity
            this.onDataPoint(robotIP, new API.DataPoint({
                label: name + " Present Velocity",
                value: [
                    servo.getPresentSpeed()
                ],
                type: Type.FLOAT_LIST
            }), timestamp);

            // Load
            this.onDataPoint(robotIP, new API.DataPoint({
                label: name + " Load",
                value: [
                    servo.getLoad()
                ],
                type: Type.FLOAT_LIST
            }), timestamp);

            // Voltage
            this.onDataPoint(robotIP, new API.DataPoint({
                label: name + " Voltage",
                value: [
                    servo.getVoltage()
                ],
                type: Type.FLOAT_LIST
            }), timestamp);

            // Temperature
            this.onDataPoint(robotIP, new API.DataPoint({
                label: name + " Temperature",
                value: [
                    servo.getTemperature()
                ],
                type: Type.FLOAT_LIST
            }), timestamp);

        }, this);
    },
    onDataPoint: function (robotIP, dataPoint, timestamp) {

        // TODO: remove
        if (robotIP !== this.getRobotIP()) {
            return;
        }

        var label = dataPoint.getLabel();
        var values = dataPoint.getValue();
        var type = dataPoint.getType();
        var Type = API.DataPoint.Type;
        //console.log(label, values);

        switch (type) {
            case Type.FLOAT_LIST:
                var stream = this.getStream(label, values);

                Ext.each(values, function (value, i) {
                    if (isFinite(value)) {
                        stream.series[i].append(timestamp, value);
                    }
                }, this);
                break;
            case Type.ROTATION_3D:
                if (this.mathbox) {
                    var rot = new THREE.Matrix3().fromArray(values);
                    var rotArray = rot.toArray();
                    this.mathbox.set('#vecX', {data: [[0, 0, 0], rotArray.slice(0,3)]});
					this.mathbox.set('#vecY', {data: [[0, 0, 0], rotArray.slice(3,6)]});
					this.mathbox.set('#vecZ', {data: [[0, 0, 0], rotArray.slice(6,9)]});
                }
                break;
            default:
                console.error("Unsupported data point type: ", type);
        }
    },
    getStream: function(label, values) {
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
            enabled: false
        };
        this.getStreams().push(value);
        this.lookupReference('streampicker').getStore().add(value);
        return value;
    }
});
