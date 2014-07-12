Ext.define('NU.controller.Field', {
	extend: 'NU.controller.Display',
	config: {
		mainScene: null,
		robots: [],
		closeDistance: 0.4,
		closeHeight: 0.2,
		objects: [],
        // shape enum
        Shape: {
            BOX: {
	            value: 0,
	            name: "Box"
            },
            CIRCLE: {
	            value: 1,
	            name: "Circle"
            },
            CYLINDER: {
	            value: 2,
	            name: "Cylinder"
            },
            PYRAMID: {
	            value: 3,
	            name: "Pyramid"
            },
            SPHERE: {
	            value: 4,
	            name: "Sphere"
            }
        }
	},
	control: {
        'mainscene': true,
		'coordinates': true,
		'crosshair': true,
		'hawkeye': {
			click: function () {
				// These controls use Threejs coordinates not field coordinates
				var controls = this.getMainscene().controls;
				controls.yawObject.position.set(0, 3.5, 0);
				controls.yawObject.rotation.set(0, 0, 0);
				controls.pitchObject.rotation.set(-Math.PI / 2, 0, 0);
			}
		},
		/*'perspective': {
		 click: function () {
		 // These controls use Threejs coordinates not field coordinates
		 var controls = this.getMainscene().controls;
		 controls.yawObject.position.set(-3, 1.6, 3);
		 controls.yawObject.rotation.set(0, -6.9, 0);
		 controls.pitchObject.rotation.set(-0.5, 0, 0);
		 }
		 },
		 'side': {
		 click: function () {
		 // These controls use Threejs coordinates not field coordinates
		 var controls = this.getMainscene().controls;
		 controls.yawObject.position.set(0, 1.9, -4.5);
		 controls.yawObject.rotation.set(0, Math.PI, 0);
		 controls.pitchObject.rotation.set(-0.6, 0, 0);
		 }
		 },*/
		'close_front': {
			click: function () {
				// These controls use Threejs coordinates not field coordinates
				var controls = this.getMainscene().controls;
				controls.yawObject.position.set(this.getCloseDistance(), this.getCloseHeight(), 0);
				controls.yawObject.rotation.set(0, Math.PI/2, 0);
				controls.pitchObject.rotation.set(0.05, 0, 0);
			}
		},
		'close_angle': {
			click: function () {
				// These controls use Threejs coordinates not field coordinates
				var controls = this.getMainscene().controls;
				var dist = this.getCloseDistance() / Math.sqrt(2);
				controls.yawObject.position.set(dist, this.getCloseHeight(), -dist);
				controls.yawObject.rotation.set(0, 3 * Math.PI / 4, 0);
				controls.pitchObject.rotation.set(0.05, 0, 0);
			}
		},
		'close_side': {
			click: function () {
				// These controls use Threejs coordinates not field coordinates
				var controls = this.getMainscene().controls;
				controls.yawObject.position.set(0, this.getCloseHeight(), -this.getCloseDistance());
				controls.yawObject.rotation.set(0, Math.PI, 0);
				controls.pitchObject.rotation.set(0.05, 0, 0);
			}
		},
		'anaglyph': {
			change: function (obj, newValue, oldValue, eOpts) {
				this.getMainscene().setRenderEffect(newValue);
			}
		},
		'gamepad': {
			change: function (obj, newValue, oldValue, eOpts) {
				var controls = this.getMainscene().controls;
				controls.gamepad = newValue;
			}
		},
		'inverted': {
			change: function (obj, newValue, oldValue, eOpts) {
				var controls = this.getMainscene().controls;
				controls.inverted = newValue;
			}
		},
		'displayCrosshair': {
			change: function (obj, newValue, oldValue, eOpt) {
				var crosshair = this.getCrosshair();
				crosshair.setVisible(crosshair.isHidden() ? true : false);
			}
		},
		'orientation': {
			change: function (obj, newValue, oldValue, eOpts) {
				this.robots.forEach(function (robot) {
					robot.setShowOrientation(newValue);
				});
			}
		},
		'resetOrientation': {
            click: function () {
                this.robots.forEach(function (robot) {
                    robot.darwinModels.forEach(function (model) {
                        model.object.rotation.set(0, 0, 0);
                    });
                });
            }
        }
	},
	init: function () {
		this.mainScene = this.createMainScene();
		this.getMainscene()
			.setComponents(this.mainScene.scene, this.mainScene.renderer, this.mainScene.camera, this.mainScene.effect)
			.enableControls({
				movementSpeed: 2
			}, this.objects, this.getCoordinates());
		var controls = this.getMainscene().controls;
		controls.yawObject.position.set(0, 3.5, 0);
		controls.yawObject.rotation.set(0, 0, 0);
		controls.pitchObject.rotation.set(-Math.PI / 2, 0, 0);

		NU.util.Network.on('sensor_data', Ext.bind(this.onSensorData, this));
		NU.util.Network.on('localisation', Ext.bind(this.onLocalisation, this));
		NU.util.Network.on('addRobot', Ext.bind(this.onAddRobot, this));
        // todo add: NU.util.Network.on('addObjects', Ext.bind(this.onAddObjects, this));

        Ext.each(NU.util.Network.getRobotIPs(), function (robotIP) {
			this.onAddRobot(robotIP);
		}, this);

        this.on('selectRobotIP', Ext.bind(this.onSelectRobotIP, this));
        this.callParent(arguments);
	},
	onSelectRobotIP: function (robotIP) {
        this.robots.forEach(function (robot) {
            if (robot.robotIP !== robotIP) {
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
        })
    },
	onAddRobot: function (robotIP) {
		var robot;
		robot = this.getRobot(robotIP);

        if (robot !== null) {
			return; // TODO: already exists
		}

        robot = Ext.create('NU.view.field.Robot', {
			robotIP: robotIP
		});

        robot.on('loaded', function () {
			if (robotIP !== this.getRobotIP()) {
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
                this.getMainScene().scene.add(model);
            }, this);
            robot.ballModels.forEach(function (model) {
                this.getMainScene().scene.add(model);
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
			this.getMainScene().scene.add(object);
			this.objects.push(object);
		}, this);

		/**
		 * Fires when a ball model is being removed from the robot. This method removes the ball from the scene and
		 * the objects array.
		 */
		robot.on('remove-model', function (object) {
			this.getMainScene().scene.remove(object);
			Ext.Array.remove(this.objects, object);
		}, this);
//      robot.darwinModel.behaviourVisualiser.rotation.y = robot.darwinModel.object.dataModel.localisation.angle.get();

		this.robots.push(robot);
		//todo remove this:
		this.onAddObject(robot);
		//this.addObject(robot.darwinModels);
		//todo this.addObject(robot.ballModels);
	},
	onSensorData: function (robotIP, api_sensor_data) {
		var robot = this.getRobot(robotIP);
		if (robot == null) {
			// TODO: console.log('error', robotIP);
			return;
		}
		robot.onSensorData(api_sensor_data);
	},
	onLocalisation: function (robotIP, api_localisation) {
		var robot = this.getRobot(robotIP);
		if (robot == null) {
			console.log('error', robotIP);
			return;
		}
		robot.onLocalisation(api_localisation);
	},
    onAddObjects: function (robotIP, event, timestamp) {
        // TODO: remove
        if (robotIP !== this.robotIP) {
            return;
        }
        // get the robot from the IP sent from the network
        var robot = this.getRobot(robotIP);
        // loop through each of the objects being added to the field
        Ext.each(event.getObjects(), function (object) {
            // get the shape requested over the network
            var shape = object.getShape();
            // get the x and y coordinates requested over the network
            var x = object.getX();
            var y = object.getY();
            // declare a variable for the model that is being created
            var model;
            // get the values for the shapes
            // box
            var boxWidth = object.getBoxWidth();
            var boxHeight = object.getBoxHeight();
            var boxDepth = object.getBoxDepth();
            var boxColor= object.getBoxColor();
            // cylinder
            var cylinderRadius = object.getCylinderRadius();
            var cylinderHeight = object.getCylinderHeight();
            var cylinderColor = object.getCylinderColor();
            // pyramid
            var pyramidRadius = object.getPyramidRadius();
            var pyramidHeight = object.getPyramidHeight();
            var pyramidFaces = object.getPyramidFaces();
            var pyramidColor = object.getPyramidColor();
            // sphere
            var sphereRadius = object.getRadius();
            var sphereColor = object.getSphereColor();
            // create a new shape onto the specified robot
            switch (shape) {
                case this.Shape.BOX: // box
                    model = robot.createObstacleModel({
                        x: x,
                        y: y,
                        width: boxWidth,
                        height: boxHeight,
                        depth: boxDepth,
                        color: boxColor
                    });
                    break;
                case this.Shape.CIRCLE: // circle
                    // todo
                    break;
                case this.Shape.CYLINDER: // cylinder
                    model = robot.createGoalModel({
                        x: x,
                        y: y,
                        topRadius: cylinderRadius,
                        bottomRadius: cylinderRadius,
                        height: cylinderHeight,
                        color: cylinderColor
                    });
                    break;
                case this.Shape.PYRAMID: // pyramid
                    model = robot.createOtherModel({
                        x: x,
                        y: y,
                        radius: pyramidRadius,
                        height: pyramidHeight,
                        faces: pyramidFaces,
                        color: pyramidColor
                    });
                    break;
                case this.Shape.SPHERE: // sphere
                    model = robot.createBallModel({
                        x: x,
                        y: y,
                        radius: sphereRadius,
                        color: sphereColor
                    });
                    break;
            }
            // check if we want to display the certainty circle
            if (object.getDisplayCertainty()) {
                // display the certainty of the model
                model = robot.localiseModel(model, object.getCertaintyColour());
            }
            // call the method to fire the event to add the model to the field
            robot.addModel(model, object.getName());
            // fade out the model using the specified timeout
            robot.fadeOutModel(model, object.getTimeOut() || 5);
        }, this);
    },
	onAddObject: function (robot) {
		var me = this;
		// loop every five seconds
		var add = setInterval(function () {
			// get the shape requested over the network
			var shape = function () {
				var index = Math.floor(Math.random() * Object.keys(me.Shape).length);
				return Ext.Object.getValues(me.Shape)[index];
			}();
            var model;
            var color;
            var displayCertainty = true;
            var name = "something";
			// get the x and y coordinates requested over the network
			var x = Math.random() * 3;
			var y = Math.random() * 3;
			// create a new shape onto the specified robot
			switch (shape) {
				case me.Shape.BOX: // box
					model = robot.createObstacleModel({
                        x: x,
                        y: y
                    });
                    color = 0x000000;
                    break;
				case me.Shape.CIRCLE: // circle
					break;
				case me.Shape.CYLINDER: // cylinder
					model = robot.createGoalModel({
                        x: x,
                        y: y
                    });
                    color = 0xFF5E45;
					break;
				case me.Shape.PYRAMID: // pyramid
                    model = robot.createOtherModel({
                        x: x,
                        y: y
                    });
                    color = 0x155412;
					break;
				case me.Shape.SPHERE: // sphere
					model = robot.createBallModel({
                        x: x,
                        y: y
                    });
                    color = 0x0000ff;
					break;
			}
            if (displayCertainty) {
                // localise the model
                model = robot.localiseModel(model, {
                    color: color
                });
            }
            // call the method to fire the event to add the goal to the field
            robot.addModel(model, name);
            // fade the model out using the specified time
            robot.fadeOutModel(model, 5);
		}, 2500);
		// loop every ten seconds
		/*var remove = setInterval(function () {
			// hack hack
			if (me.objects.length > 1) {
				robot.removeModel(me.objects[1]);
			}
		}, 5000);*/
	},
	getRobot: function (robotIP) {
		var foundRobot = null;
		Ext.each(this.robots, function (robot) {
			if (robot.robotIP == robotIP) {
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
		// adds the field to the objects array
		this.objects.push(field);

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