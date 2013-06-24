Ext.define('NU.FieldWindow.Robot', {
	extend: 'Ext.util.Observable',
	config: {
		robotIP: null
	},
	darwinModel: null,
	ballModel: null,
	constructor: function () {
		
		var darwin, ball;
		
		this.callParent(arguments);
		
		darwin = new DarwinOP();
		var DarwinModel = Modeler.model(DarwinDataModel);
        darwin.bindToData(DarwinModel);
        darwin = LocalisationVisualiser.visualise(darwin);
        darwin = BehaviourVisualiser.visualise(darwin);
        
        field = new Field();
        ball = new Ball();
        ball = LocalisationVisualiser.visualise(ball, {color: 0x0000ff});
        ball.position.x = 20;
		
		this.darwinModel = darwin;
		this.ballModel = ball;
		
		return this;
		
	},
	onSensorData: function (api_sensor_data) {
		
		var darwin = this.darwinModel;
		var dataModel = darwin.object.dataModel;
		var motors = dataModel.motors;
		var api_motor_data = api_sensor_data.motor;
		
		var orientation = this.vectorToArray(api_sensor_data.orientation, "float");
		dataModel.sensors.orientation[0].set(orientation[0]);
		dataModel.sensors.orientation[1].set(-orientation[1]);
		
		/*var chart = window.chart = Ext.getCmp('main_chart');
		if (chart && Date.now() - last > 250 && count % 200 <= 80) {
			//console.log(count, count / 100, count / 100 <= 0.4);
			var accelerometer = this.vectorToArray(api_sensor_data.accelerometer, "float");
			var x = accelerometer[0];
			var y = accelerometer[1];
			var z = accelerometer[2];
			chart.store.add(Ext.create('Vector', {time: Date.now(), x: x, y: y, z: z}));
			//chart.store.add(Ext.create('Vector', {time: Date.now(), x: Math.random()*1000, y: Math.random()*1000, z: Math.random()*1000}));
			//console.log(chart.store.data.items.length);
			while (chart.store.data.items.length >= 10) {
				chart.store.data.removeAt(0);
			}
			last = Date.now();
		}*/
		
		// head
		motors.head.angle.set(api_motor_data[0].position);
		motors.neck.angle.set(api_motor_data[1].position);
		
		// right arm
		// offset by pi/2 since 0 is arms straight out but model has 0 as arms straight down
		motors.rightShoulder.angle.set(api_motor_data[6].position - Math.PI/2);
		motors.rightUpperArm.angle.set(api_motor_data[5].position);
		motors.rightLowerArm.angle.set(api_motor_data[7].position);
		
		// left arm
		// offset by pi/2 since 0 is arms straight out but model has 0 as arms straight down
		motors.leftShoulder.angle.set(api_motor_data[3].position - Math.PI/2);
		motors.leftUpperArm.angle.set(api_motor_data[2].position);
		motors.leftLowerArm.angle.set(api_motor_data[4].position);
		
		// right pelvis
		motors.rightPelvis.angle.set(api_motor_data[14].position);
		motors.rightPelvisY.angle.set(api_motor_data[16].position);
		
		// left pelvis
		motors.leftPelvis.angle.set(api_motor_data[8].position);
		motors.leftPelvisY.angle.set(api_motor_data[10].position);
		
		// right leg
		motors.rightUpperLeg.angle.set(api_motor_data[15].position);
		motors.rightLowerLeg.angle.set(api_motor_data[17].position);
		motors.rightAnkle.angle.set(api_motor_data[19].position);
		motors.rightFoot.angle.set(api_motor_data[18].position);
		
		// left leg
		motors.leftUpperLeg.angle.set(api_motor_data[9].position);
		motors.leftLowerLeg.angle.set(api_motor_data[11].position);
		motors.leftAnkle.angle.set(api_motor_data[13].position);
		motors.leftFoot.angle.set(api_motor_data[12].position);
		
	},
	onLocalisation: function (api_localisation) {
		
		var ball = this.ballModel;
		var darwin = this.darwinModel;
		var dataModel = darwin.object.dataModel;
		var api_self = api_localisation.field_object[0];
		var api_ball = api_localisation.field_object[1];
		
		// local Z is robots negative Y
		darwin.position.x = api_self.wm_x;
		darwin.position.z = -api_self.wm_y;
		
		dataModel.localisation.angle.set(api_self.heading);
		
		//darwin.visualiser.rotation.x = -data.sensors.orientation[0];
		darwin.visualiser.rotation.y = Math.PI / 2;
		//darwin.visualiser.rotation.z = data.sensors.orientation[1];
		darwin.visualiser.setWidth(api_self.sd_x);
		darwin.visualiser.setHeight(api_self.sd_y);
		
		// local Z is robots negative Y
		ball.position.x = api_ball.wm_x;
		ball.position.z = -api_ball.wm_y;
		
		var result = this.calculateErrorElipse(api_ball.sr_xx, api_ball.sr_xy, api_ball.sr_yy);
		//console.log(result.x, result.y, result.angle);
		//ball.visualiser.setWidth(result.x);
		//ball.visualiser.setHeight(result.y);
		// local Z is robots negative Y
		ball.visualiser.scale.x = result.x;
		ball.visualiser.scale.z = result.y;
		ball.visualiser.rotation.y = result.angle;
		
	},
	vectorToArray: function (vector, type) {
		var arr = [];
		var values = vector[type + "_value"];
		for (var i = 0; i < values.length; i++) {
			arr.push(values[i]);
		}
		return arr;
	},
	calculateErrorElipse: function (xx, xy, yy) {
		
		var result, scalefactor, Eig1, Eig2, maxEig, minEig;
		
		result = {};
		
		scalefactor = 2.4477; // for 95% confidence.
		
		Eig1 = (xx + yy) / 2 + Math.sqrt(4 * xy * xy + (xx - yy) * (xx - yy)) / 2;
		Eig2 = (xx + yy) / 2 - Math.sqrt(4 * xy * xy + (xx - yy) * (xx - yy)) / 2;
	
		maxEig = Math.max(Eig1, Eig2);
		minEig = Math.min(Eig1, Eig2);
	
		if (Math.sqrt(xx) < Math.sqrt(yy)) {
			result.x = Math.sqrt(minEig) * scalefactor;
			result.y = Math.sqrt(maxEig) * scalefactor;
		} else {
			result.x = Math.sqrt(maxEig) * scalefactor;
			result.y = Math.sqrt(minEig) * scalefactor;
		}
	
		var aspectratio = 1.0;
		if (xx - yy != 0) {
			result.angle = 0.5 * Math.atan((1 / aspectratio) * (2 * xy) / (xx - yy));
		} else {
			// it is a circle, no angle!
			result.angle = 0;
		}
		
		return result;
	
	}
});