Ext.define('NU.controller.Chart', {
    extend: 'NU.controller.Display',
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
    control: {
        'view': {
            resize: 'onResize'
        },
        'streampicker': {
            change: 'onStreamSelect'
        },
        'canvas': true
    },
    init: function () {

        // init array
        this.setStreams([]);

        // setup canvas
        var canvas = this.getCanvas();
        var canvasDom = canvas.getEl().dom;
        WebGL2D.enable(canvasDom);
        this.setContext(canvasDom.getContext('webgl-2d'));

        // setup smoothie
        var smoothie = new SmoothieChart({
            interpolation: 'linear'
        });
        this.setSmoothie(smoothie);
        smoothie.streamTo(canvasDom, 0);

        // setup network hook
        NU.util.Network.on('data_point', Ext.bind(this.onDataPoint, this));

        this.callParent(arguments);

        this.onResize();

    },
    onStreamSelect: function (obj, newValue, oldValue, e) {
        var colours = this.getColours();
        var numColours = colours.length;
        Ext.each(this.getStreams(), function (stream) {
            var found = false;
            Ext.each(newValue, function (value) {
                if (value == stream.label) {
                    found = true;
                    return false;
                }
            }, this);
            Ext.each(stream.series, function (ts, i) {
                if (found) {
                    if (!stream.enabled) {
                        var colour;
                        if (i < numColours) {
                            colour = colours[i];
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
        var canvas = this.getCanvas();
        var canvasEl = canvas.getEl();
        var canvasDom = canvasEl.dom;

        if (canvas !== null) {
            canvasDom.width = canvasEl.getWidth();
            canvasDom.height = canvasEl.getHeight();
        }

    },
    onDataPoint: function (robotIP, api_message) {

        // TODO: remove
        if (robotIP !== this.getRobotIP()) {
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