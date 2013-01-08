/**
 * A Darwin-OP model for Three.js. Has groupings so that each angle can be set
 * and the attached components will rotate with it as expected.
 */
(function (THREE) {
	"use strict";

	var DarwinOP, DarwinComponent;

	/**
	 * Creates a new Darwin-OP model. Creates the hierachy of objects so that
	 * they move as expected. To get the root element (to add to a scene) after
	 *  this has been consructed call getRootElement().
	 *
	 * @constructor
	 */
	DarwinOP = function () {
		//Create an object to hold our components
		this.components = {};

		//Setup Body Container
		this.components.body = new DarwinComponent({
			url: "darwin/Body.json",
			baseOffset: new THREE.Vector3(0, 0.3422, 0),
			rotationAxis: "y"
		});

		//Setup Head Containers
		this.components.neck = new DarwinComponent({
			parent: this.components.body,
			url: "darwin/Neck.json",
			baseOffset: new THREE.Vector3(0, 0.051, 0),
			rotationAxis: "y"
		});
		this.components.head = new DarwinComponent({
			parent: this.components.neck,
			url: "darwin/Head.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "x"
		});
		this.components.eyeLED = new DarwinComponent({
			parent: this.components.head,
			url: "darwin/EyeLED.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "none"
		});
		this.components.headLED = new DarwinComponent({
			parent: this.components.head,
			url: "darwin/HeadLED.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "none"
		});
		this.components.camera = new DarwinComponent({
			parent: this.components.head,
			url: "darwin/Camera.json",
			baseOffset: new THREE.Vector3(0, 0.0329074, 0.0359816),
			rotationAxis: "none"
		});

		//Setup Left Leg containers
		this.components.leftPelvisY = new DarwinComponent({
			parent: this.components.body,
			url: "darwin/LeftPelvisY.json",
			baseOffset: new THREE.Vector3(0.037, -0.1222, -0.005),
			rotationAxis: "y"
		});
		this.components.leftPelvis = new DarwinComponent({
			parent: this.components.leftPelvisY,
			url: "darwin/LeftPelvis.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "z"
		});
		this.components.leftUpperLeg = new DarwinComponent({
			parent: this.components.leftPelvis,
			url: "darwin/LeftUpperLeg.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "x"
		});
		this.components.leftLowerLeg = new DarwinComponent({
			parent: this.components.leftUpperLeg,
			url: "darwin/LeftLowerLeg.json",
			baseOffset: new THREE.Vector3(-0, -0.093, 0),
			rotationAxis: "x"
		});
		this.components.leftAnkle = new DarwinComponent({
			parent: this.components.leftLowerLeg,
			url: "darwin/LeftAnkle.json",
			baseOffset: new THREE.Vector3(-0, -0.093, 0),
			rotationAxis: "x"
		});
		this.components.leftFoot = new DarwinComponent({
			parent: this.components.leftAnkle,
			url: "darwin/LeftFoot.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "z"
		});

		//Setup Right Leg containers
		this.components.rightPelvisY = new DarwinComponent({
			parent: this.components.body,
			url: "darwin/RightPelvisY.json",
			baseOffset: new THREE.Vector3(-0.037, -0.1222, -0.005),
			rotationAxis: "y"
		});
		this.components.rightPelvis = new DarwinComponent({
			parent: this.components.rightPelvisY,
			url: "darwin/RightPelvis.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "z"
		});
		this.components.rightUpperLeg = new DarwinComponent({
			parent: this.components.rightPelvis,
			url: "darwin/RightUpperLeg.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "x"
		});
		this.components.rightLowerLeg = new DarwinComponent({
			parent: this.components.rightUpperLeg,
			url: "darwin/RightLowerLeg.json",
			baseOffset: new THREE.Vector3(-0, -0.093, 0),
			rotationAxis: "x"
		});
		this.components.rightAnkle = new DarwinComponent({
			parent: this.components.rightLowerLeg,
			url: "darwin/RightAnkle.json",
			baseOffset: new THREE.Vector3(-0, -0.093, 0),
			rotationAxis: "x"
		});
		this.components.rightFoot = new DarwinComponent({
			parent: this.components.rightAnkle,
			url: "darwin/RightFoot.json",
			baseOffset: new THREE.Vector3(),
			rotationAxis: "z"
		});

		//Setup Left Arm Containers
		this.components.leftShoulder = new DarwinComponent({
			parent: this.components.body,
			url: "darwin/LeftShoulder.json",
			baseOffset: new THREE.Vector3(0.082, 0, 0),
			rotationAxis: "x"
		});
		this.components.leftUpperArm = new DarwinComponent({
			parent: this.components.leftShoulder,
			url: "darwin/LeftUpperArm.json",
			baseOffset: new THREE.Vector3(0, -0.016, 0),
			rotationAxis: "z"
		});
		this.components.leftLowerArm = new DarwinComponent({
			parent: this.components.leftUpperArm,
			url: "darwin/LeftLowerArm.json",
			baseOffset: new THREE.Vector3(0, -0.06, 0.016),
			rotationAxis: "x"
		});

		//Setup Right Arm Containers
		this.components.rightShoulder = new DarwinComponent({
			parent: this.components.body,
			url: "darwin/RightShoulder.json",
			baseOffset: new THREE.Vector3(-0.082, 0, 0),
			rotationAxis: "x"
		});
		this.components.rightUpperArm = new DarwinComponent({
			parent: this.components.rightShoulder,
			url: "darwin/RightUpperArm.json",
			baseOffset: new THREE.Vector3(0, -0.016, 0),
			rotationAxis: "z"
		});
		this.components.rightLowerArm = new DarwinComponent({
			parent: this.components.rightUpperArm,
			url: "darwin/RightLowerArm.json",
			baseOffset: new THREE.Vector3(0, -0.06, 0.016),
			rotationAxis: "x"
		});
	};

	/**
	 * Gets the root element for this DarwinOP object (the body container)
	 */
	DarwinOP.prototype.getRootElement = function () {
		//Return the body container
		return this.components.body.container;
	};

	/**
	 * This method binds the robot's position and movement to the data model so
	 * that updates to the data model update the robot's position and rotation
	 */
	DarwinOP.prototype.bindToData = function (data) {
		var key, self, createCallbackForKey;

		//Maintain context
		self = this;

		//Create a factory to make our callback functions
		createCallbackForKey = function (key) {
			data.robot.motors[key].angle.onUpdate(function (event) {
				self.components[key].setAngle(event.detail.newValue);
			});
		};

		//Bind to all the motor angles
		for (key in this.components) {
			if (data.robot.motors[key] !== undefined) {
				createCallbackForKey(key);
			}
		}

		//Bind to the localization position
		data.robot.localization.position.onUpdate(function (event) {
			self.components.body.setPosition(new THREE.Vector3(event.detail.newValue[0], 0, event.detail.newValue[1]));
		});

		//Bind to the localization angle
		data.robot.localization.angle.onUpdate(function (event) {
			self.components.body.setAngle(event.detail.newValue);
		});

		//Bind to the orientation angle
		data.robot.sensors.orientation.onUpdate(function (event) {
			self.components.body.setRotation(new THREE.Vector3(event.detail.newValue[0], undefined, event.detail.newValue[1]));

			//TODO calculate his vertical position and set the y position so that he is always touching the ground
			//Should be some simple trig, he will rotate around body.baseOffset off the ground (until it goes upside down and he will be underground)
		});
	};

	/**
	 * This constructs a new DarwinComponent which loads in the data for each
	 * component and builds the hieracy of objects
	 *
	 * @param params an object containing the values
	 *              parent (another darwin component [optional])
	 *              url to load the component from,
	 *              initial offset (all positions will use this offset)
	 *              axisOfRotation a position that is used to set where this object rotates around
	 *
	 * @constructor
	 */
	DarwinComponent = function (params) {

		//Maintan scope
		var self = this;

		//Create our container
		this.container = new THREE.Object3D();

		//Store our rotation axis
		this.rotationAxis = params.rotationAxis;

		//Add ourselves to our parent (if it exists)
		if (params.parent !== undefined) {
			params.parent.container.add(this.container);
		}

		//Load this URL into our container
		new THREE.JSONLoader().load(params.url, function (geom, materials) {
			var material, mesh;

			//Merge the verticies
			geom.mergeVertices();

			//Create a mesh from our geometry
			mesh = new THREE.Mesh(geom, new THREE.MeshFaceMaterial(materials));

			//Add it to the appropriate container
			self.container.add(mesh);
		});

		//Try to get our base offsets
		this.basePosition = params.baseOffset === undefined ? new THREE.Vector3() : params.baseOffset;

		//Set our position to 0
		this.setPosition(new THREE.Vector3());
		this.setAngle(0);
	};

	/**
	 * Sets the rotation of this object in the defined axis of rotation
	 *
	 * @param angle the angle to set the motor at in radians
	 */
	DarwinComponent.prototype.setAngle = function (angle) {
		switch (this.rotationAxis) {
			case "x":
				this.container.rotation.x = angle;
				break;
			case "y":
				this.container.rotation.y = angle;
				break;
			case "z":
				this.container.rotation.z = angle;
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
		x = pos.x === undefined ? this.container.position.x : pos.x + this.basePosition.x;
		y = pos.y === undefined ? this.container.position.y : pos.y + this.basePosition.y;
		z = pos.z === undefined ? this.container.position.z : pos.z + this.basePosition.z;

		this.container.position.set(x, y, z);
	};

	/**
	 * Sets the rotation of this object
	 *
	 * @param rot the rotation to set (undefined will be left as is)
	 */
	DarwinComponent.prototype.setRotation = function (rot) {
		var x, y, z;

		//Work out what our X Y and Z should be
		x = rot.x === undefined ? this.container.rotation.x : rot.x;
		y = rot.y === undefined ? this.container.rotation.y : rot.y;
		z = rot.z === undefined ? this.container.rotation.z : rot.z;

		this.container.rotation.set(x, y, z);
	};

	//Export our DarwinOP model
	window.DarwinOP = DarwinOP;
}(window.THREE));