(function () {

	"use strict";

	var NoClipControls = THREE.NoClipControls = function (camera, domElement, objects, coordinates) {

		var self = this;
		this.enabled = false;

		this.camera = camera;
		this.objects = objects;
		// todo fix not passing in (painful using ext.componentquery.query)
		this.coordinates = coordinates;

		this.slow = false;
		this.movementSpeed = 1;
		this.slowSpeedMultiplier = 0.10;
		this.forwardSpeed = 0;
		this.strafeSpeed = 0;
		this.verticalSpeed = 0;
		this.gamepad = false;
		this.inverted = true; // the only way ;)

		this.constrainVertical = [-0.9, 0.9];

		this.forward = new THREE.Vector3(0, 0, 1);

		this.deltaX = 0;
		this.deltaY = 0;

		this.domElement = domElement;

		this.pitchObject = new THREE.Object3D();
		this.pitchObject.add(this.camera);

		this.yawObject = new THREE.Object3D();
		this.yawObject.add(this.pitchObject);

		this.light = new THREE.PointLight( 0xffffff );
		//this.light.position.set(0, 0, 1);
		this.yawObject.add(this.light);

		this.orientationCorrection = new THREE.Object3D();
		this.orientationCorrection.add(this.yawObject);
		this.orientationCorrection.rotation.x = Math.PI * 0.5;

		this.lastX = 0;
		this.lastY = 0;

		function addEventListener(element, event, listener) {
			if (listener === undefined) {
				listener = event;
				event = element;
				element = self.domElement;
			}
			element.addEventListener(event, function () {
				listener.apply(self, arguments);
			}, false);
		}

		var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

		if (havePointerLock) {
			addEventListener(document, 'keydown', this.onKeyDown);
			addEventListener(document, 'keyup', this.onKeyUp);
			addEventListener(document, 'mousemove', this.onMouseMove);
			addEventListener(document, 'pointerlockchange', this.pointerLockChange);
			addEventListener(document, 'mozpointerlockchange', this.pointerLockChange);
			addEventListener(document, 'webkitpointerlockchange', this.pointerLockChange);
			addEventListener(document, 'pointerlockerror', this.pointerLockError);
			addEventListener(document, 'mozpointerlockerror', this.pointerLockError);
			addEventListener(document, 'webkitpointerlockerror', this.pointerLockError);

			//window.document.requestFullscreen = this.domElement.mozRequestFullscreen || this.domElement.mozRequestFullScreen || this.domElement.webkitRequestFullscreen;
			this.domElement.requestPointerLock = this.domElement.requestPointerLock || this.domElement.mozRequestPointerLock || this.domElement.webkitRequestPointerLock;

			addEventListener('click', function () {
				//window.document.requestFullscreen();
				this.domElement.requestPointerLock();
			});
		}
	};

	NoClipControls.prototype.getObject = function () {
		return this.orientationCorrection;
	};

	/**
	 * This method gets the position of the object that wraps the camera (for consistent values among frameworks)
	 *
	 * @returns {*|Number[]} the camera x, y, z components
	 */
    NoClipControls.prototype.getPosition = function () {
	    return new THREE.Vector3().applyMatrix4(this.yawObject.matrixWorld);
    };

	/**
	 * This method returns the camera direction vector based on the camera being positioned at the origin <0, 0, 0>,
	 * always looking down at vector <0, 0, -1>
	 *
	 * @returns {XMLList|XML|String|*|Array} the camera direction vector
	 */
	NoClipControls.prototype.getDirection = function () {
		var vector = new THREE.Vector3(0, 0, -1);
		var point = vector.applyMatrix4(this.camera.matrixWorld);
		return point.sub(this.getPosition()).normalize();
	};

	NoClipControls.prototype.pointerLockChange = function () {
		this.enabled = document.pointerLockElement === this.domElement || document.mozPointerLockElement === this.domElement || document.webkitPointerLockElement === this.domElement;
	};

	NoClipControls.prototype.pointerLockError = function () {
		console.log("pointer lock error");
	};

	NoClipControls.prototype.onMouseMove = function (event) {
		if (this.enabled) {
			var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
			if (Math.abs(this.lastX - movementX) > 100 || Math.abs(this.lastY - movementY) > 100) {
				return;
			}
			this.yawObject.rotation.y -= movementX * 0.002;
			this.pitchObject.rotation.x -= movementY * 0.002;
			this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
			this.lastX = movementX;
			this.lastY = movementY;
			this.updateCoordinates();
		}
	};

	NoClipControls.prototype.onKeyDown = function (event) {
		var me = this;
		function calculateSpeed (speed) {
			var speedDirection = speed;
			if (me.slow) {
				speedDirection *= me.slowSpeedMultiplier;
			}
			// updates the coordinates during movement
			me.updateCoordinates();
			return speedDirection;
		}

		switch (event.keyCode) {
			case 16: /*shift*/
				if (!this.slow) {
					this.forwardSpeed *= this.slowSpeedMultiplier;
					this.strafeSpeed *= this.slowSpeedMultiplier;
					this.verticalSpeed *= this.slowSpeedMultiplier;
					this.slow = true;
				}
				break;

			case 38: /*up*/
			case 87: /*W*/
				this.forwardSpeed = calculateSpeed(1);
				break;

			case 37: /*left*/
			case 65: /*A*/
				this.strafeSpeed = calculateSpeed(-1);
				break;

			case 40: /*down*/
			case 83: /*S*/
				this.forwardSpeed = calculateSpeed(-1);
				break;

			case 39: /*right*/
			case 68: /*D*/
				this.strafeSpeed = calculateSpeed(1);
				break;

			case 82: /*R*/
				this.verticalSpeed = calculateSpeed(1);
				break;

			case 70: /*F*/
				this.verticalSpeed = calculateSpeed(-1);
				break;
		}
	};

	NoClipControls.prototype.onKeyUp = function (event) {
		switch (event.keyCode) {
			case 16: /*shift*/
				if (this.slow) {
					this.forwardSpeed /= this.slowSpeedMultiplier;
					this.strafeSpeed /= this.slowSpeedMultiplier;
					this.verticalSpeed /= this.slowSpeedMultiplier;
					this.slow = false;
				}
				break;

			case 38: /*up*/
			case 87: /*W*/
				this.forwardSpeed = 0;
				break;

			case 37: /*left*/
			case 65: /*A*/
				this.strafeSpeed = 0;
				break;

			case 40: /*down*/
			case 83: /*S*/
				this.forwardSpeed = 0;
				break;

			case 39: /*right*/
			case 68: /*D*/
				this.strafeSpeed = 0;
				break;

			case 82: /*R*/
				this.verticalSpeed = 0;
				break;

			case 70: /*F*/
				this.verticalSpeed = 0;
				break;
		}
	};

	NoClipControls.prototype.updateGamepad = function () {
		// TODO: remove backwards compatibility when chrome updates plz (chrome vs canary use different APIs at the time of this writing (18-03-2014)
		var oldAPI = navigator.webkitGetGamepads !== undefined;
		var getGamepads = navigator.webkitGetGamepads || navigator.getGamepads;
		var gamepads = getGamepads.call(navigator);

		for (var i = 0; i < gamepads.length; ++i) {
			var pad = gamepads[i];
			// kinda hacky
			if (pad === undefined || pad.buttons.length != 16 || pad.axes.length != 4) {
				continue;
			}
			var axes = pad.axes;
			var buttons = pad.buttons;
			// based on https://dvcs.w3.org/hg/gamepad/raw-file/default/gamepad.html#gamepad-interface
			var leftX = axes[0];
			var leftY = axes[1];
			var rightX = axes[2];
			var rightY = axes[3];
			var leftShoulder = buttons[4];
			var leftTrigger = buttons[6];
			var rightShoulder = buttons[5];

			this.forwardSpeed = -leftY;
			this.strafeSpeed = leftX;

			this.yawObject.rotation.y -= rightX * 0.05;
			this.pitchObject.rotation.x -= (this.inverted ? -1 : 1) * rightY * 0.05;
			this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));

			if (oldAPI) {
				this.verticalSpeed = leftShoulder? -1 : rightShoulder ? 1 : 0
			} else {
				this.verticalSpeed = leftShoulder.pressed ? -1 : rightShoulder.pressed ? 1 : 0
			}

			if ((oldAPI && leftTrigger > 0) || leftTrigger.pressed) {
				var value = oldAPI ? leftTrigger : leftTrigger.value;
				this.forwardSpeed *= this.slowSpeedMultiplier / value;
				this.strafeSpeed *= this.slowSpeedMultiplier / value;
				this.verticalSpeed *= this.slowSpeedMultiplier / value;
			}
			break;
		}
		this.updateCoordinates();
	};

	NoClipControls.prototype.update = function (delta) {
		if (!this.enabled) {
			return;
		}
		if (this.gamepad) {
			this.updateGamepad();
		}
		var actualSpeed = delta * this.movementSpeed;
		// project direction vector onto Z axis (?)
		this.yawObject.translateZ(-actualSpeed * this.forwardSpeed * Math.cos(this.pitchObject.rotation.x));
		this.yawObject.translateX(actualSpeed * this.strafeSpeed);
		// project direction vector onto Y axis, add speeds (?)
		this.yawObject.translateY(actualSpeed * this.verticalSpeed + (actualSpeed * this.forwardSpeed * Math.sin(this.pitchObject.rotation.x)));
	};

	/**
	 * Updates the coordinates listed at the bottom of the localisation display
	 */
	NoClipControls.prototype.updateCoordinates = function () {
		var me = this;
		function updatePoints (points) {
			// updates the coordinate template
			me.coordinates.update({
				x: points.x.toFixed(2),
				y: points.y.toFixed(2),
				z: points.z.toFixed(2)
			});
		}
		// create a ray caster that takes the parameter of the origin position and direction vector
		var raycaster = new THREE.Raycaster(this.getPosition(), this.getDirection());
		// checks for intersection between all objects where true checks all children
		var intersects = raycaster.intersectObjects(this.objects, true);
		// update the points using the closest intersection or reset to origin
		updatePoints(intersects.length > 0 ? intersects[0].point : new THREE.Vector3(0, 0, 0));
	}

}());
