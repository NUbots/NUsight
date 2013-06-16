(function () {
    
    "use strict";   
    
    var NoClipControls = THREE.NoClipControls = function (camera, domElement) {
        
        var self = this;
        this.enabled = false;
        
        this.camera = camera;
        
        this.slow = false;
        this.movementSpeed = 1;
        this.slowSpeedMultiplier = 0.10;
        this.forwardSpeed = 0;
        this.strafeSpeed = 0;
        this.verticalSpeed = 0;
        
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
        
        return this.yawObject;
          
    };
    
    NoClipControls.prototype.pointerLockChange = function () {
        
        if (document.pointerLockElement === this.domElement || document.mozPointerLockElement === this.domElement || document.webkitPointerLockElement === this.domElement) {
            
            this.enabled = true;
            
        } else {
            
            this.enabled = false;
            
        }
        
    };
    
    NoClipControls.prototype.pointerLockError = function () {
        
        console.log("pointer lock error");
        
    };
    
    NoClipControls.prototype.onMouseMove = function (event) {
        
        if (this.enabled) {
            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
            
            this.yawObject.rotation.y -= movementX * 0.002;
            this.pitchObject.rotation.x -= movementY * 0.002;
            
            this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
        }
        
    };
    
    NoClipControls.prototype.onKeyDown = function (event) {
        
        //event.preventDefault();
        
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
                this.forwardSpeed = 1;
                if (this.slow) {
                    this.forwardSpeed *= this.slowSpeedMultiplier;
                }
                break;
            
            case 37: /*left*/
            case 65: /*A*/
                this.strafeSpeed = -1;
                if (this.slow) {
                    this.strafeSpeed *= this.slowSpeedMultiplier;
                }
                break;
            
            case 40: /*down*/
            case 83: /*S*/
                this.forwardSpeed = -1;
                if (this.slow) {
                    this.forwardSpeed *= this.slowSpeedMultiplier;
                }
                break;
            
            case 39: /*right*/
            case 68: /*D*/
                this.strafeSpeed = 1;
                if (this.slow) {
                    this.strafeSpeed *= this.slowSpeedMultiplier;
                }
                break;
            
            case 82: /*R*/
                this.verticalSpeed = 1;
                if (this.slow) {
                    this.verticalSpeed *= this.slowSpeedMultiplier;
                }
                break;
            case 70: /*F*/
                this.verticalSpeed = -1;
                if (this.slow) {
                    this.verticalSpeed *= this.slowSpeedMultiplier;
                }
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
    
    NoClipControls.prototype.update = function (delta) {
        
        if (!this.enabled) {
            return;
        }
        
        var actualSpeed = delta * this.movementSpeed;
        
        // project direction vector onto Z axis (?)
        this.yawObject.translateZ(-actualSpeed * this.forwardSpeed * Math.cos(this.pitchObject.rotation.x));
        this.yawObject.translateX(actualSpeed * this.strafeSpeed);
        // project direction vector onto Y axis, add speeds (?)
        this.yawObject.translateY(actualSpeed * this.verticalSpeed + (actualSpeed * this.forwardSpeed * Math.sin(this.pitchObject.rotation.x)));
        
    };
    
}());
