Ext.define('Ext.ux.NU.ChartWindow', {
	extend : 'Ext.ux.NU.DisplayWindow',
	alias : ['widget.nu.chart_window'],
	autoShow: true,
	title: 'Chart Display',
	width: 320,
	height: 240,
	smoothie: null,
	canvas: null,
	context: null,
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
	}],
	constructor: function () {
		
		NU.Network.on('sensor_data', Ext.bind(this.onSensorData, this));
		
		this.callParent(arguments);
		
	},
	listeners: {
		afterRender: function () {
			
			this.varDisplay = this.down('#varDisplay');
			this.canvas = this.down('#canvas');
			//this.context = this.canvas.el.dom.getContext('2d');
			//this.smoothie = new SmoothieChart({interpolation: 'linear', maxValue:Math.PI,minValue:-Math.PI});
			//this.smoothie = new SmoothieChart({interpolation: 'linear'});
			this.smoothie = new SmoothieChart({interpolation: 'linear', maxValue: 15, minValue: -15});
			this.smoothie.streamTo(this.canvas.el.dom, 0);
			
			this.tx = new TimeSeries();
			this.ty = new TimeSeries();
			this.tz = new TimeSeries();
			
			this.smoothie.addTimeSeries(this.tx, {strokeStyle: 'rgb(255, 0, 0)', lineWidth: 2});
			this.smoothie.addTimeSeries(this.ty, {strokeStyle: 'rgb(0, 255, 0)', lineWidth: 2});
			this.smoothie.addTimeSeries(this.tz, {strokeStyle: 'rgb(0, 0, 255)', lineWidth: 2});
			
		},
		resize: function (obj, width, height) {
			
			this.canvas.el.dom.width = obj.body.getWidth();
			this.canvas.el.dom.height = obj.body.getHeight();
			
		}
	},
	onSensorData: function (robotIP, api_message) {
		
		// do stuff
		//var x2 = api_message.sensor_data.orientation.float_value[0];
		//var y2 = api_message.sensor_data.orientation.float_value[1];
		//var z2 = api_message.sensor_data.orientation.float_value[2];
		var x2 = api_message.sensor_data.accelerometer.float_value[0];
		var y2 = api_message.sensor_data.accelerometer.float_value[1];
		var z2 = api_message.sensor_data.accelerometer.float_value[2];
		//var x2 = api_message.sensor_data.gyro.float_value[0];
		//var y2 = api_message.sensor_data.gyro.float_value[1];
		//var z2 = api_message.sensor_data.gyro.float_value[2];
		
		this.tx.append(Date.now(), x2);
		this.ty.append(Date.now(), y2);
		this.tz.append(Date.now(), z2);
	
	}
});