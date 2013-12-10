Ext.define('Ext.ux.NU.ChartWindow', {
	extend : 'Ext.ux.NU.DisplayWindow',
	alias : ['widget.nu.chart_window'],
    requires: ['Ext.ux.form.MultiSelect'],
	autoShow: true,
	title: 'Chart Display',
	width: 320,
	height: 240,
	smoothie: null,
	canvas: null,
	context: null,
    streampicker: null,
	tx: null,
	ty: null,
	tz: null,
	resizable: {
		preserveRatio: false
	},
	lastDraw: 0,
	layout: 'border',
	items: [{
		xtype: 'component',
		region: 'center',
		width: 320,
		height: 240,
		autoEl: {
			tag: 'canvas',
			width: 320,
			height: 240
		},
		itemId: 'canvas',
		layout: 'fit'
	}, {
        region: 'east',
        width: 150,
        items: [{
            anchor: '100%',
            xtype: 'multiselect',
            width: 148,
            store: [],
            blankText: 'No items available',
            itemId: 'streampicker',
            listeners: {
                change: function (obj, newValue, oldValue, e) {
                    var self = this.up('#display_window');
                    Ext.each(self.streams, function (stream) {
                        var found = false;
                        Ext.each(newValue, function (value) {
                            if (value == stream.label) {
                                found = true;
                                return false;
                            }
                        }, this);
                        Ext.each(stream.series, function (ts) {
                            //ts.dropOldData(Date.now(), 2);
                            /*if (stream.enabled && !found) {
                                ts.data = [];
                            }*/
                            if (found) {
                                if (!stream.enabled) {
                                    var r = Math.round(Math.random() * 255);
                                    var g = Math.round(Math.random() * 255);
                                    var b = Math.round(Math.random() * 255);
                                    this.smoothie.addTimeSeries(ts, {strokeStyle: 'rgb(' + r + ', ' + g + ', ' + b + ')', lineWidth: 2});
                                }
                            } else {
                                this.smoothie.removeTimeSeries(ts);
                            }
                        }, this);
                        stream.enabled = found;
                    }, self);
                }
            }
        }]
    }],
    streams: [],
	constructor: function () {

		NU.Network.on('sensor_data', Ext.bind(this.onSensorData, this));
        NU.Network.on('data_point', Ext.bind(this.onDataPoint, this));

		this.callParent(arguments);
	},
	listeners: {
		afterRender: function () {

			this.varDisplay = this.down('#varDisplay');
			this.canvas = this.down('#canvas');
            this.streampicker = this.down('#streampicker');
			//this.context = this.canvas.el.dom.getContext('2d');
			//this.smoothie = new SmoothieChart({interpolation: 'linear', maxValue:Math.PI,minValue:-Math.PI});
			this.smoothie = new SmoothieChart({interpolation: 'linear'});
			//this.smoothie = new SmoothieChart({interpolation: 'linear', maxValue: 15, minValue: -15});
			this.smoothie.streamTo(this.canvas.el.dom, 0);

//			this.tx = new TimeSeries();
//			this.ty = new TimeSeries();
//			this.tz = new TimeSeries();
//
//			this.smoothie.addTimeSeries(this.tx, {strokeStyle: 'rgb(255, 0, 0)', lineWidth: 2});
//			this.smoothie.addTimeSeries(this.ty, {strokeStyle: 'rgb(0, 255, 0)', lineWidth: 2});
//			this.smoothie.addTimeSeries(this.tz, {strokeStyle: 'rgb(0, 0, 255)', lineWidth: 2});

		},
		resize: function (obj, width, height) {

			this.canvas.el.dom.width = this.canvas.el.getWidth();
			this.canvas.el.dom.height = this.canvas.el.getHeight();

		}
	},
	onSensorData: function (robotIP, api_message) {

		// do stuff
		//var x2 = api_message.sensor_data.orientation.float_value[0];
		//var y2 = api_message.sensor_data.orientation.float_value[1];
		//var z2 = api_message.sensor_data.orientation.float_value[2];
//		var x2 = api_message.sensor_data.accelerometer.float_value[0];
//		var y2 = api_message.sensor_data.accelerometer.float_value[1];
//		var z2 = api_message.sensor_data.accelerometer.float_value[2];
		//var x2 = api_message.sensor_data.gyro.float_value[0];
		//var y2 = api_message.sensor_data.gyro.float_value[1];
		//var z2 = api_message.sensor_data.gyro.float_value[2];

//		this.tx.append(Date.now(), x2);
//		this.ty.append(Date.now(), y2);
//		this.tz.append(Date.now(), z2);

	},
    onDataPoint: function (robotIP, api_message) {
        //console.log(api_message);
        var dataPoint = api_message.dataPoint;
        var label = dataPoint.label;
        var values = dataPoint.value;

        var stream = this.getStream(label, values);

        Ext.each(values, function (value, i) {
            stream.series[i].append(Date.now(), value);
        }, this);
    },
    getStream: function(label, values) {
        var value = null;
        Ext.each(this.streams, function (stream) {
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
            //this.smoothie.addTimeSeries(ts, {strokeStyle: 'rgb(' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ', ' + Math.round(Math.random() * 255) + ')', lineWidth: 2});
            series.push(ts);
        }
        value = {
            label: label,
            size: size,
            series: series,
            enabled: false
        };
        this.streams.push(value);
        this.streampicker.getStore().add({field1: label, field2: label});
        return value;
    }
});

