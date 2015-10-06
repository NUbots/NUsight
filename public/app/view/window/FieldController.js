Ext.define('NU.view.window.FieldController', {
	extend: 'NU.view.window.DisplayController',
	alias: 'controller.Field',
	mainScene: null,
	objects: null,
	objectsList: null,
	robots : null,
	// Shape enum.
	Shape: {
		ARROW:      {name: 'Arrow'},
		BOX:        {name: 'Box'},
		CIRCLE:     {name: 'Circle'},
		CYLINDER:   {name: 'Cylinder'},
		POLYLINE:   {name: 'Polyline'},
		PYRAMID:    {name: 'Pyramid'},
		RECTANGLE:  {name: 'Rectangle'},
		SPHERE:     {name: 'Sphere'}
	},
	config: {
		closeDistance: 0.4,
		closeHeight: 0.2
	},
	constructor: function () {
		this.robots = [];
		this.objects = {};
		this.objectsList = [];
		this.callParent(arguments);
	},

	init: function () {
		this.addEvents();
	},

	addEvents: function () {
		this.mon(NU.Network, {
			addRobot: this.onAddRobot,
			'messages.localisation.proto.Localisation': this.onLocalisation,
			'messages.support.nubugger.proto.DrawObjects': this.onDrawObjects,
			'messages.input.proto.Sensors': this.onSensorData,
			scope: this
		});
	},

	onHawkEye: function () {
		// These controls use Threejs coordinates not field coordinates
		var controls = this.lookupReference('mainscene').controls;
		controls.yawObject.position.set(0, 4.5, 0);
		controls.yawObject.rotation.set(0, 0, 0);
		controls.pitchObject.rotation.set(-Math.PI / 2, 0, 0);
	},

	onCloseFront: function () {
		// These controls use Threejs coordinates not field coordinates
		var controls = this.lookupReference('mainscene').controls;
		controls.yawObject.position.set(this.getCloseDistance(), this.getCloseHeight(), 0);
		controls.yawObject.rotation.set(0, Math.PI / 2, 0);
		controls.pitchObject.rotation.set(0.05, 0, 0);
	},

	onCloseAngle: function () {
		// These controls use Threejs coordinates not field coordinates
		var controls = this.lookupReference('mainscene').controls;
		var dist = this.getCloseDistance() / Math.sqrt(2);
		controls.yawObject.position.set(dist, this.getCloseHeight(), -dist);
		controls.yawObject.rotation.set(0, 3 * Math.PI / 4, 0);
		controls.pitchObject.rotation.set(0.05, 0, 0);
	},

	onCloseSide: function () {
		// These controls use Threejs coordinates not field coordinates
		var controls = this.lookupReference('mainscene').controls;
		controls.yawObject.position.set(0, this.getCloseHeight(), -this.getCloseDistance());
		controls.yawObject.rotation.set(0, Math.PI, 0);
		controls.pitchObject.rotation.set(0.05, 0, 0);
	},

	onAnaglyph: function (obj, newValue, oldValue, eOpts) {
		this.lookupReference('mainscene').setRenderEffect(newValue);
	},

	onGamepad: function (obj, newValue, oldValue, eOpts) {
		var controls = this.lookupReference('mainscene').controls;
		controls.gamepad = newValue;
	},

	onInverted: function (obj, newValue, oldValue, eOpts) {
		var controls = this.lookupReference('mainscene').controls;
		controls.inverted = newValue;
	},

	onDisplayCrosshair: function (obj, newValue, oldValue, eOpt) {
		var crosshair = this.getCrosshair();
		crosshair.setVisible(crosshair.isHidden() ? true : false);
	},

	onOrientation: function (obj, newValue, oldValue, eOpts) {
		this.robots.forEach(function (robot) {
			robot.setShowOrientation(newValue);
		});
	},

	onResetOrientation: function () {
		this.robots.forEach(function (robot) {
			robot.darwinModels.forEach(function (model) {
				model.object.rotation.set(0, 0, 0);
			});
		});
	},

	onAfterRender: function () {
		this.mainScene = this.createMainScene();
		var mainScene = this.lookupReference('mainscene');
		mainScene
			.setComponents(this.mainScene.scene, this.mainScene.renderer, this.mainScene.camera, this.mainScene.effect)
			.enableControls({
				movementSpeed: 2
			}, this.objectsList, this.lookupReference('coordinates'));

		var controls = mainScene.controls;
		controls.yawObject.position.set(0, 4.5, 0);
		controls.yawObject.rotation.set(0, 0, 0);
		controls.pitchObject.rotation.set(-Math.PI / 2, 0, 0);

		NU.Network.getRobotStore().each(function (robot) {
			this.onAddRobot(robot);
		}, this);
	},

	onSelectRobot: function (robotId) {
		this.robots.forEach(function (robot) {
			if (robot.robotId !== robotId) {
				robot.darwinModels.forEach(function (model) {
					model.traverse(function (object) {
						object.visible = false;
					});
				});
				robot.ballModels.forEach(function (model) {
					model.traverse(function (object) {
						object.visible = false;
					});
				});
			} else {
				robot.darwinModels.forEach(function (model) {
					model.traverse(function (object) {
						object.visible = true;
					});
				});
				robot.ballModels.forEach(function (model) {
					model.traverse(function (object) {
						object.visible = true;
					});
				});
			}
		});
		this.setRobotId(robotId);
	},

	onAddRobot: function (newRobot) {
		var robot = this.getRobot(newRobot.id);

		if (robot !== null) {
			return; // TODO: already exists
		}

		robot = Ext.create('NU.view.field.Robot', {
			robotId: newRobot.id
		});

		robot.on('loaded', function () {
			// Hide if we are not currently selected
			if (newRobot.id !== this.getRobotId()) {
				robot.darwinModels.forEach(function (model) {
					model.traverse(function (object) {
						object.visible = false;
					});
				});
				robot.ballModels.forEach(function (model) {
					model.traverse(function (object) {
						object.visible = true;
					});
				});
			}
			robot.darwinModels.forEach(function (model) {
				this.mainScene.scene.add(model);
			}, this);
			robot.ballModels.forEach(function (model) {
				this.mainScene.scene.add(model);
			}, this);
		}, this);

		robot.on('darwin-model-list-resized', function (numModels) {
			for (var i = 0; i < robot.darwinModels.length; i++) {
				if (i < numModels) {
					robot.darwinModels[i].traverse(function (object) {
						object.visible = true;
					});
				} else {
					robot.darwinModels[i].traverse(function (object) {
						object.visible = false;
					});
				}
			}
		}, this);

		robot.on('ball-model-list-resized', function (numModels) {
			for (var i = 0; i < robot.ballModels.length; i++) {
				if (i < numModels) {
					robot.ballModels[i].traverse(function (object) {
						object.visible = true;
					});
				} else {
					robot.ballModels[i].traverse(function (object) {
						object.visible = false;
					});
				}
			}
		}, this);

		/**
		 * Fires when a model is added onto a robot. This method adds the object into the scene and the objects array.
		 */
		robot.on('add-model', function (object) {
			this.mainScene.scene.add(object);
			this.objects[object.name] = object;
			this.objectsList.push(object);
		}, this);

		/**
		 * Fires when a ball model is being removed from the robot. This method removes the ball from the scene and
		 * the objects array.
		 */
		robot.on('remove-model', function (object) {
			this.mainScene.scene.remove(object);
			delete this.objects[object.name];
			Ext.Array.remove(this.objectsList, object);
		}, this);
//      robot.darwinModel.behaviourVisualiser.rotation.y = robot.darwinModel.object.dataModel.localisation.angle.get();

		this.robots.push(robot);
		//todo remove this:
		//this.onAddObject(robot);
		//this.addObject(robot.darwinModels);
		//todo this.addObject(robot.ballModels);
	},

	onSensorData: function (rInfo, api_sensor_data) {
		var robot = this.getRobot(rInfo.get('id'));
		if (robot == null) {
			// TODO: console.log('error', robotIP);
			return;
		}
		robot.onSensorData(api_sensor_data);
	},

	onLocalisation: function (rInfo, api_localisation) {
		var robot = this.getRobot(rInfo.get('id'));
		if (robot == null) {
			console.log('error', rInfo);
			return;
		}
		robot.onLocalisation(api_localisation);
	},

	onDrawObjects: function (rInfo, event, timestamp) {
		// TODO: remove
		if (rInfo.get('id') !== this.getRobotId()) {
			return;
		}
		// Get the robot from the IP sent from the network.
		var robot = this.getRobot(rInfo.get('id'));
		// Iterate through each of the objects being added to the field.
		Ext.each(event.getObjects(), function (object) {
			// Get the field object from the objects on the field.
			var fieldObject = this.objects[object.getName()];
			// Check if the object should be added to the scene.
			if (fieldObject === undefined) {
				// Create the model based on the object and add the model to the field.
				var model = this.createModel(robot, object);
				robot.addModel(model, false);
			} else {
				var currentModel = this.objects[object.getName()];
				var newModel = this.createModel(robot, object);
				robot.updateModel(currentModel, newModel);
			}
			// // Get the timeout of the object.
			// var timeout = object.getTimeout();
			// // Check if the object should fade out.
			// if (timeout !== 0) {
			// 	// Fade out the model using the specified timeout.
			// 	robot.fadeOutModel(model, timeout === null ? 2.5 : timeout);
			// }
		}, this);
	},

	/**
	 * Converts a protocol vec3 into a THREE.js one.
	 *
	 * @param vector The vector being converted.
	 * @returns {THREE.Vector3} The THREE.js vector.
	 */
	toVec3: function (vector) {
		return vector === null ? new THREE.Vector3() : new THREE.Vector3(vector.getX(), vector.getY(), vector.getZ());
	},

	toEuler: function (euler) {
		return euler === null ? new THREE.Euler() : new THREE.Euler(euler.getX(), euler.getY(), euler.getZ(), 'XYZ');
	},

	toColor: function (vector) {
		return vector === null ? vector : new THREE.Color(vector.getX(), vector.getY(), vector.getZ());
	},

	createModel: function (robot, object) {
		// Create a new shape onto the specified robot.
		var Shape = API.messages.support.nubugger.proto.DrawObject.Shape;
		switch (object.getShape()) {
			case Shape.ARROW:
				return this.createArrowModel(robot, object);
			case Shape.BOX:
				return this.createBoxModel(robot, object);
			case Shape.CIRCLE:
				return this.createCircleModel(robot, object);
			case Shape.CYLINDER:
				return this.createCylinderModel(robot, object);
			case Shape.POLYLINE:
				return this.createPolylineModel(robot, object);
			case Shape.PYRAMID:
				return this.createPyramidModel(robot, object);
			case Shape.RECTANGLE:
				return this.createRectangleModel(robot, object);
			case Shape.SPHERE:
				return this.createSphereModel(robot, object);
		}
		// Check if we want to display the certainty circle.
		/* TODO
		 if (object.getDisplayCertainty()) {
		 // display the certainty of the model
		 model = robot.localiseModel(model, object.getCertaintyColour());
		 }*/
	},

	/**
	 * Creates and returns an arrow model.
	 *
	 * @param robot The selected robot.
	 * @param object The protocol buffer that contains the object information.
	 * @returns {*|Arrow} The arrow model.
	 */
	createArrowModel: function (robot, object) {
		return robot.createArrowModel({
			name: object.getName(),
			position: this.toVec3(object.getPosition()),
			target: this.toVec3(object.getTarget()),
			direction: this.toVec3(object.getDirection()),
			length: object.getLength(),
			depth: object.getDepth(),
			color: this.toColor(object.getColour())
		});
	},

	/**
	 * Creates and returns a box model.
	 *
	 * @param robot The selected robot.
	 * @param object The protocol buffer that contains the object information.
	 * @returns {*|Box} The box model.
	 */
	createBoxModel: function (robot, object) {
		return robot.createBoxModel({
			name: object.getName(),
			position: this.toVec3(object.getPosition()),
			width: object.getWidth(),
			height: object.getHeight(),
			depth: object.getDepth(),
			color: this.toColor(object.getColour())
		});
	},

	/**
	 * Creates and returns a circle model.
	 *
	 * @param robot The selected robot.
	 * @param object The protocol buffer that contains the object information.
	 * @returns {*|Circle} The circle model.
	 */
	createCircleModel: function (robot, object) {
		return robot.createCircleModel({
			name: object.getName(),
			position: this.toVec3(object.getPosition()),
			width: object.getWidth(),
			height: object.getHeight(),
			rotation: this.toVec3(object.getRotation()),
			color: this.toColor(object.getColour())
		});
	},

	/**
	 * Creates and returns a cylinder model.
	 *
	 * @param robot The selected robot.
	 * @param object The protocol buffer that contains the object information.
	 * @returns {*|Cylinder} The cylinder model.
	 */
	createCylinderModel: function (robot, object) {
		return robot.createCylinderModel({
			name: object.getName(),
			position: this.toVec3(object.getPosition()),
			topRadius: object.getTopRadius(),
			bottomRadius: object.getBottomRadius(),
			height: object.getHeight(),
			rotation: this.toVec3(object.getRotation()),
			color: this.toColor(object.getColour())
		});
	},

	/**
	 * Creates and returns a polyline model.
	 *
	 * @param robot The selected robot.
	 * @param object The protocol buffer that contains the object information.
	 * @returns {*|Polyline} The polyline model.
	 */
	createPolylineModel: function (robot, object) {
		return robot.createPolylineModel({
			name: object.getName(),
			path: object.getPath(),
			width: object.getWidth(),
			color: this.toColor(object.getColour())
		});
	},

	/**
	 * Creates and returns a pyramid model.
	 *
	 * @param robot The selected robot.
	 * @param object The protocol buffer that contains the object information.
	 * @returns {*|Pyramid} The pyramid model.
	 */
	createPyramidModel: function (robot, object) {
		return robot.createPyramidModel({
			name: object.getName(),
			position: this.toVec3(object.getPosition()),
			radius: object.getRadius(),
			height: object.getHeight(),
			faces: object.getFaces(),
			rotation: this.toVec3(object.getRotation()),
			color: this.toColor(object.getColour())
		});
	},

	/**
	 * Creates and returns a rectangle model.
	 *
	 * @param robot The selected robot.
	 * @param object The protocol buffer that contains the object information.
	 * @returns {*|Rectangle} The rectangle model.
	 */
	createRectangleModel: function (robot, object) {
		return robot.createRectangleModel({
			name: object.getName(),
			position: this.toVec3(object.getPosition()),
			rotation: this.toEuler(object.getRotation()),
			width: object.getWidth(),
			length: object.getLength(),
			color: this.toColor(object.getColour())
		});
	},

	/**
	 * Creates and returns a sphere model.
	 *
	 * @param robot The selected robot.
	 * @param object The protocol buffer that contains the object information.
	 * @returns {*|Sphere} The sphere model.
	 */
	createSphereModel: function (robot, object) {
		return robot.createSphereModel({
			name: object.getName(),
			position: this.toVec3(object.getPosition()),
			radius: object.getRadius(),
			color: this.toColor(object.getColour())
		});
	},

	/**
	 * A testing method for adding objects to the field.
	 *
	 * @param robot The robot having the object added to.
	 */
	onAddObject: function (robot) {
		// Loop every five seconds.
		//var add = setInterval(function () {
			// Get the shape requested over the network.
			var shape = function () {
				var index = Math.floor(Math.random() * Object.keys(this.Shape).length);
				return Ext.Object.getValues(this.Shape)[index];
			}.bind(this)();
			var model;
			var color;
			var displayCertainty = true;
			// Get the x and y coordinates requested over the network.
			var position = new THREE.Vector3(Math.random() * 2, Math.random() * 2, Math.random() * 2);
			// Create a new shape onto the specified robot.
			switch (this.Shape.POLYLINE) {//(shape) {
				case this.Shape.ARROW:
					model = robot.createArrowModel({
						position: position,
						target: new THREE.Vector3(1, 1, 2)
					});
					displayCertainty = false;
					break;
				case this.Shape.BOX:
					model = robot.createBoxModel({
						position: position
					});
					color = 0x000000;
					break;
				case this.Shape.CIRCLE:
					model = robot.createCircleModel({
						position: position
					});
					color = 0xF1400D;
					break;
				case this.Shape.CYLINDER:
					model = robot.createCylinderModel({
						position: position
					});
					color = 0xFF5E45;
					break;
				case this.Shape.POLYLINE:
					model = robot.createPolylineModel({
						path: [{
							position: {x: 1, y: 1},
							parentIndex: 0
						}, {
							position: {x: 1.5, y: 3},
							parentIndex: 0
						}, {
							position: {x: 5, y: 2},
							parentIndex: 0
						}, {
							position: {x: 0, y: -2},
							parentIndex: 2
						}, {
							position: {x: 0, y: -1},
							parentIndex: 0
						}]
					});
					break;
				case this.Shape.PYRAMID:
					model = robot.createPyramidModel({
						position: position
					});
					color = 0x155412;
					break;
				case this.Shape.RECTANGLE:
					model = robot.createRectangleModel({
						position: position
					});
					displayCertainty = false;
					color = 0x55FF33;
					break;
				case this.Shape.SPHERE:
					model = robot.createSphereModel({
						position: position
					});
					color = 0x0000ff;
					break;
			}
			/*if (displayCertainty) {
			 // localise the model
			 model = robot.localiseModel(model, {
			 color: color
			 });
			 } */
			// Call the method to fire the event to add the goal to the field.
			robot.addModel(model, false);
			// Fade the model out using the specified time.
			//robot.fadeOutModel(model, 2.5);
		//}.bind(this), 2500);
	},

	getRobot: function (robotId) {
		var foundRobot = null;
		Ext.each(this.robots, function (robot) {
			if (robot.robotId == robotId) {
				foundRobot = robot;
				return false;
			}
			return true;
		});
		return foundRobot;
	},

	createMainScene: function () {
		var field, camera, scene, renderer;
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 50);
		camera.lookAt(scene.position);

		/*darwin = new DarwinOP();
		 //var DarwinModel = window.dm = Modeler.model(DataModel);
		 darwin.bindToData(Data.robot);
		 darwin = LocalisationVisualiser.localise(darwin);//, new THREE.Vector3(0, -0.343, 0)
		 window.darwin = darwin;

		 ball = new Ball();
		 ball = LocalisationVisualiser.localise(ball, {color: 0x0000ff});
		 ball.position.x = 20;
		 window.ball = ball;

		 scene.add(darwin);
		 scene.add(ball);*/

		field = new Field();
		scene.add(field);
		// Adds the field to the field objects.
		this.objects['field'] = field;
		this.objectsList.push(field);

		//var circle = new THREE.Circle();
		//scene.add(circle);
		//window.circle = circle;

		/* debug */
		// red = x
		// green = y
		// blue = z
		//Axis array[x,y,z]
		/*var axisLength = 4;

		 var info = [[-axisLength, 0, 0, axisLength, 0, 0, 0xff0000], [0, -axisLength ,0 , 0, axisLength, 0, 0x00ff00], [0, 0, -axisLength, 0, 0, axisLength, 0x0000ff]];

		 //Draw some helpfull axis
		 for (var i = 0; i < 3; i++) {
		 var material = new THREE.MeshBasicMaterial({color: 0xffffff});
		 var geometry = new THREE.Geometry();

		 //Define the start point
		 var particle = new THREE.Particle(material);
		 particle.position.x = info[i][0];
		 particle.position.y = info[i][1];
		 particle.position.z = info[i][2];

		 //Add the new particle to the scene
		 scene.add(particle);

		 //Add the particle position into the geometry object
		 geometry.vertices.push(new THREE.Vertex(particle.position));

		 //Create the second point
		 particle = new THREE.Particle(material);
		 particle.position.x = info[i][3];
		 particle.position.y = info[i][4];
		 particle.position.z = info[i][5];

		 //Add the new particle to the scene
		 scene.add(particle);

		 //Add the particle position into the geometry object
		 geometry.vertices.push(new THREE.Vertex(particle.position));

		 //Create the line between points
		 var line = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: info[i][6], opacity: 0.8, linewidth: 1}));
		 scene.add(line);
		 }*/
		renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		renderer.setClearColor("#000");
		renderer.setSize(window.innerWidth, window.innerHeight);

		var effect = new THREE.AnaglyphEffect(renderer);
		effect.setSize(window.innerWidth, window.innerHeight);

		return {
			scene: scene,
			camera: camera,
			renderer: renderer,
			effect: effect
		};
	}

});
