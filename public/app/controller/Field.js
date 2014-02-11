Ext.define('NU.controller.Field', {
    extend: 'NU.controller.Display',
    config: {
        mainScene: null,
        robots: []
    },
    control: {
        'mainscene': true,
        'hawkeye': {
            click: function () {
                var controls = this.getMainscene().controls;
                controls.yawObject.position.set(0, 3.5, 0);
                controls.yawObject.rotation.set(0, 0, 0);
                controls.pitchObject.rotation.set(-Math.PI / 2, 0, 0);
            }
        },
        'perspective': {
            click: function () {
                var controls = this.getMainscene().controls;
                controls.yawObject.position.set(-3, 1.6, 3);
                controls.yawObject.rotation.set(0, -6.9, 0);
                controls.pitchObject.rotation.set(-0.5, 0, 0);
            }
        },
        'side': {
            click: function () {
                var controls = this.getMainscene().controls;
                controls.yawObject.position.set(0, 1.9, -4.5);
                controls.yawObject.rotation.set(0, Math.PI, 0);
                controls.pitchObject.rotation.set(-0.6, 0, 0);
            }
        },
        'close_front': {
            click: function () {
                var controls = this.getMainscene().controls;
                controls.yawObject.position.set(0.4, 0.4, 0);
                controls.yawObject.rotation.set(0, Math.PI/2, 0);
                controls.pitchObject.rotation.set(-0.4, 0, 0);
            }
        },
        'close_side': {
            click: function () {
                var controls = this.getMainscene().controls;
                controls.yawObject.position.set(0, 0.4, -0.4);
                controls.yawObject.rotation.set(0, Math.PI, 0);
                controls.pitchObject.rotation.set(-0.4, 0, 0);
            }
        }
    },
    init: function () {

        NU.util.Network.on('sensor_data', Ext.bind(this.onSensorData, this));
        NU.util.Network.on('localisation', Ext.bind(this.onLocalisation, this));
        this.on('robot_ip', Ext.bind(this.onRobotIP, this));

        this.mainScene = this.createMainScene();
        this.getMainscene()
            .setComponents(this.mainScene.scene, this.mainScene.renderer, this.mainScene.camera)
            .enableControls({
                movementSpeed: 2
            });
        var controls = this.getMainscene().controls;
        controls.yawObject.position.set(0, 3.5, 0);
        controls.yawObject.rotation.set(0, 0, 0);
        controls.pitchObject.rotation.set(-Math.PI / 2, 0, 0);

        this.callParent(arguments);

    },
    onRobotIP: function (robotIP) {

        var robot;

        robot = this.getRobot(robotIP);

        if (robot !== null) {
            return; // TODO: already exists
        }

        robot = Ext.create('NU.view.field.Robot', {
            robotIP: robotIP
        });

        this.mainScene.scene.add(robot.darwinModel);
//        robot.darwinModel.behaviourVisualiser.rotation.y = robot.darwinModel.object.dataModel.localisation.angle.get();
        this.mainScene.scene.add(robot.ballModel);
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
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 20);

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

        return {
            scene: scene,
            camera: camera,
            renderer: renderer
        };
    }
});