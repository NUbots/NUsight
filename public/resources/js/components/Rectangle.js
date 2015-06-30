(function () {

    "use strict";

    var Rectangle;

    /**
     * This constructs a Rectangle of a particular width and length.
     *
     * @type {Rectangle}
     */
    Rectangle = function (parameters) {
        THREE.Object3D.call(this, parameters);
        // Ensure parameters is not undefined.
        parameters = parameters || {};
        // The position, width, length and direction of the rectangle and its color.
        var origin = parameters.position || new THREE.Vector3(0, 0, 0);
	    var width  = parameters.width  || 0.5;
        var length = parameters.length || 0.8;
	    var rotation = parameters.rotation || new THREE.Vector3(0, 0, 0);
        // var length;
	    // if (parameters.target !== null && parameters.target != undefined) {
		   //  var target = parameters.target;
		   //  direction = target.clone().sub(origin);
		   //  length = origin.distanceTo(target);
	    // } else {
		   //  direction = parameters.direction || new THREE.Vector3(1, 0, 0);
		   //  length = parameters.length !== undefined ? parameters.length : 0.8;
	    // }
        var color = parameters.color || 0x1111FF;
        // // Create the lines for the rectangle.
        // var rectangle = new THREE.Shape();
        // rectangle.moveTo(0, 0);
        // rectangle.lineTo(0, width);
        // rectangle.lineTo(length, width);
        // rectangle.lineTo(length, 0);
        // rectangle.lineTo(0, 0);
        // Create the rectangle geometry.
        // var geometry = new THREE.ShapeGeometry(rectangle);
        var geometry = new THREE.PlaneBufferGeometry(length, width);
        // geometry.applyMatrix(new THREE.Matrix4().makeTranslation(length * 0.5, width * 0.5, 0));
        // create a material
        var material = new THREE.MeshBasicMaterial({
            color: color
        });
        // Create the rectangle mesh with its geometry and specified material.
        this.mesh = new THREE.Mesh(geometry, material);
		// move the position of the object
        this.position.copy(origin);
	    // Change the rotation order.
	    // this.rotation.order = 'ZYX';
	    // Point the mesh in the direction vector.
	    // this.rotation.y = -Math.atan2(direction.z, Math.sqrt(Math.pow(length, 2) - Math.pow(direction.z, 2)));
	    // this.rotation.z = rotation.z; // Math.PI * 0.5 - Math.atan2(direction.x, direction.y);
	    this.rotation.copy(rotation);
        console.log(rotation, this.rotation);
        // Add a name to the object.
	    this.name = parameters.name || 'Rectangle';
        // Add the rectangle to the object.
        this.add(this.mesh);
    };

    Rectangle.prototype = Object.create(THREE.Object3D.prototype);
    // export the object
    window.Rectangle = Rectangle;

}());
