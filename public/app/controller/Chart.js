Ext.define('NU.controller.Chart', {
    extend: 'NU.controller.Display',
    views: ['window.Chart'],
    smoothie: null,
    canvas: null,
    context: null,
    streampicker: null,
    tx: null,
    ty: null,
    tz: null,
    lastDraw: 0,
    streams: [],
    refs: [{
        selector: 'nu_chart_window #canvas',
        ref: 'canvas'
    }, {
        selector: 'nu_chart_window #streampicker',
        ref: 'streampicker'
    }],
    init: function () {
        this.control({
            'nu_chart_window': {
                resize: this.onResize
            },
            'nu_chart_window #streampicker': {
                change: this.onStreamSelect
            }
        });

        NU.util.Network.on('data_point', Ext.bind(this.onDataPoint, this));

        this.callParent(arguments);
    },
    onLaunch: function () {

        this.canvas = this.getCanvas();
        this.streampicker = this.getStreampicker();
//        this.context = this.canvas.el.dom.getContext('2d');
//        this.smoothie = new SmoothieChart({interpolation: 'linear', maxValue:Math.PI,minValue:-Math.PI});
//        this.smoothie = new SmoothieChart({interpolation: 'linear', maxValue: 15, minValue: -15});

        this.smoothie = new SmoothieChart({interpolation: 'linear'});
        this.smoothie.streamTo(this.getCanvas().el.dom, 0);

    },
    onStreamSelect: function (obj, newValue, oldValue, e) {
        Ext.each(this.streams, function (stream) {
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
        }, this);
    },
    onResize: function (obj, width, height) {

        // TODO: fix onload size
        if (this.canvas !== null) {
            this.canvas.el.dom.width = this.canvas.el.getWidth();
            this.canvas.el.dom.height = this.canvas.el.getHeight();
        }

    },
    onDataPoint: function (robotIP, api_message) {

        // TODO: remove
        if (robotIP !== this.robotIP) {
            return;
        }

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
        this.streampicker.getStore().add(value);
        return value;
    }
});