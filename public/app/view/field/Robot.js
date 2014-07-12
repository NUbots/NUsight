Ext.define('NU.view.field.Robot', {
	extend: 'Ext.util.Observable',
    alias: ['widget.nu_field_robot'],
	config: {
		robotIP: null,
        showOrientation: true
	},
	darwinModels: [],
	ballModels: [],
	goalModels: [],
	obstacleModels: [],
    otherModels: [],
    constructor: function () {
        this.callParent(arguments);
        this.addEvents([
            'loaded',
            'model-list-resized',
            'add-model',
            'remove-model'
        ]);
        var darwin = this.createDarwinModel();
        this.darwinModels = [darwin];
        return this;
    },
	onSensorData: function (api_sensor_data) {
		this.darwinModels.forEach(function (darwinModel) {
			var darwin = darwinModel;
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

	        if (this.getShowOrientation()) {
	            var rotation = new THREE.Matrix4(
	                api_sensor_data.orientation.xx, api_sensor_data.orientation.xy, api_sensor_data.orientation.xz, 0,
	                api_sensor_data.orientation.yx, api_sensor_data.orientation.yy, api_sensor_data.orientation.yz, 0,
	                api_sensor_data.orientation.zx, api_sensor_data.orientation.zy, api_sensor_data.orientation.zz, 0,
	                0, 0, 0, 1
	            );
	            darwin.object.quaternion.setFromRotationMatrix(rotation.transpose());
	        }
	        // TODO: remove - walk engine orientation override for testing
	//        darwin.object.rotation.y = -15 * Math.PI / 180;
        }, this);
	},
	onLocalisation: function (api_localisation) {
		function updateModel(model, field_object) {
			model.position.x = field_object.wm_x;
			model.position.y = field_object.wm_y;
			model.rotation.z = field_object.heading;
			var result = this.calculateErrorElipse(field_object.sr_xx, field_object.sr_xy, field_object.sr_yy);
			model.visualiser.scale.x = result.x;
			model.visualiser.scale.z = result.y;
			model.visualiser.rotation.y = result.angle;
		}
		api_localisation.field_object.forEach(function (field_object) {
			if(field_object.name == 'ball') {
				// remove the old models
				this.fireEvent('ball-model-list-resized', field_object.models.length);
				for (var i = 0; i < field_object.models.length; i++) {
					var ball;
					if (i >= this.ballModels.length) {
						ball = this.createBallModel();
						this.ballModels.push(ball);
					} else {
						ball = this.ballModels[i];
					}

					updateModel.call(this, ball, field_object.models[i]);
				}
			} else if(field_object.name == 'self') {
				// remove the old models
				this.fireEvent('darwin-model-list-resized', field_object.models.length);
				for (var i = 0; i < field_object.models.length; i++) {
					var darwin;
					if (i >= this.darwinModels.length) {
						darwin = this.createDarwinModel();
						this.darwinModels.push(darwin);
					} else {
						darwin = this.darwinModels[i];
					}

					updateModel.call(this, darwin, field_object.models[i]);
				}
			}
		}, this);
	},
    createDarwinModel: function () {
        var darwin = new DarwinOP(function () {
            this.fireEvent('loaded');
        }, this);
        //		var DarwinModel = Modeler.model(DarwinDataModel);
        //        darwin.bindToData(DarwinModel);
        //        var model = Ext.create('NU.model.DarwinOP');
        //        darwin.setModel(model);
        darwin = LocalisationVisualiser.visualise(darwin);
        darwin = BehaviourVisualiser.visualise(darwin);
        return darwin;
    },
    /**
     * This method fires the event in the field controller to add the model in the scene.
     *
     * @param model the model to add to the field
     * @param name the name of the type of model e.g. ball, goal, etc
     */
    addModel: function (model, name) {
        this.fireEvent('add-model', model);
        console.log(Ext.String.format("Adding {0} model", name));
    },
    /**
     * This method removes the model from the correct array and fires the event in the field controller to remove the
     * model from the scene.
     *
     * @param model the model to be removed from the field
     */
    removeModel: function (model) {
        var name;
        // find which array the model belongs to and remove it from the array
        switch (true) {
            case Ext.Array.contains(this.ballModels, model): // ball
                Ext.Array.remove(this.ballModels, model);
                name = "ball";
                break;
            case Ext.Array.contains(this.goalModels, model): // goal
                Ext.Array.remove(this.goalModels, model);
                name = "goal";
                break;
            case Ext.Array.contains(this.obstacleModels, model): // obstacle
                Ext.Array.remove(this.obstacleModels, model);
                name = "obstacle";
                break;
            case Ext.Array.contains(this.otherModels, model): // other model
                Ext.Array.remove(this.otherModels, model);
                name = "other";
                break;
        }
        // fire the event in the field controller to remove the model from the scene
        this.fireEvent('remove-model', model);
        // reduce the z height so the z does not increase over time
        LocalisationVisualiser.z -= LocalisationVisualiser.zDifference;
        console.log(Ext.String.format("Removing {0} model", name));
    },
    /**
     * This method localises a particular model with a certain colour
     *
     * @param model the model being localised
     * @param color the colour being used for the localisation
     * @returns {*} the visual representation of the localisation for a particular model/object
     */
    localiseModel: function (model, color) {
        return LocalisationVisualiser.visualise(model, color);
    },
    /**
     * This method fades out a particular model using the material's
     *
     * @param model the model being faded out
     * @param time the amount of time in seconds when the model will fade out
     */
    fadeOutModel: function (model, time) {
        var me = this;
        // the number of steps to fade out
        var steps = 50;
        // the opacity to decrement and the mesh material from the model
        var opacity = 0.5 / steps;
        var material = model.object.mesh.material;
        // ensure the material is able to be transparent
        material.transparent = true;
        // the method used upon each interval
        function updateClock () {
            // reduce the opacity of the mesh material
            material.opacity -= opacity;
            // traverse through all of the visualiser's children (its certainty) and reduce the opacity
            model.visualiser.traverse(function (object) {
                if (object.mesh !== undefined) {
                    // get the material of the visualiser
                    var material = object.mesh.material;
                    // set the material to be transparent and reduce its opacity
                    material.transparent = true;
                    material.opacity -= opacity;
                }
            });
            // check if the mesh should be removed from the scene
            if (material.opacity <= 0) {
                // remove the model and stop the running task
                me.removeModel(model);
                Ext.TaskManager.stop(task);
            }
        }
        // the task being executed
        var task = Ext.TaskManager.start({
            run: updateClock,
            interval: time * 1000 / steps
        });
    },
    /**
     * This method creates a sphere object to represent the field ball.
     *
     * @param parameters the x, y coordinates and the radius and color of the sphere
     * @returns {Sphere} a Sphere object that represents a ball
     */
    createBallModel: function (parameters) {
        // create a new sphere
        var ball = new Sphere(parameters);
        // set the coordinates of the sphere
        var x = parameters.x || 0;
        var y = parameters.y || 0;
        ball.position = new THREE.Vector3(x, y, ball.position.z);
        // add the ball to the list of balls
        this.ballModels.push(ball);
        return ball;
    },
    /**
     * This method creates a cylinder object to represent the field goal.
     *
     * @param parameters the x, y coordinates and the top and bottom radius, height and color of the cylinder
     * @returns {Cylinder} a Cylinder object that represents a goal post
     */
    createGoalModel: function (parameters) {
        // create a new cylinder
        var goal = new Cylinder(parameters);
        // set the coordinates of the cylinder
        var x = parameters.x || 0;
        var y = parameters.y || 0;
        goal.position = new THREE.Vector3(x, y, goal.position.z);
        // add the goal to the list of goals
        this.goalModels.push(goal);
        return goal;
    },
    /**
     * This method creates a box object to represent an obstacle.
     *
     * @param parameters the x, y coordinates and the width, height, depth and color of the box
     * @returns {Box} a Box object that represents an obstacle
     */
    createObstacleModel: function (parameters) {
        // create a new box
        var obstacle = new Box(parameters);
        // set the coordinates of the box
        var x = parameters.x || 0;
        var y = parameters.y || 0;
        obstacle.position = new THREE.Vector3(x, y, obstacle.position.z);
        // add the obstacle to the list of obstacles
        this.obstacleModels.push(obstacle);
        return obstacle;
    },
    /**
     * This method creates a pyramid object to represent some model.
     *
     * @param parameters the x, y coordinates and the radius, height, amount of faces and color of the pyramid
     * @returns {Pyramid} a Pyramid object that represents some model
     */
    createOtherModel: function (parameters) {
        // create a new pyramid
        var other = new Pyramid(parameters);
        // set the coordinates of the pyramid
        var x = parameters.x || 0;
        var y = parameters.y || 0;
        other.position = new THREE.Vector3(x, y, other.position.z);
        // add the other model to the list of other models
        this.otherModels.push(other);
        return other;
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
