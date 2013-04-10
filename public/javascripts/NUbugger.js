(function () {
    "use strict";
    
    function vectorToArray(vector, type) {
        var arr = [];
        var values = vector[type + "_value"];
        for (var i = 0; i < values.length; i++) {
            arr.push(values[i]);
        }
        return arr;
    }
    
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
            var controls = Ext.getCmp('mainscene').controls;
            controls.yawObject.position.set(0, 3.5, 0);
            controls.yawObject.rotation.set(0, 0, 0);
            controls.pitchObject.rotation.set(-Math.PI / 2, 0, 0);
        
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
        
        //var clock = Date.now() * 0.001;
        //Data.robot.sensors.orientation.set([Math.sin(clock), Math.sin(clock)]);
        
    }
    
    NUbugger.prototype.createMainScene = function () {
        
        var darwin, field, ball, camera, scene, renderer;
        
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.00001, 10000);
        
        camera.lookAt(scene.position);
        
        darwin = new DarwinOP();
        //var DarwinModel = window.dm = Modeler.model(DataModel);
        darwin.bindToData(Data.robot);
        darwin = LocalisationVisualiser.localise(darwin);//, new THREE.Vector3(0, -0.343, 0)
        darwin.position.y = 0.001;
        window.darwin = darwin;
        
        field = new Field();
        ball = new Ball();
        ball = LocalisationVisualiser.localise(ball, {color: 0x0000ff});
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
                ball.object.position.x = data.localisation.ball.X * scale;
                ball.object.position.z = -data.localisation.ball.Y * scale;
                
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
        
        
        
        var count = 0;
        var time = Date.now();
        var last = Date.now();
        var renderering = false;
        setInterval(function () {
            console.log('count', count);
            count = 0;
        }, 1000);
        socket.on('message', function (message) {
            //console.log('message');
            //count++;
            //return;
            //console.time("test");
            //if (!renderering && Date.now() - time > 1) {
                renderering = true;
                var api_message = new API.Message;
                var array = Base64Binary.decodeArrayBuffer(message);
                var stream = new PROTO.ArrayBufferStream(array, array.byteLength);
                api_message.ParseFromStream(stream);
                
                switch (api_message.type) {
                    case API.Message.Type.SENSOR_DATA:
                        
                        var motors = Data.robot.motors;
                        var api_sensor_data = api_message.sensor_data;
                        var api_motor_data = api_sensor_data.motor;
                        
                        var orientation = vectorToArray(api_sensor_data.orientation, "float");
                        Data.robot.sensors.orientation.set([orientation[0], -orientation[1]]);
                        
                        var chart = window.chart = Ext.getCmp('main_chart');
                        if (chart && Date.now() - last > 250 && count % 200 <= 80) {
                            //console.log(count, count / 100, count / 100 <= 0.4);
                            var accelerometer = vectorToArray(api_sensor_data.accelerometer, "float");
                            var x = accelerometer[0];
                            var y = accelerometer[1];
                            var z = accelerometer[2];
                            chart.store.add(Ext.create('Vector', {time: Date.now(), x: x, y: y, z: z}));
                            //chart.store.add(Ext.create('Vector', {time: Date.now(), x: Math.random()*1000, y: Math.random()*1000, z: Math.random()*1000}));
                            //console.log(chart.store.data.items.length);
                            while (chart.store.data.items.length >= 10) {
                                chart.store.data.removeAt(0);
                            }
                            last = Date.now();
                        }
                        
                        // head
                        motors.head.angle.set(api_motor_data[0].position);
                        motors.neck.angle.set(api_motor_data[1].position);
                        
                        // right arm
                        // offset by pi/2 since 0 is arms straight out but model has 0 as arms straight down
                        motors.rightShoulder.angle.set(api_motor_data[6].position - Math.PI/2);
                        motors.rightUpperArm.angle.set(api_motor_data[5].position);
                        motors.rightLowerArm.angle.set(api_motor_data[7].position);
                        
                        // left arm
                        // offset by pi/2 since 0 is arms straight out but model has 0 as arms straight down
                        motors.leftShoulder.angle.set(api_motor_data[3].position - Math.PI/2);
                        motors.leftUpperArm.angle.set(api_motor_data[2].position);
                        motors.leftLowerArm.angle.set(api_motor_data[4].position);
                        
                        // right pelvis
                        motors.rightPelvis.angle.set(api_motor_data[14].position);
                        motors.rightPelvisY.angle.set(api_motor_data[16].position);
                        
                        // left pelvis
                        motors.leftPelvis.angle.set(api_motor_data[8].position);
                        motors.leftPelvisY.angle.set(api_motor_data[10].position);
                        
                        // right leg
                        motors.rightUpperLeg.angle.set(api_motor_data[15].position);
                        motors.rightLowerLeg.angle.set(api_motor_data[17].position);
                        motors.rightAnkle.angle.set(api_motor_data[19].position);
                        motors.rightFoot.angle.set(api_motor_data[18].position);
                        
                        // left leg
                        motors.leftUpperLeg.angle.set(api_motor_data[9].position);
                        motors.leftLowerLeg.angle.set(api_motor_data[11].position);
                        motors.leftAnkle.angle.set(api_motor_data[13].position);
                        motors.leftFoot.angle.set(api_motor_data[12].position);
                        
                        break;
                    case API.Message.Type.VISION:
                        count++;
                        //console.log(Date.now()-((api_message.utc_timestamp.lsw - (60 * 30)) * 1000));
                        var image = api_message.vision.image;
                        
                        var a = new Uint8Array(image.data.length);
                
                        for (var i = 0; i < image.data.length; i++) {
                            a[i] = image.data[i];
                        }
                        
                        var b = new Blob([a], {type: 'image/jpeg'});
                        var u = URL.createObjectURL(b);
                        var img = document.getElementById('image_display');
                        //img.src = u;
                        
                        var api_ball = api_message.vision.field_object[0];
                        var api_goal_yellow_left = api_message.vision.field_object[1];
                        
                        var field_objects = api_message.vision.field_object;
                        for (var i = 0; i < field_objects.length; i++) {
                            if (field_objects[i].visible) {
                                //console.log(field_objects[i].name);
                            }
                        }
                        
                        var c = document.getElementById("the_canvas");
                        //c.width = 320;
                        //c.height = 240;
                        var con = c.getContext('2d');
                        
                        var imageObj = new Image();
                        imageObj.onload = function() {
                            con.drawImage(this, 0, 0, c.width, c.height);
                            
                            if (api_ball.visible) {
                                con.beginPath();
                                
                                
                                con.shadowColor = 'black';
                                con.shadowBlur = 5;
                                con.shadowOffsetX = 0;
                                con.shadowOffsetY = 0;
                                
                                con.arc(api_ball.screen_x, api_ball.screen_y, api_ball.radius, 0, Math.PI*2, true);
                                con.closePath();
                                //con.fillStyle = "rgba(255, 0, 0, 1)";//"rgba(255, 85, 0, 0.5)";
                                //con.fill();
                                con.strokeStyle = "rgba(255, 255, 255, 1)";
                                con.lineWidth = 2;
                                con.lineWidth = 2;
                                
                                con.stroke();
                            };
                            
                            /*
                            glVertex2i( X-ObjectWidth/2, Y-ObjectHeight/2); //TOP LEFT
                            glVertex2i( X+ObjectWidth/2, Y-ObjectHeight/2); //TOP RIGHT
                            glVertex2i( X+ObjectWidth/2, Y+ObjectHeight/2); //BOTTOM RIGHT
                            glVertex2i( X-ObjectWidth/2, Y+ObjectHeight/2); //BOTTOM LEFT*/
                            //con.clearRect(0, 0, 320, 240);
                        }
                        imageObj.src = u;
                        
                        break;
                    case API.Message.Type.LOCALISATION:
                        
                        var api_self = api_message.localisation.field_object[0];
                        var api_ball = api_message.localisation.field_object[1];
                        
                        // local Z is robots negative Y
                        darwin.position.x = api_self.wm_x * scale;
                        darwin.position.z = -api_self.wm_y * scale;
                        
                        Data.robot.localisation.angle.set(api_self.heading);
                        
                        //darwin.visualiser.rotation.x = -data.sensors.orientation[0];
                        darwin.visualiser.rotation.y = Math.PI / 2;
                        //darwin.visualiser.rotation.z = data.sensors.orientation[1];
                        darwin.visualiser.setWidth(api_self.sd_x * scale);
                        darwin.visualiser.setHeight(api_self.sd_y * scale);
                        
                        // local Z is robots negative Y
                        ball.position.x = api_ball.wm_x * scale;
                        ball.position.z = -api_ball.wm_y * scale;
                        
                        var result = CalculateErrorElipse(api_ball.sr_xx, api_ball.sr_xy, api_ball.sr_yy);
                        //console.log(result.x, result.y, result.angle);
                        //ball.visualiser.setWidth(result.x * scale);
                        //ball.visualiser.setHeight(result.y * scale);
                        // local Z is robots negative Y
                        ball.visualiser.scale.x = result.x * scale;
                        ball.visualiser.scale.z = result.y * scale;
                        ball.visualiser.rotation.y = result.angle;
                        
                        break;
                }
                //var r = new FileReader();
                
                /*r.onload = function (e) {
                        //console.log("load!", e.target.result);
                        var img = document.getElementById('image_display');
                        img.src = e.target.result;
                };
                r.error = function () {
                        console.log("error!");
                };
                r.onabort = function () {
                        console.log("abort!");
                };
                r.readAsDataURL(b);*/
                
                //var canvas = document.getElementById('image_display');
                //canvas.width = 320;
                //canvas.height = 240;
                //var con = canvas.getContext('2d');
                //var d = con.createImageData(320, 240);
                //for (var i = 0; i < 320 * 240; i++) {
                //    d.data[i*4] = image.data[i*3]; //r 
                //    d.data[i*4 + 1] = image.data[i*3+1] // g
                //    d.data[i*4 + 2] = image.data[i*3+2]; // b
                //    d.data[i*4 + 3] = 255; // a
                //}
                //con.putImageData(d, 0, 0);
                
                time = Date.now();
                renderering = false;
            //}
            
            //console.timeEnd("test");
            
        });
        
    }
    
    window.NUbugger = NUbugger;
    
}());