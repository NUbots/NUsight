Ext.define('NU.view.field.Robot', {
	extend: 'Ext.util.Observable',
	alias: ['widget.nu_field_robot'],
	requires: ['Ext.util.TaskManager'],
	config: {
		robotId: null,
		showOrientation: true,
		showOdometry: false,
		showLocalisation: false
	},
	applyShowOrientation: function (value) {
		if (!value) {
			this.robotModels.forEach(function (robotModel) {
				var model = robotModel.object;
				model.rotation.set(0, 0, 0);
			});
		}
		return value;
	},
	robotModels: [],
	ballModels: [],
	constructor: function (config) {
        this.initConfig(config);
		this.callParent(arguments);
		var newRobot;
		if(this.getRobotId().toLowerCase().includes('igus')) {
            newRobot = this.createDarwinModel(); // this.createIgusModel();
		}else {
			newRobot = this.createDarwinModel();
		}
		this.setShowOrientation(true);
		this.robotModels = [newRobot];
		return this;
	},
	onSensorData: function (api_sensor_data) {
		this.robotModels.forEach(function (robotModel) {
			var robot = robotModel;
			var api_motor_data = api_sensor_data.servo;

			var PI2 = Math.PI/2;
			var ServoID = {
                R_SHOULDER_PITCH    : 0,
                L_SHOULDER_PITCH    : 1,
                R_SHOULDER_ROLL     : 2,
                L_SHOULDER_ROLL     : 3,
                R_ELBOW             : 4,
                L_ELBOW             : 5,
                R_HIP_YAW           : 6,
                L_HIP_YAW           : 7,
                R_HIP_ROLL          : 8,
                L_HIP_ROLL          : 9,
                R_HIP_PITCH         : 10,
                L_HIP_PITCH         : 11,
                R_KNEE              : 12,
                L_KNEE              : 13,
                R_ANKLE_PITCH       : 14,
                L_ANKLE_PITCH       : 15,
                R_ANKLE_ROLL        : 16,
                L_ANKLE_ROLL        : 17,
                HEAD_PAN            : 18,
                HEAD_TILT           : 19,
            };
			var model = robot.object;

			if (api_motor_data.length > 0) {
				model.rightShoulder.setAngle(api_motor_data[ServoID.R_SHOULDER_PITCH].presentPosition - PI2);
				model.leftShoulder.setAngle(api_motor_data[ServoID.L_SHOULDER_PITCH].presentPosition - PI2);
				model.rightUpperArm.setAngle(api_motor_data[ServoID.R_SHOULDER_ROLL].presentPosition);
				model.leftUpperArm.setAngle(api_motor_data[ServoID.L_SHOULDER_ROLL].presentPosition);
				model.rightLowerArm.setAngle(api_motor_data[ServoID.R_ELBOW].presentPosition);
				model.leftLowerArm.setAngle(api_motor_data[ServoID.L_ELBOW].presentPosition);
				model.rightPelvisY.setAngle(api_motor_data[ServoID.R_HIP_YAW].presentPosition);
				model.leftPelvisY.setAngle(api_motor_data[ServoID.L_HIP_YAW].presentPosition);
				model.rightPelvis.setAngle(api_motor_data[ServoID.R_HIP_ROLL].presentPosition);
				model.leftPelvis.setAngle(api_motor_data[ServoID.L_HIP_ROLL].presentPosition);
				model.rightUpperLeg.setAngle(api_motor_data[ServoID.R_HIP_PITCH].presentPosition);
				model.leftUpperLeg.setAngle(api_motor_data[ServoID.L_HIP_PITCH].presentPosition);
				model.rightLowerLeg.setAngle(api_motor_data[ServoID.R_KNEE].presentPosition);
				model.leftLowerLeg.setAngle(api_motor_data[ServoID.L_KNEE].presentPosition);
				model.rightAnkle.setAngle(api_motor_data[ServoID.R_ANKLE_PITCH].presentPosition);
				model.leftAnkle.setAngle(api_motor_data[ServoID.L_ANKLE_PITCH].presentPosition);
				model.rightFoot.setAngle(api_motor_data[ServoID.R_ANKLE_ROLL].presentPosition);
				model.leftFoot.setAngle(api_motor_data[ServoID.L_ANKLE_ROLL].presentPosition);
				model.neck.setAngle(api_motor_data[ServoID.HEAD_PAN].presentPosition);
				model.head.setAngle(api_motor_data[ServoID.HEAD_TILT].presentPosition);
			}

			var rotation = new THREE.Matrix4();

			// Set our rotation from the worldToLocal matrix
			// Invert as we go to get world space translations/rotations
			// This is transposing the matrix as it is constructed
			rotation.set(
				api_sensor_data.world.x.x, api_sensor_data.world.x.y, api_sensor_data.world.x.z, 0,
				api_sensor_data.world.y.x, api_sensor_data.world.y.y, api_sensor_data.world.y.z, 0,
				api_sensor_data.world.z.x, api_sensor_data.world.z.y, api_sensor_data.world.z.z, 0,
				0, 0, 0, 1
			);

			var translation = new THREE.Vector4();
			translation.set(api_sensor_data.world.t.x, api_sensor_data.world.t.y, api_sensor_data.world.t.z, 0);
			// Apply inverse rotation (as its transposed above)
			translation.applyMatrix4(rotation);
			// Invert translation
			translation.negate();
			// Set our z position from our sensors
			model.position.setZ(translation.z);

			if (this.getShowOrientation() && !this.getShowLocalisation()) {
				// Apply orientation
				model.quaternion.setFromRotationMatrix(rotation);
			}

			if (this.getShowOdometry() && !this.getShowLocalisation()) {
				robot.position.setX(translation.x);
				robot.position.setY(translation.y);
			}

		}, this);
	},
	onLocalisation: function (api_localisation) {

		if(!this.getShowLocalisation()) {
			return;
		}

		function updateModel(model, field_object) {
			model.position.x = field_object.wmX;
			model.position.y = field_object.wmY;
			model.rotation.z = field_object.heading;
			var result = this.calculateErrorElipse(field_object.srXx, field_object.srXy, field_object.srYy);
			model.visualiser.scale.x = result.x;
			model.visualiser.scale.y = result.y;
			model.visualiser.rotation.z = result.angle;
		}
		api_localisation.fieldObject.forEach(function (field_object) {
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
				this.fireEvent('robot-model-list-resized', field_object.models.length);
				for (var i = 0; i < field_object.models.length; i++) {
					var robot;
					if (i >= this.robotModels.length) {
						robot = this.createDarwinModel();
						this.robotModels.push(robot);
					} else {
						robot = this.robotModels[i];
					}

					updateModel.call(this, robot, field_object.models[i]);
				}
			}
		}, this);
	},
	createBallModel: function () {
		var ball = new Sphere();
		ball = LocalisationVisualiser.visualise(ball, {
			color: 0x0000ff
		});
		return ball;
	},
	createDarwinModel: function () {
		var darwin = new DarwinOP(function () {
			this.fireEvent('loaded');
		}, this);
		//      var DarwinModel = Modeler.model(DarwinDataModel);
		//        darwin.bindToData(DarwinModel);
		//        var model = Ext.create('NU.model.DarwinOP');
		//        darwin.setModel(model);
		darwin = LocalisationVisualiser.visualise(darwin);
		darwin = BehaviourVisualiser.visualise(darwin);
		return darwin;
	},
	createIgusModel: function () {
		var igus = new IgusOP(function () {
			this.fireEvent('loaded');
		}, this);
		igus = LocalisationVisualiser.visualise(igus);
		igus = BehaviourVisualiser.visualise(igus);
		return igus;
	},
	/**
	 * This method fires the event in the field controller to add the model in the scene.
	 *
	 * @param model The model to add to the field.
	 * @param log Specifies whether the information should be logged. Defaults to true.
	 */
	addModel: function (model, log) {
		this.fireEvent('add-model', model);
		if (log !== false) {
			console.log(Ext.String.format("Adding {0} model", model.name));
		}
	},
	/**
	 * This method fires the event in the field controller to update an existing model in the scene.
	 *
	 * @param currentModel The model being updated.
	 * @param newModel The object information associated with the model.
	 */
	updateModel: function (currentModel, newModel) {
		this.removeModel(currentModel, false);
		this.addModel(newModel, false);
		//console.log(Ext.String.format("Updating {0} model", newModel.name));
	},
	/**
	 * This method removes the model from the array and fires the event in the field controller to remove the
	 * model from the scene.
	 *
	 * @param model The model to be removed from the field.
	 * @param log Specifies whether the information should be logged. Defaults to true.
	 */
	removeModel: function (model, log) {
		// Fire the event in the field controller to remove the model from the scene.
		this.fireEvent('remove-model', model);
		// Reduce the z height so the z does not increase over time.
		LocalisationVisualiser.z -= LocalisationVisualiser.zDifference;
		if (log !== false) {
			console.log(Ext.String.format("Removing {0} model", model.name));
		}
	},
	/**
	 * This method localises a particular model with a certain colour.
	 *
	 * @param model The model being localised.
	 * @param color The colour being used for the localisation.
	 * @returns {*} The visual representation of the localisation for a particular model/object.
	 */
	localiseModel: function (model, color) {
		return LocalisationVisualiser.visualise(model, color);
	},
	/**
	 * This method fades out a particular model using the material's opacity.
	 *
	 * @param model The model being faded out.
	 * @param time The amount of time in seconds when the model will fade out.
	 */
	fadeOutModel: function (model, time) {
		// The number of steps to fade out.
		var steps = 10;
		// The opacity to decrement and the mesh material from the model.
		var opacity = 0.5 / steps;
		var mesh = model && ((model.object && model.object.mesh) || model.mesh);
		// Check the mesh exists before proceeding.
		if (mesh) {
			var materials = [];
			// Add each material to the array and ensure it is able to be transparent.
			mesh.traverse(function (object) {
				var material = object.material;
				// Check if there is a material on the child.
				if (material !== undefined) {
					materials.push(material);
					material.transparent = true;
				}
			});
			// The method used upon each interval.
			var updateClock = function () {
				// Reduce the opacity of the mesh materials.
				Ext.each(materials, function (material) {
					material.opacity -= opacity;
				});
				// Check if a visualiser exists.
				if (model.visualiser != undefined) {
					// Traverse through all of the visualiser's children (its certainty) and reduce the opacity.
					model.visualiser.traverse(function (object) {
						if (object.mesh !== undefined) {
							// Get the material of the visualiser.
							var material = object.mesh.material;
							// Set the material to be transparent and reduce its opacity.
							material.transparent = true;
							material.opacity -= opacity;
						}
					});
				}
				// Check if the mesh should be removed from the scene.
				if (materials[0].opacity <= 0) {
					// Remove the model and stop the running task.
					this.removeModel(model);
					Ext.TaskManager.stop(task);
				}
			}.bind(this);
			// The task being executed.
			// TODO: check that this eventually stops
			var task = Ext.TaskManager.start({
				run: updateClock,
				interval: time * 1000 / steps
			});
		}
	},
	/**
	 * This method creates an arrow object.
	 *
	 * @param parameters The x, y coordinates and the direction, length, depth and color of the arrow.
	 * @returns {Arrow} An Arrow object.
	 */
	createArrowModel: function (parameters) {
		return new Arrow(parameters);
	},
	/**
	 * This method creates a box object.
	 *
	 * @param parameters The x, y coordinates and the width, height, depth and color of the box.
	 * @returns {Box} A Box object.
	 */
	createBoxModel: function (parameters) {
		return new Box(parameters);
	},
	/**
	 * This method creates a circle object that can be used to represent a localisation visualiser.
	 *
	 * @param parameters The x, y coordinates and the width, height and rotation of the circle.
	 * @returns {Circle} A Circle object that can be used to represent a localisation visualiser.
	 */
	createCircleModel: function (parameters) {
		return new Circle(parameters);
	},
	/**
	 * This method creates a cylinder object that can be used to represent a goal post.
	 *
	 * @param parameters The x, y coordinates and the top and bottom radius, height, color and rotation of the cylinder.
	 * @returns {Cylinder} A Cylinder object that can be used to represent a goal post.
	 */
	createCylinderModel: function (parameters) {
		return new Cylinder(parameters);
	},
	/**
	 * This method creates a polyline object.
	 *
	 * @param parameters The x, y coordinates and the list of vertices of the polyline.
	 * @returns {Polyline} A Polyline object.
	 */
	createPolylineModel: function (parameters) {
		return new Polyline(parameters);
	},
	/**
	 * This method creates a pyramid object.
	 *
	 * @param parameters The x, y coordinates and the radius, height, amount of faces, color and rotation of the
	 * pyramid.
	 * @returns {Pyramid} A Pyramid object.
	 */
	createPyramidModel: function (parameters) {
		return new Pyramid(parameters);
	},
	/**
	 * This method creates a rectangle object.
	 *
	 * @param parameters The x, y coordinates and the width, length and color of the rectangle.
	 * @returns {Rectangle} A Rectangle object.
	 */
	createRectangleModel: function (parameters) {
		return new Rectangle(parameters);
	},
	/**
	 * This method creates a sphere object that can be used to represent the field ball.
	 *
	 * @param parameters The x, y coordinates and the radius and color of the sphere.
	 * @returns {Sphere} A Sphere object that represents a ball.
	 */
	createSphereModel: function (parameters) {
		return new Sphere(parameters);
	},

	createRobotGrid: function(parameters) {
		var grid = new CubeGrid(parameters);
		this.robotGrid = grid;
		return grid;
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
		//based on
		// http://www.math.harvard.edu/archive/21b_fall_04/exhibits/2dmatrices/index.html
		// and
		// http://www.visiondummy.com/2014/04/draw-error-ellipse-representing-covariance-matrix/
		var result, scalefactor, Eig1, Eig2, maxEig, minEig;
		result = {};
		scalefactor = 2.4477; // for 95% confidence.

		var trace = xx+yy
		var det = xx * yy - xy * xy

		Eig1 = trace / 2 + Math.sqrt(trace * trace / 4 - det)
		Eig2 = trace / 2 - Math.sqrt(trace * trace / 4 - det)

		maxEig = Math.max(Eig1, Eig2);
		minEig = Math.min(Eig1, Eig2);

		result.x = Math.sqrt(maxEig) * scalefactor;
		result.y = Math.sqrt(minEig) * scalefactor;

		result.angle = Math.atan2(xy,maxEig-yy);

		return result;
	}
});
