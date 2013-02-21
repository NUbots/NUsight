(function () {
    "use strict";
    
    function NUbugger () {
        
        var self = this;
        
        this.mainScene = null;
        this.clock = new THREE.Clock();
        
        Ext.application({
            name: 'NUbugger',
            autoCreateViewport: true,
            launch: function() {
                
                self.init();
                
            }
        });
    };
    
    NUbugger.prototype.init = function () {
        
        var self = this;
        
        self.mainScene = self.createMainScene();
        Ext.getCmp('mainscene')
            .setComponents(self.mainScene.scene, self.mainScene.renderer, self.mainScene.camera)
            .enableControls({
                movementSpeed: 200/100
            })
            .on("animate", function () {
                
                self.animate();
                
            });
        
        self.setupSocket();
        
        //var r = window.r = Raphael('graph_display');
        //
        //var x = [], y = [];
        //
        //for (var i = 0; i < 100; i++) {
        //    x[i] = i;
        //    y[i] = Math.random();
        //}
        //r.text(160, 10, "Simple Line Chart (1000 points)");
        //
        //window.c = r.linechart(0, 0, 200, 100, x, y);
        
    }
    
    NUbugger.prototype.animate = function () {
        
        
        
    }
    
    NUbugger.prototype.createMainScene = function () {
        
        var darwin, field, ball, camera, scene, renderer;
        
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.00001, 10000);
        
        camera.lookAt(scene.position);
        
        darwin = new DarwinOP();
        //var DarwinModel = window.dm = Modeler.model(DataModel);
        darwin.bindToData(Data.robot);
        darwin.position.y = 0.001;
        LocalisationVisualiser.localise(darwin);//, new THREE.Vector3(0, -0.343, 0)
        window.darwin = darwin;
        
        field = new Field();
        ball = new Ball();
        LocalisationVisualiser.localise(ball, {color: 0x0000ff});
        ball.position.z = 0.2;
        window.ball = ball;
        
        scene.add(darwin);
        scene.add(field);
        scene.add(ball);
        
        //var circle = new THREE.Circle();
        //scene.add(circle);
        //window.circle = circle;
        
        /* debug */
        // red = x
        // green = y
        // blue = z
        //Axis array[x,y,z]
        var axisLength = 4;
        
        var info = [[-axisLength,0,0,axisLength,0,0,0xff0000],[0,-axisLength,0,0,axisLength,0,0x00ff00],[0,0,-axisLength,0,0,axisLength,0x0000ff]];
        
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
    
    NUbugger.prototype.setupSocket = function () {
        
        var count = 0;
        var last = Date.now();
        var scale = 1 / 100;
        
        var socket = io.connect(document.location.origin);
        
        function CalculateErrorElipse(xx, xy, yy) {
            
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
        
        var time = Date.now();
        
        socket.on('state', function (data) {
            
            if (true || Date.now() - time > 2000) {
                
                time = Date.now();
                window.data = data;
                
                // orientation
                Data.robot.sensors.orientation.set([data.sensors.orientation[1], data.sensors.orientation[0]]);
                //Data.robot.sensors.orientation.set([data.sensors.orientation[1], 0]);
                
                var x = data.sensors.accelerometer[0];
                var y = data.sensors.accelerometer[1];
                var z = data.sensors.accelerometer[2];
                
                /*var chart = window.chart = Ext.getCmp('main_chart');
                if (chart && Date.now() - last > 250) {
                    chart.store.add(Ext.create('Vector', {time: Date.now(), x: x, y: y, z: z}));
                    //chart.store.add(Ext.create('Vector', {time: Date.now(), x: Math.random()*1000, y: Math.random()*1000, z: Math.random()*1000}));
                    //console.log(chart.store.data.items.length);
                    while (chart.store.data.items.length >= 10) {
                        chart.store.data.removeAt(0);
                    }
                    last = Date.now();
                }*/
                
                //console.log(pad("" + x, 15) + pad("" + y, 15) + pad("" + z, 15));
                //
                //var r = Math.sqrt(x*x + y*y + z*z);
                
                //Data.robot.sensors.orientation.set([Math.acos(-z/r) * (x ? x/Math.abs(x) : 0), -Math.atan(y/x)]);
                //Data.robot.sensors.orientation.set([0, Math.atan2(y, x)]);
                
                // update motors
                
                var motors = Data.robot.motors;
                var motor_data = data.motors;
                
                // head
                motors.head.angle.set(motor_data.HeadPitch.position);
                motors.neck.angle.set(motor_data.HeadYaw.position);
                
                // right arm
                // offset by pi/2 since 0 is arms straight out but model has 0 as arms straight down
                motors.rightShoulder.angle.set(motor_data.RShoulderPitch.position - Math.PI/2);
                motors.rightUpperArm.angle.set(motor_data.RShoulderRoll.position);
                motors.rightLowerArm.angle.set(motor_data.RElbowPitch.position);
                
                // left arm
                // offset by pi/2 since 0 is arms straight out but model has 0 as arms straight down
                motors.leftShoulder.angle.set(motor_data.LShoulderPitch.position - Math.PI/2);
                motors.leftUpperArm.angle.set(motor_data.LShoulderRoll.position);
                motors.leftLowerArm.angle.set(motor_data.LElbowPitch.position);
                
                // right pelvis
                motors.rightPelvis.angle.set(motor_data.RHipRoll.position);
                motors.rightPelvisY.angle.set(motor_data.RHipYaw.position);
                
                // left pelvis
                motors.leftPelvis.angle.set(motor_data.LHipRoll.position);
                motors.leftPelvisY.angle.set(motor_data.LHipYaw.position);
                
                // right leg
                motors.rightUpperLeg.angle.set(motor_data.RHipPitch.position);
                motors.rightLowerLeg.angle.set(motor_data.RKneePitch.position);
                motors.rightAnkle.angle.set(motor_data.RAnklePitch.position);
                motors.rightFoot.angle.set(motor_data.RAnkleRoll.position);
                
                // left leg
                motors.leftUpperLeg.angle.set(motor_data.LHipPitch.position);
                motors.leftLowerLeg.angle.set(motor_data.LKneePitch.position);
                motors.leftAnkle.angle.set(motor_data.LAnklePitch.position);
                motors.leftFoot.angle.set(motor_data.LAnkleRoll.position);
                
                // localisation
                
                // update robots position
                
                // local Z is robots negative Y
                Data.robot.localisation.position.set([data.localisation.self.wmX * scale, -data.localisation.self.wmY * scale]);
                Data.robot.localisation.angle.set(data.localisation.self.heading + Math.PI / 2);
                
                //darwin.visualiser.rotation.x = -data.sensors.orientation[0];
                darwin.visualiser.rotation.y = Math.PI / 2;
                //darwin.visualiser.rotation.z = data.sensors.orientation[1];
                darwin.visualiser.setWidth(data.localisation.self.sdX * scale);
                darwin.visualiser.setHeight(data.localisation.self.sdY * scale);
                
                //circle.rotation.y = data.localisation.self.heading;
                
                // local Z is robots Y
                //circle.position.x = data.localisation.self.wmX * scale;
                //circle.position.z = data.localisation.self.wmY * scale;
                
                // local Z is robots Y
                //circle.scale.x = data.localisation.self.sdX * scale * 2;
                //circle.scale.z = data.localisation.self.sdY * scale * 2;
                
                // local Z is robots negative Y
                ball.position.x = data.localisation.ball.X * scale;
                ball.position.z = -data.localisation.ball.Y * scale;
                
                var result = CalculateErrorElipse(data.localisation.ball.srXX, data.localisation.ball.srXY, data.localisation.ball.srYY);
                //console.log(result.x, result.y, result.angle);
                //ball.visualiser.setWidth(result.x * scale);
                //ball.visualiser.setHeight(result.y * scale);
                ball.visualiser.scale.x = result.x * scale;
                ball.visualiser.scale.z = result.y * scale;
                ball.visualiser.rotation.y = result.angle;
            }
            
        });
        
        socket.on("image", function () {
            
            console.log("image!");
            
        });
        
    }
    
    window.NUbugger = NUbugger;
    
}());