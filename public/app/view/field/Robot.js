Ext.define('NU.view.field.Robot', {
	extend: 'Ext.util.Observable',
    alias : ['widget.nu_field_robot'],
	config: {
		robotIP: null
	},
	darwinModel: null,
	ballModel: null,
	constructor: function () {
		
		var darwin, ball;
		
		this.callParent(arguments);
		
		darwin = new DarwinOP();
//		var DarwinModel = Modeler.model(DarwinDataModel);
//        darwin.bindToData(DarwinModel);
//        var model = Ext.create('NU.model.DarwinOP');
//        darwin.setModel(model);
        darwin = LocalisationVisualiser.visualise(darwin);
        darwin = BehaviourVisualiser.visualise(darwin);
        
        field = new Field();
        ball = new Ball();
        ball = LocalisationVisualiser.visualise(ball, {color: 0x0000ff});
        ball.position.x = 0.2;
		
		this.darwinModel = darwin;
		this.ballModel = ball;
		
		return this;
		
	},
	onSensorData: function (api_sensor_data) {
		
		var darwin = this.darwinModel;
		var api_motor_data = api_sensor_data.servo;

        var PI2 = Math.PI/2;

        var ServoID = API.Sensors.ServoID;
        var model = darwin.object;

        model.rightShoulder.setAngle(api_motor_data[ServoID.R_SHOULDER_PITCH].present_position - PI2);
        model.leftShoulder.setAngle(api_motor_data[ServoID.L_SHOULDER_PITCH].present_position - PI2);
        model.rightUpperArm.setAngle(api_motor_data[ServoID.R_SHOULDER_ROLL].present_position);
        model.leftUpperArm.setAngle(api_motor_data[ServoID.L_SHOULDER_ROLL].present_position);
        model.rightLowerArm.setAngle(api_motor_data[ServoID.R_ELBOW].present_position);
        model.leftLowerArm.setAngle(api_motor_data[ServoID.L_ELBOW].present_position);
        model.rightPelvisY.setAngle(api_motor_data[ServoID.R_HIP_YAW].present_position);
        model.leftPelvisY.setAngle(api_motor_data[ServoID.L_HIP_YAW].present_position);
        model.rightPelvis.setAngle(api_motor_data[ServoID.R_HIP_ROLL].present_position);
        model.leftPelvis.setAngle(api_motor_data[ServoID.L_HIP_ROLL].present_position);
        model.rightUpperLeg.setAngle(api_motor_data[ServoID.R_HIP_PITCH].present_position);
        model.leftUpperLeg.setAngle(api_motor_data[ServoID.L_HIP_PITCH].present_position);
        model.rightLowerLeg.setAngle(api_motor_data[ServoID.R_KNEE].present_position);
        model.leftLowerLeg.setAngle(api_motor_data[ServoID.L_KNEE].present_position);
        model.rightAnkle.setAngle(api_motor_data[ServoID.R_ANKLE_PITCH].present_position);
        model.leftAnkle.setAngle(api_motor_data[ServoID.L_ANKLE_PITCH].present_position);
        model.rightFoot.setAngle(api_motor_data[ServoID.R_ANKLE_ROLL].present_position);
        model.leftFoot.setAngle(api_motor_data[ServoID.L_ANKLE_ROLL].present_position);
        model.neck.setAngle(api_motor_data[ServoID.HEAD_PAN].present_position);
        model.head.setAngle(api_motor_data[ServoID.HEAD_TILT].present_position);

        // swap axis because ThreeJS axis are different from the Robot (Y/Z swapped)
        var rotation = new THREE.Matrix4(
            api_sensor_data.orientation.yy, api_sensor_data.orientation.yz, api_sensor_data.orientation.yx, 0,
            api_sensor_data.orientation.zy, api_sensor_data.orientation.zz, api_sensor_data.orientation.zx, 0,
            api_sensor_data.orientation.xy, api_sensor_data.orientation.xz, api_sensor_data.orientation.xx, 0,
            0, 0, 0, 1
        );
        darwin.object.quaternion.setFromRotationMatrix(rotation);
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