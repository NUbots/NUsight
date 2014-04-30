Ext.define('NU.controller.Field', {
	extend: 'NU.controller.Display',
	config: {
		mainScene: null,
		robots: [],
		closeDistance: 0.4,
		closeHeight: 0.2
	},
	control: {
		'mainscene': true,
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
			});
		var controls = this.getMainscene().controls;
		controls.yawObject.position.set(0, 3.5, 0);
		controls.yawObject.rotation.set(0, 0, 0);
		controls.pitchObject.rotation.set(-Math.PI / 2, 0, 0);

		NU.util.Network.on('sensor_data', Ext.bind(this.onSensorData, this));
		NU.util.Network.on('localisation', Ext.bind(this.onLocalisation, this));
		NU.util.Network.on('addRobot', Ext.bind(this.onAddRobot, this));
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
                    model.traverse(function (object) { object.visible = false; });
                });
                robot.ballModels.forEach(function (model) {
                    model.traverse(function (object) { object.visible = false; });
                });
            } else {
                robot.darwinModels.forEach(function (model) {
                    model.traverse(function (object) { object.visible = true; });
                });
                robot.ballModels.forEach(function (model) {
                    model.traverse(function (object) { object.visible = true; });
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
                    model.traverse(function (object) { object.visible = false; });
                });
                robot.ballModels.forEach(function (model) {
                    model.traverse(function (object) { object.visible = false; });
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
                    robot.darwinModels[i].traverse(function (object) { object.visible = true; });
                } else {
                    robot.darwinModels[i].traverse(function (object) { object.visible = false; });
                }
            }
        }, this);

        robot.on('ball-model-list-resized', function (numModels) {
            for (var i = 0; i < robot.ballModels.length; i++) {
                if (i < numModels) {
                    robot.ballModels[i].traverse(function (object) { object.visible = true; });
                } else {
                    robot.ballModels[i].traverse(function (object) { object.visible = false; });
                }
            }
        }, this);
//        robot.darwinModel.behaviourVisualiser.rotation.y = robot.darwinModel.object.dataModel.localisation.angle.get();

		window.a = this;

		this.robots.push(robot);

	},
	onSensorData: function (robotIP, api_message) {

		var robot = this.getRobot(robotIP);
		if (robot == null) {
			// TODO: console.log('error', robotIP);
			return;
		}
		var api_sensor_data = api_message.sensor_data;
		robot.onSensorData(api_sensor_data);

	},
	onLocalisation: function (robotIP, api_message) {

		var robot = this.getRobot(robotIP);
		if (robot == null) {
			console.log('error', robotIP);
			return;
		}
		var api_localisation = api_message.localisation;
		robot.onLocalisation(api_localisation);

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

		var darwin, field, ball, camera, scene, renderer;

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

		renderer = new THREE.WebGLRenderer({antialias: true});
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