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

        var PI2 = Math.PI/2;
		
		// head
		motors.head.angle.set(api_motor_data[19].position);
		motors.neck.angle.set(api_motor_data[18].position);
		
		// right arm
		// offset by pi/2 since 0 is arms straight out but model has 0 as arms straight down
		motors.rightShoulder.angle.set(api_motor_data[0].position - PI2);
		motors.rightUpperArm.angle.set(api_motor_data[2].position);
		motors.rightLowerArm.angle.set(api_motor_data[4].position);

		// left arm
		// offset by pi/2 since 0 is arms straight out but model has 0 as arms straight down
		motors.leftShoulder.angle.set(api_motor_data[1].position - PI2);
		motors.leftUpperArm.angle.set(api_motor_data[3].position);
		motors.leftLowerArm.angle.set(api_motor_data[5].position);

		// right pelvis
		motors.rightPelvis.angle.set(api_motor_data[8].position);
		motors.rightPelvisY.angle.set(api_motor_data[6].position);

		// left pelvis
		motors.leftPelvis.angle.set(api_motor_data[9].position);
		motors.leftPelvisY.angle.set(api_motor_data[7].position);

		// right leg
		motors.rightUpperLeg.angle.set(api_motor_data[10].position);
		motors.rightLowerLeg.angle.set(api_motor_data[12].position);
		motors.rightAnkle.angle.set(api_motor_data[14].position);
		motors.rightFoot.angle.set(api_motor_data[16].position);

		// left leg
		motors.leftUpperLeg.angle.set(api_motor_data[11].position);
		motors.leftLowerLeg.angle.set(api_motor_data[13].position);
		motors.leftAnkle.angle.set(api_motor_data[15].position);
		motors.leftFoot.angle.set(api_motor_data[17].position);
		
	},
	onLocalisation: function (api_localisation) {
		for (var i = 0; i < api_localisation.field_object.length; i++) {
			var fieldObject = api_localisation.field_object[i];

			var model;
			if(fieldObject.name == 'ball') {
				model = this.ballModel;

				// local Z is robots negative Y
				model.position.x = fieldObject.wm_x;
				model.position.z = -fieldObject.wm_y;
				
				var result = this.calculateErrorElipse(fieldObject.sr_xx, fieldObject.sr_xy, fieldObject.sr_yy);
				//console.log(result.x, result.y, result.angle);
				//model.visualiser.setWidth(result.x);
				//model.visualiser.setHeight(result.y);

				// local Z is robots negative Y
				model.visualiser.scale.x = result.x;
				model.visualiser.scale.z = result.y;
				model.visualiser.rotation.y = result.angle;
			} else if(fieldObject.name == 'self') {
				model = this.darwinModel;

				// local Z is robots negative Y
				model.position.x = fieldObject.wm_x;
				model.position.z = -fieldObject.wm_y;

				model.object.dataModel.localisation.angle.set(fieldObject.heading);

				//model.visualiser.rotation.x = -data.sensors.orientation[0];
				model.visualiser.rotation.y = Math.PI / 2;
				//model.visualiser.rotation.z = data.sensors.orientation[1];
				model.visualiser.setWidth(fieldObject.sd_x);
				model.visualiser.setHeight(fieldObject.sd_y);
			} else {
				return;
			}
		};
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