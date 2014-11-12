Ext.define('NU.view.window.ChartController', {
    extend: 'NU.view.window.DisplayController',
    alias: 'controller.Chart',
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
        streams: null
    },
    init: function () {
        // init array
        this.setStreams([]);
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
        view.mon(NU.util.Network, 'data_point', this.onDataPoint, this);
        view.mon(NU.util.Network, 'sensor_data', this.onSensorData, this);

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
    onStreamSelect: function (obj, newValue, oldValue, e) {
        var colours = this.getColours();
        var numColours = colours.length;
        var colourIndex = 0;
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
                        this.smoothie.addTimeSeries(ts, {strokeStyle: colour, lineWidth: 2});
                    }
                } else {
                    this.smoothie.removeTimeSeries(ts);
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

    },
    onSensorData: function (api_sensor_data) {

        var api_motor_data = api_sensor_data.servo;
        // TODO
        /*api_motor_data[ServoID.R_SHOULDER_PITCH].present_position
        api_motor_data[ServoID.L_SHOULDER_PITCH].present_position
        api_motor_data[ServoID.R_SHOULDER_ROLL].present_position
        api_motor_data[ServoID.L_SHOULDER_ROLL].present_position
        api_motor_data[ServoID.R_ELBOW].present_position
        api_motor_data[ServoID.L_ELBOW].present_position
        api_motor_data[ServoID.R_HIP_YAW].present_position
        api_motor_data[ServoID.L_HIP_YAW].present_position
        api_motor_data[ServoID.R_HIP_ROLL].present_position
        api_motor_data[ServoID.L_HIP_ROLL].present_position
        api_motor_data[ServoID.R_HIP_PITCH].present_position
        api_motor_data[ServoID.L_HIP_PITCH].present_position
        api_motor_data[ServoID.R_KNEE].present_position
        api_motor_data[ServoID.L_KNEE].present_position
        api_motor_data[ServoID.R_ANKLE_PITCH].present_position
        api_motor_data[ServoID.L_ANKLE_PITCH].present_position
        api_motor_data[ServoID.R_ANKLE_ROLL].present_position
        api_motor_data[ServoID.L_ANKLE_ROLL].present_position
        api_motor_data[ServoID.HEAD_PAN].present_position
        api_motor_data[ServoID.HEAD_TILT].present_position*/
    },
    onDataPoint: function (robotIP, dataPoint) {

        // TODO: remove
        if (robotIP !== this.getRobotIP()) {
            return;
        }

        //console.log(api_message);
        var label = dataPoint.label;
        var values = dataPoint.value;

        var stream = this.getStream(label, values);

        Ext.each(values, function (value, i) {
            stream.series[i].append(Date.now(), value);
        }, this);
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
        this.getStreampicker().getStore().add(value);
        return value;
    }
});