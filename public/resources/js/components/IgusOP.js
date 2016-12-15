/**
 * A Igus-OP model for Three.js. Has groupings so that each angle can be set
 * and the attached components will rotate with it as expected.
 */
(function (THREE) {
    "use strict";

    var IgusOP, IgusComponent;

    /**
     * Creates a new Igus-OP model. Creates the hierarchy of objects so that
     * they move as expected. To get the root element (to add to a scene) after
     *  this has been constructed call getRootElement().
     *
     * @constructor
     */
    IgusOP = function (callback, scope) {
        //Call super constructor
        THREE.Object3D.call(this);

        this.dataModel = null;

        // This corrects the fact that the model is made for computer graphics axis
        this.orientationCorrection = new THREE.Object3D();
        this.orientationCorrection.rotation.x = Math.PI/2;
        this.add(this.orientationCorrection);

        this.loading = 0;

        // wrap
        var me = this;
        var addComponent = function (params) {
            return me.addComponent(params, callback, scope);
        };

        //Setup Body Container
        this.body = addComponent({
            url: "resources/igus/Torso.json",
            baseOffset: new THREE.Vector3(0, 0.096, 0),
            rotationAxis: "y",
            scale: new THREE.Vector3(0.001, 0.001, 0.001)
        });
        this.body.rotation.y = Math.PI/2;
        this.orientationCorrection.add(this.body);

        // //Setup Head Containers
        // this.neck = addComponent({
        //     url: "resources/igus/Neck.json",
        //     baseOffset: new THREE.Vector3(0, 0.051, 0),
        //     rotationAxis: "y"
        // });
        // this.body.add(this.neck);
        this.head = addComponent({
            url: "resources/igus/Head.json",
            baseOffset: new THREE.Vector3(0.0, 0.33, 0.05),
            rotationAxis: "x",
            scale: new THREE.Vector3(0.001, 0.001, 0.001)
        });
        this.body.add(this.head);
        // this.eyeLED = addComponent({
        //     url: "resources/igus/EyeLED.json",
        //     baseOffset: new THREE.Vector3(),
        //     rotationAxis: "none"
        // });
        // this.head.add(this.eyeLED);
        // this.headLED = addComponent({
        //     url: "resources/igus/HeadLED.json",
        //     baseOffset: new THREE.Vector3(),
        //     rotationAxis: "none"
        // });
        // this.head.add(this.headLED);
        // this.camera = addComponent({
        //     url: "resources/igus/Camera.json",
        //     baseOffset: new THREE.Vector3(0, 0.0329074, 0.0359816),
        //     rotationAxis: "none"
        // });
        // this.camera.rotation.y = Math.PI;
        // this.camera.add(new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 50));
        // this.head.add(this.camera);

        //Setup Left Leg containers
        this.leftPelvisY = addComponent({
            url: "resources/igus/LeftHip.json",
            baseOffset: new THREE.Vector3(0.027, -0.33, 0.03),
            rotationAxis: "y",
            scale: new THREE.Vector3(0.001, 0.001, 0.001)
        });
        this.body.add(this.leftPelvisY);
        // this.leftPelvis = addComponent({
        //     url: "resources/igus/LeftPelvis.json",
        //     baseOffset: new THREE.Vector3(),
        //     rotationAxis: "z"
        // });
        // this.leftPelvisY.add(this.leftPelvis);
        // this.leftUpperLeg = addComponent({
        //     url: "resources/igus/LeftUpperLeg.json",
        //     baseOffset: new THREE.Vector3(),
        //     rotationAxis: "x"
        // });
        // this.leftPelvis.add(this.leftUpperLeg);
        // this.leftLowerLeg = addComponent({
        //     url: "resources/igus/LeftLowerLeg.json",
        //     baseOffset: new THREE.Vector3(-0, -0.093, 0),
        //     rotationAxis: "x"
        // });
        // this.leftUpperLeg.add(this.leftLowerLeg);
        // this.leftAnkle = addComponent({
        //     url: "resources/igus/LeftAnkle.json",
        //     baseOffset: new THREE.Vector3(-0, -0.093, 0),
        //     rotationAxis: "x"
        // });
        // this.leftLowerLeg.add(this.leftAnkle);
        // this.leftFoot = addComponent({
        //     url: "resources/igus/LeftFoot.json",
        //     baseOffset: new THREE.Vector3(),
        //     rotationAxis: "z"
        // });
        // this.leftAnkle.add(this.leftFoot);

        //Setup Right Leg containers
        this.rightPelvisY = addComponent({
            url: "resources/igus/RightHip.json",
            baseOffset: new THREE.Vector3(0.029, -0.33, 0.03),
            rotationAxis: "y",
            scale: new THREE.Vector3(0.001, 0.001, 0.001)
        });
        this.body.add(this.rightPelvisY);
        // this.rightPelvis = addComponent({
        //     url: "resources/igus/RightPelvis.json",
        //     baseOffset: new THREE.Vector3(),
        //     rotationAxis: "z"
        // });
        // this.rightPelvisY.add(this.rightPelvis);
        // this.rightUpperLeg = addComponent({
        //     url: "resources/igus/RightUpperLeg.json",
        //     baseOffset: new THREE.Vector3(),
        //     rotationAxis: "x"
        // });
        // this.rightPelvis.add(this.rightUpperLeg);
        // this.rightLowerLeg = addComponent({
        //     url: "resources/igus/RightLowerLeg.json",
        //     baseOffset: new THREE.Vector3(-0, -0.093, 0),
        //     rotationAxis: "x"
        // });
        // this.rightUpperLeg.add(this.rightLowerLeg);
        // this.rightAnkle = addComponent({
        //     url: "resources/igus/RightAnkle.json",
        //     baseOffset: new THREE.Vector3(-0, -0.093, 0),
        //     rotationAxis: "x"
        // });
        // this.rightLowerLeg.add(this.rightAnkle);
        // this.rightFoot = addComponent({
        //     url: "resources/igus/RightFoot.json",
        //     baseOffset: new THREE.Vector3(),
        //     rotationAxis: "z"
        // });
        // this.rightAnkle.add(this.rightFoot);

        //Setup Left Arm Containers
        this.leftShoulder = addComponent({
            url: "resources/igus/LeftShoulder.json",
            baseOffset: new THREE.Vector3(0.079, 0.186, 0.045),
            rotationAxis: "x",
            scale: new THREE.Vector3(0.001, 0.001, 0.001)
        });
        this.body.add(this.leftShoulder);
        this.leftUpperArm = addComponent({
            url: "resources/igus/LeftUpperArm.json",
            baseOffset: new THREE.Vector3(-0.2, -0.01, 0),
            rotationAxis: "z",
            scale: new THREE.Vector3(0.001, 0.001, 0.001)
        });
        this.leftUpperArm.rotation.x = Math.PI/2;
        this.leftShoulder.add(this.leftUpperArm);
        this.leftLowerArm = addComponent({
            url: "resources/igus/LeftLowerArm.json",
            baseOffset: new THREE.Vector3(0, 0.0, 0.0),
            rotationAxis: "x",
            scale: new THREE.Vector3(0.001, 0.001, 0.001)
        });
        this.leftUpperArm.add(this.leftLowerArm);

        //Setup Right Arm Containers
        this.rightShoulder = addComponent({
            url: "resources/igus/RightShoulder.json",
            baseOffset: new THREE.Vector3(0.079, 0.186, 0.045),
            rotationAxis: "x",
            scale: new THREE.Vector3(0.001, 0.001, 0.001)
        });
        this.body.add(this.rightShoulder);
        this.rightUpperArm = addComponent({
            url: "resources/igus/RightUpperArm.json",
            baseOffset: new THREE.Vector3(-0.2, -0.01, 0),
            rotationAxis: "z",
            scale: new THREE.Vector3(0.001, 0.001, 0.001)
        });
        this.rightUpperArm.rotation.x = Math.PI/2;
        this.rightShoulder.add(this.rightUpperArm);
        this.rightLowerArm = addComponent({
            url: "resources/igus/RightLowerArm.json",
            baseOffset: new THREE.Vector3(0, 0.0, 0.0),
            rotationAxis: "x",
            scale: new THREE.Vector3(0.001, 0.001, 0.001)
        });
        this.rightUpperArm.add(this.rightLowerArm);

    };

    //We inherit from Object3D
    IgusOP.prototype = Object.create(THREE.Object3D.prototype);


    IgusOP.prototype.addComponent = function (params, callback, scope) {
        this.loading++;
        var component = new IgusComponent(params, function () {
            this.loading--;
            if (this.loading === 0) {
                callback.call(scope || this);
            }
        }, this);
        return component;
    };

    /**
     * This constructs a new IgusComponent which loads in the data for each
     * component and builds the hierarchy of objects
     *
     * @param params an object containing the values
     *              url to load the component from,
     *              initial offset (all positions will use this offset)
     *              axisOfRotation a position that is used to set where this object rotates around
     *
     * @constructor
     */
    IgusComponent = function (params, callback, scope){
        //Setup our variables
        THREE.Object3D.call(this);

        //Maintan scope
        var self = this;

        //Store our rotation axis
        this.rotationAxis = params.rotationAxis;

        this.modelScale = params.scale;

        //Load this URL into our container
        new THREE.JSONLoader().load(params.url, function (geom, materials) {
            var mesh;

            //Create a mesh from our geometry
            mesh = new THREE.Mesh(geom, new THREE.MeshFaceMaterial(materials));

            if(self.modelScale != undefined) {
                mesh.scale.set(self.modelScale.x, self.modelScale.y, self.modelScale.z);
                console.log(mesh.scale);
            }

            //Add it to the appropriate container
            self.add(mesh);

            callback.call(scope || this);
        });

        //Try to get our base offsets
        this.basePosition = params.baseOffset === undefined ? new THREE.Vector3() : params.baseOffset;

        //Set our position to 0
        this.setPosition(new THREE.Vector3());
        this.setAngle(0);
    };

    //We inherit from Object3D
    IgusComponent.prototype = Object.create(THREE.Object3D.prototype);

    /**
     * Sets the rotation of this object in the defined axis of rotation
     *
     * @param angle the angle to set the motor at in radians
     */
    IgusComponent.prototype.setAngle = function (angle) {
        switch (this.rotationAxis) {
            case "x":
                this.rotation.x = angle;
                break;
            case "y":
                this.rotation.y = angle;
                break;
            case "z":
                this.rotation.z = angle;
                break;
        }
    };

    /**
     * Sets the position of this object (taking into account the base position)
     *
     * @param pos the position to set (undefined will be left as is)
     */
    IgusComponent.prototype.setPosition = function (pos) {
        var x, y, z;

        //Work out what our X Y and Z should be
        x = pos.x === undefined ? this.position.x : pos.x + this.basePosition.x;
        y = pos.y === undefined ? this.position.y : pos.y + this.basePosition.y;
        z = pos.z === undefined ? this.position.z : pos.z + this.basePosition.z;

        this.position.set(x, y, z);
    };

    /**
     * Sets the rotation of this object
     *
     * @param rot the rotation to set (undefined will be left as is)
     */
    IgusComponent.prototype.setRotation = function (rot) {
        var x, y, z;

        //Work out what our X Y and Z should be
        x = rot.x === undefined ? this.rotation.x : rot.x;
        y = rot.y === undefined ? this.rotation.y : rot.y;
        z = rot.z === undefined ? this.rotation.z : rot.z;

        this.rotation.set(x, y, z);
    };

    //Export our IgusOP model
    window.IgusOP = IgusOP;
}(window.THREE));
