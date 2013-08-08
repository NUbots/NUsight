Ext.define('Ext.ux.NU.FieldWindow', {
	extend : 'Ext.ux.NU.DisplayWindow',
	alias : ['widget.nu.field_window'],
	title: 'Localisation Display',
	autoShow: true,
	width: 800,//800,
	height: 400,
    layout: 'fit',
	mainScene: null,
	robots: [],
	items: [{
		xtype: 'threejs',
		itemId: 'mainscene',
		id: 'mainscene'
	}],
	tbar: [{
		text: 'HawkEye',
		handler: function () {
			
			var controls = this.findParentByType('window').getComponent('mainscene').controls;
			controls.yawObject.position.set(0, 3.5 * 100, 0);
			controls.yawObject.rotation.set(0, 0, 0);
			controls.pitchObject.rotation.set(-Math.PI / 2, 0, 0);
			
		}
	}, {
		text: 'Perspective',
		handler: function () {
			
			var controls = this.findParentByType('window').getComponent('mainscene').controls;
			controls.yawObject.position.set(-3 * 100, 1.6 * 100, 3 * 100);
			controls.yawObject.rotation.set(0, -6.9, 0);
			controls.pitchObject.rotation.set(-0.5, 0, 0);
			
		}
	}, {
		text: 'Side',
		handler: function () {
			
			var controls = this.findParentByType('window').getComponent('mainscene').controls;
			controls.yawObject.position.set(0, 1.9 * 100, -4.5 * 100);
			controls.yawObject.rotation.set(0, Math.PI, 0);
			controls.pitchObject.rotation.set(-0.6, 0, 0);
			
		}
	}],
	constructor: function () {
		
		NU.Network.on('robot_ips', Ext.bind(this.onRobotIPs, this));
		NU.Network.on('sensor_data', Ext.bind(this.onSensorData, this));
		NU.Network.on('localisation', Ext.bind(this.onLocalisation, this));
		
		this.callParent(arguments);
		
	},
	listeners: {
		afterRender: function () {
			
			this.init();
			
		},
		resize: function (obj, width, height) {
			
			
			
		}
	},
	onRobotIPs: function (robotIPs) {
		
		var self = this;
		
		Ext.each(robotIPs, function (robotIP) {
			
			var robot;
			
			robot = this.getRobot(robotIP);
			
			if (robot !== null) {
				return; // already exists
			}
			
			robot = new NU.FieldWindow.Robot({
				robotIP: robotIP
			});
			
			//robot.darwinModel.traverse( function ( object ) { object.visible = false; } );
			this.mainScene.scene.add(robot.darwinModel);
			//robot.darwinModel.position.x = Math.random() * 800 - 400;
			//robot.darwinModel.position.z = Math.random() * 400 - 200;
			//robot.darwinModel.visualiser.scale.x = Math.random() * 50;
			//robot.darwinModel.visualiser.scale.y = Math.random() * 50;
			//robot.darwinModel.visualiser.rotation.y = Math.random() * 2 * Math.PI;
			//robot.darwinModel.object.dataModel.localisation.angle.set(Math.random() * 2 * Math.PI);
			robot.darwinModel.behaviourVisualiser.rotation.y = robot.darwinModel.object.dataModel.localisation.angle.get();
			//robot.ballModel.traverse( function ( object ) { object.visible = false; } );
			this.mainScene.scene.add(robot.ballModel);
			//robot.ballModel.position.x = Math.random() * 800 - 400;
			//robot.ballModel.position.z = Math.random() * 400 - 200;
			//robot.ballModel.visualiser.scale.x = Math.random() * 10;
			//robot.ballModel.visualiser.scale.y = Math.random() * 10;
			//robot.ballModel.visualiser.rotation.y = Math.random() * 2 * Math.PI;
			this.robots.push(robot);
			
		}, this);
		
	},
	onSensorData: function (robotIP, api_message) {
		
		var robot = this.getRobot(robotIP);
		if (robot == null) {
			console.log('error', robotIP);
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
	init: function () {
		
		var self;
		
		self = this;
		
		self.mainScene = self.createMainScene();
		Ext.getCmp('mainscene')
			.setComponents(self.mainScene.scene, self.mainScene.renderer, self.mainScene.camera)
			.enableControls({
				movementSpeed: 200
			});
			var controls = Ext.getCmp('mainscene').controls;
			controls.yawObject.position.set(0, 3.5 * 100, 0);
			controls.yawObject.rotation.set(0, 0, 0);
			controls.pitchObject.rotation.set(-Math.PI / 2, 0, 0);
	},
	createMainScene: function () {
        
        var darwin, field, ball, camera, scene, renderer;
        
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
        
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
        var axisLength = 4 * 100;
        
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
        }
        
        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setClearColorHex(0x0);
        //renderer.setClearColorHex(0xFFFFFF);
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        return {
            scene: scene,
            camera: camera,
            renderer: renderer
        };
        
    }
});