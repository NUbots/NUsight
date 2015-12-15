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
        //TODO: remove #component-1023 to the correct code

        //var element = this.lookupReference('scatter').getEl();
        var chart = new ScatterPlotGraph(this.lookupReference('scatter').getEl().id);

        this.setChart(chart);
        //testing real time
        var that = this;
        setInterval(function(){
            var random = d3.random.normal();
            that.onDataPoint(-1,
                {
                    label: name + " Load",
                    value: [
                        20 + Math.random() * 600, 20 + Math.random() * 440
                    ]
                }, 1);
        }, 1000 / 90);
        chart.render();
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
        /*        var canvas = this.lookupReference('scatter');
         var canvasEl = canvas.getEl();

         var chart = this.getChart();

         nv.utils.windowResize(function() {
         chart.width(canvasEl.getWidth());
         chart.height(canvasEl.getHeight());
         });*/

        this.getChart().resize();
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
        // TODO: remove
        /*  if (robot.get('id') !== this.getRobotId()) {
         return;
         }*/
        console.log('adding data');
        var label = dataPoint.label;
        var values = dataPoint.value;

        var data = this.getData();
        var dataSet = null;

        /*
         for(var i = 0; i < data.length; i++) {
         if(data[i].key === label) {
         dataSet = data[i];
         break;
         }
         }
         */

        //if(values[0] !== null && values[1] !== null) {
        var chart = this.getChart();
        chart.addData(Math.random() * 1240, Math.random() * 680);
        //chart.addData(values[0], values[1]);
        chart.render();
        //}
        /*        if(dataSet == null) {
         data.push({
         key: label,
         values: [
         {x: values[0], y: values[1], size: 1}
         ]
         }
         );
         }else {

         dataSet.values.push({
         x: values[0], y: values[1], size: 1
         });
         }  */


    },

    getStream: function (label, values) {
    },

    onPause: function (button) {
    }

});