Ext.define('NU.view.field.Robot', {
	extend: 'Ext.util.Observable',
    alias: ['widget.nu_field_robot'],
	config: {
		robotIP: null,
        showOrientation: true
	},
	darwinModels: [],
    ballModels: [],
	fieldObjects: [],
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
     */
    addModel: function (model) {
        this.fireEvent('add-model', model);
        console.log(Ext.String.format("Adding {0} model", model.name));
    },
    /**
     * This method removes the model from the array and fires the event in the field controller to remove the
     * model from the scene.
     *
     * @param model the model to be removed from the field
     */
    removeModel: function (model) {
        // remove the model from the field objects array
        Ext.Array.remove(this.fieldObjects, model);
        // fire the event in the field controller to remove the model from the scene
        this.fireEvent('remove-model', model);
        // reduce the z height so the z does not increase over time
        LocalisationVisualiser.z -= LocalisationVisualiser.zDifference;
        console.log(Ext.String.format("Removing {0} model", model.name));
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
        var steps = 10;
        // the opacity to decrement and the mesh material from the model
        var opacity = 0.5 / steps;
	    var mesh = (model.object && model.object.mesh) || model.mesh;
	    var materials = [];
	    // add each material to the array and ensure it is able to be transparent
	    mesh.traverse(function (object) {
		    var material = object.material;
		    // check if there is a material on the child
		    if (material != undefined) {
			    materials.push(material);
			    material.transparent = true;
		    }
	    });
        // the method used upon each interval
        function updateClock () {
            // reduce the opacity of the mesh materials
	        Ext.each(materials, function (material) {
		        material.opacity -= opacity;
	        });
            // check if a visualiser exists
            if (model.visualiser != undefined) {
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
            }
            // check if the mesh should be removed from the scene
            if (materials[0].opacity <= 0) {
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
     * This method creates an arrow object.
     *
     * @param parameters the x, y coordinates and the direction, length, depth and color of the arrow
     * @returns {Arrow} an Arrow object
     */
    createArrowModel: function (parameters) {
        // create the arrow
        var arrow = new Arrow(parameters);
        // add the arrow to the list of field objects
        this.fieldObjects.push(arrow);
        return arrow;
    },
    /**
     * This method creates a box object.
     *
     * @param parameters the x, y coordinates and the width, height, depth and color of the box
     * @returns {Box} a Box object
     */
    createBoxModel: function (parameters) {
        // create a new box
        var box = new Box(parameters);
        // add the box to the list of field objects
        this.fieldObjects.push(box);
        return box;
    },
    /**
     * This method creates a circle object that can be used to represent a localisation visualiser.
     *
     * @param parameters the x, y coordinates and the width, height and rotation of the circle
     * @returns {Circle} a Circle object that can be used to represent a localisation visualiser
     */
    createCircleModel: function (parameters) {
        // create a new circle
        var circle = new Circle(parameters);
        // add the circle to the list of field objects
        this.fieldObjects.push(circle);
        return circle;
    },
    /**
     * This method creates a cylinder object that can be used to represent a goal post.
     *
     * @param parameters the x, y coordinates and the top and bottom radius, height, color and rotation of the cylinder
     * @returns {Cylinder} a Cylinder object that can be used to represent a goal post
     */
    createCylinderModel: function (parameters) {
        // create a new cylinder
        var cylinder = new Cylinder(parameters);
        // add the cylinder to the list of field objects
        this.fieldObjects.push(cylinder);
        return cylinder;
    },
    /**
     * This method creates a polygon object.
     *
     * @param parameters the x, y coordinates and the list of vertices of the polygon
     * @returns {PolyLine} a PolyLine object
     */
    createPolyLineModel: function (parameters) {
        // create a new polyline
        var polyLine = new PolyLine(parameters);
        // add the poyline to the list of field objects
        this.fieldObjects.push(polyLine);
        return polyLine;
    },
    /**
     * This method creates a pyramid object.
     *
     * @param parameters the x, y coordinates and the radius, height, amount of faces, color and rotation of the pyramid
     * @returns {Pyramid} a Pyramid object
     */
    createPyramidModel: function (parameters) {
        // create a new pyramid
        var pyramid = new Pyramid(parameters);
        // add the pyramid to the list of field objects
        this.fieldObjects.push(pyramid);
        return pyramid;
    },
    /**
     * This method creates a rectangle object.
     *
     * @param parameters the x, y coordinates and the width, length and color of the rectangle
     * @returns {Rectangle} a Rectangle object
     */
    createRectangleModel: function (parameters) {
        // create a new rectangle
        var rectangle = new Rectangle(parameters);
        // add the rectangle to the list of field objects
        this.fieldObjects.push(rectangle);
        return rectangle;
    },
    /**
     * This method creates a sphere object that can be used to represent the field ball.
     *
     * @param parameters the x, y coordinates and the radius and color of the sphere
     * @returns {Sphere} a Sphere object that represents a ball
     */
    createSphereModel: function (parameters) {
        // create a new sphere
        var sphere = new Sphere(parameters);
        // add the sphere to the list of field objects
        this.fieldObjects.push(sphere);
        return sphere;
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
