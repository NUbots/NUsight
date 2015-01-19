/**
 * A Darwin-OP model for Three.js. Has groupings so that each angle can be set
 * and the attached components will rotate with it as expected.
 */
(function (THREE) {
	"use strict";

	/**
	 * Until provided as a pull request, Drew's crease angle computeVertexNormals function for the darwin
	 *
	 * @author Drew Noakes http://drewnoakes.com
	 */
	function computeVertexNormals(geometry, maxSmoothAngle) {
		var v, vl, f, fl, face, faceIndicesPerVertex = [];
		for (v = 0, vl = geometry.vertices.length; v < vl; v++) {
			faceIndicesPerVertex.push([]);
		}
		for (f = 0, fl = geometry.faces.length; f < fl; f++) {
			face = geometry.faces[f];
			faceIndicesPerVertex[face.a].push(f);
			faceIndicesPerVertex[face.b].push(f);
			faceIndicesPerVertex[face.c].push(f);
		}
		for (f = 0, fl = geometry.faces.length; f < fl; f++) {
			face = geometry.faces[f];
			for (var fv = 0; fv < 3; fv++) {
				var vertexIndex = face['abcd'.charAt(fv)];
				var vertexFaces = faceIndicesPerVertex[vertexIndex];
				var vertexNormal = face.normal.clone();
				for (var vf = 0; vf < vertexFaces.length; vf++) {
					var neighbourFaceIndex = vertexFaces[vf];
					var neighbourFace = geometry.faces[neighbourFaceIndex];
					// disregard the face we're working with
					if (neighbourFace === face)
						continue;
					// given both normals are unit vectors, the angle is just acos(a.dot(b))
					var theta = Math.acos(face.normal.dot(neighbourFace.normal));
					if (theta <= maxSmoothAngle) {
						vertexNormal.add(neighbourFace.normal);
					}
				}
				vertexNormal.normalize();
				face.vertexNormals[fv] = vertexNormal;
			}
		}
	}

	var DarwinOP, DarwinComponent;

	/**
     * Creates a new Darwin-OP model. Creates the hierarchy of objects so that
     * they move as expected. To get the root element (to add to a scene) after
     *  this has been constructed call getRootElement().
     *
     * @constructor
     */
	DarwinOP = function (callback, scope) {
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
        }

        this.body = addComponent({
            url: "resources/darwin/Body.json",
            baseOffset: new THREE.Vector3(0, 0.3422, 0),
            rotationAxis: "y"
        });

		//Setup Body Container
		this.body = addComponent({
			url: "resources/darwin/Body.json",
			baseOffset: new THREE.Vector3(0, 0.3422, 0),
			rotationAxis: "y"
		});
		this.body.rotation.y = Math.PI/2;
		this.orientationCorrection.add(this.body);

		//Setup Head Containers
		this.neck = addComponent({
			url: "resources/darwin/Neck.json",
			baseOffset: new THREE.Vector3(0, 0.051, 0),
			rotationAxis: "y"
		});
		this.body.add(this.neck);
		this.head = addComponent({
			url: "resources/darwin/Head.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "x"
		});
		this.neck.add(this.head);
		this.eyeLED = addComponent({
			url: "resources/darwin/EyeLED.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "none"
		});
		this.head.add(this.eyeLED);
		this.headLED = addComponent({
			url: "resources/darwin/HeadLED.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "none"
		});
		this.head.add(this.headLED);
		this.camera = addComponent({
			url: "resources/darwin/Camera.json",
			baseOffset: new THREE.Vector3(0, 0.0329074, 0.0359816),
			rotationAxis: "none"
		});
		this.head.add(this.camera);

		//Setup Left Leg containers
		this.leftPelvisY = addComponent({
			url: "resources/darwin/LeftPelvisY.json",
			baseOffset: new THREE.Vector3(0.037, -0.1222, -0.005),
			rotationAxis: "y"
		});
		this.body.add(this.leftPelvisY);
		this.leftPelvis = addComponent({
			url: "resources/darwin/LeftPelvis.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "z"
		});
		this.leftPelvisY.add(this.leftPelvis);
		this.leftUpperLeg = addComponent({
			url: "resources/darwin/LeftUpperLeg.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "x"
		});
		this.leftPelvis.add(this.leftUpperLeg);
		this.leftLowerLeg = addComponent({
			url: "resources/darwin/LeftLowerLeg.json",
			baseOffset: new THREE.Vector3(-0, -0.093, 0),
			rotationAxis: "x"
		});
		this.leftUpperLeg.add(this.leftLowerLeg);
		this.leftAnkle = addComponent({
			url: "resources/darwin/LeftAnkle.json",
			baseOffset: new THREE.Vector3(-0, -0.093, 0),
			rotationAxis: "x"
		});
		this.leftLowerLeg.add(this.leftAnkle);
		this.leftFoot = addComponent({
			url: "resources/darwin/LeftFoot.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "z"
		});
		this.leftAnkle.add(this.leftFoot);

		//Setup Right Leg containers
		this.rightPelvisY = addComponent({
			url: "resources/darwin/RightPelvisY.json",
			baseOffset: new THREE.Vector3(-0.037, -0.1222, -0.005),
			rotationAxis: "y"
		});
		this.body.add(this.rightPelvisY);
		this.rightPelvis = addComponent({
			url: "resources/darwin/RightPelvis.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "z"
		});
		this.rightPelvisY.add(this.rightPelvis);
		this.rightUpperLeg = addComponent({
			url: "resources/darwin/RightUpperLeg.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "x"
		});
		this.rightPelvis.add(this.rightUpperLeg);
		this.rightLowerLeg = addComponent({
			url: "resources/darwin/RightLowerLeg.json",
			baseOffset: new THREE.Vector3(-0, -0.093, 0),
			rotationAxis: "x"
		});
		this.rightUpperLeg.add(this.rightLowerLeg);
		this.rightAnkle = addComponent({
			url: "resources/darwin/RightAnkle.json",
			baseOffset: new THREE.Vector3(-0, -0.093, 0),
			rotationAxis: "x"
		});
		this.rightLowerLeg.add(this.rightAnkle);
		this.rightFoot = addComponent({
			url: "resources/darwin/RightFoot.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "z"
		});
		this.rightAnkle.add(this.rightFoot);

		//Setup Left Arm Containers
		this.leftShoulder = addComponent({
			url: "resources/darwin/LeftShoulder.json",
			baseOffset: new THREE.Vector3(0.082, 0, 0),
			rotationAxis: "x"
		});
		this.body.add(this.leftShoulder);
		this.leftUpperArm = addComponent({
			url: "resources/darwin/LeftUpperArm.json",
			baseOffset: new THREE.Vector3(0, -0.016, 0),
			rotationAxis: "z"
		});
		this.leftShoulder.add(this.leftUpperArm);
		this.leftLowerArm = addComponent({
			url: "resources/darwin/LeftLowerArm.json",
			baseOffset: new THREE.Vector3(0, -0.06, 0.016),
			rotationAxis: "x"
		});
		this.leftUpperArm.add(this.leftLowerArm);

		//Setup Right Arm Containers
		this.rightShoulder = addComponent({
			url: "resources/darwin/RightShoulder.json",
			baseOffset: new THREE.Vector3(-0.082, 0, 0),
			rotationAxis: "x"
		});
		this.body.add(this.rightShoulder);
		this.rightUpperArm = addComponent({
			url: "resources/darwin/RightUpperArm.json",
			baseOffset: new THREE.Vector3(0, -0.016, 0),
			rotationAxis: "z"
		});
		this.rightShoulder.add(this.rightUpperArm);
		this.rightLowerArm = addComponent({
			url: "resources/darwin/RightLowerArm.json",
			baseOffset: new THREE.Vector3(0, -0.06, 0.016),
			rotationAxis: "x"
		});
		this.rightUpperArm.add(this.rightLowerArm);

	};

	//We inherit from Object3D
	DarwinOP.prototype = Object.create(THREE.Object3D.prototype);


    DarwinOP.prototype.addComponent = function (params, callback, scope) {
        this.loading++;
        var component = new DarwinComponent(params, function () {
            this.loading--;
            if (this.loading === 0) {
                callback.call(scope || this);
            }
        }, this);
        return component;
    }

	/**
     * This method binds the robot's position and movement to the data model so
     * that updates to the data model update the robot's position and rotation
     */
	DarwinOP.prototype.bindToData = function (dataModel) {
		var key, self, createCallbackForKey;

		//Maintain context
		self = this;

		//Create a factory to make our callback functions
		createCallbackForKey = function (key) {
			dataModel.motors[key].angle.onUpdate(function (event) {
				self[key].setAngle(event.detail.newValue);
			});
		};

		//Bind to all the motor angles
		for (key in this) {
			if (this.hasOwnProperty(key) && dataModel.motors[key] !== undefined) {
				createCallbackForKey(key);
			}
		}

		//Bind to the localisation position
		dataModel.localisation.position.onUpdate(function (event) {
			//self.setPosition(new THREE.Vector3(event.detail.newValue[0], 0, event.detail.newValue[1]));
			self.position.x = event.detail.newValue[0];
			self.position.z = event.detail.newValue[1];
		});

		//Bind to the localisation angle
		dataModel.localisation.angle.onUpdate(function (event) {
			//self.setAngle(event.detail.newValue);
			self.rotation.y = event.detail.newValue;
		});

		//Bind to the orientation angle
		dataModel.sensors.orientation[0].onUpdate(function (event) {
			//self.setRotation(new THREE.Vector3(event.detail.newValue[0], undefined, event.detail.newValue[1]));
			self.rotation.x = event.detail.newValue;

		//TODO calculate his vertical position and set the y position so that he is always touching the ground
		//Should be some simple trig, he will rotate around body.baseOffset off the ground (until it goes upside down and he will be underground)
		});
		
		//Bind to the orientation angle
		dataModel.sensors.orientation[1].onUpdate(function (event) {
			//self.setRotation(new THREE.Vector3(event.detail.newValue[0], undefined, event.detail.newValue[1]));
			self.rotation.z = event.detail.newValue;

		//TODO calculate his vertical position and set the y position so that he is always touching the ground
		//Should be some simple trig, he will rotate around body.baseOffset off the ground (until it goes upside down and he will be underground)
		});
		
		this.dataModel = dataModel;
	};

	/**
	 * This constructs a new DarwinComponent which loads in the data for each
	 * component and builds the hierarchy of objects
	 *
	 * @param params an object containing the values
	 *              url to load the component from,
	 *              initial offset (all positions will use this offset)
	 *              axisOfRotation a position that is used to set where this object rotates around
	 *
	 * @constructor
	 */
	DarwinComponent = function (params, callback, scope){
		//Setup our variables
		THREE.Object3D.call(this);

		//Maintan scope
		var self = this;

		//Store our rotation axis
		this.rotationAxis = params.rotationAxis;

		//Load this URL into our container
		new THREE.JSONLoader().load(params.url, function (geom, materials) {
			var mesh;

			// Compute vertex normals with a crease angle of 0.52
			computeVertexNormals(geom, 0.52);

			//Create a mesh from our geometry
			mesh = new THREE.Mesh(geom, new THREE.MeshFaceMaterial(materials));

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
	DarwinComponent.prototype = Object.create(THREE.Object3D.prototype);

	/**
     * Sets the rotation of this object in the defined axis of rotation
     *
     * @param angle the angle to set the motor at in radians
     */
	DarwinComponent.prototype.setAngle = function (angle) {
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
	DarwinComponent.prototype.setPosition = function (pos) {
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
	DarwinComponent.prototype.setRotation = function (rot) {
		var x, y, z;

		//Work out what our X Y and Z should be
		x = rot.x === undefined ? this.rotation.x : rot.x;
		y = rot.y === undefined ? this.rotation.y : rot.y;
		z = rot.z === undefined ? this.rotation.z : rot.z;

		this.rotation.set(x, y, z);
	};

	//Export our DarwinOP model
	window.DarwinOP = DarwinOP;
}(window.THREE));
