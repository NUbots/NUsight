(function () {
    
    "use strict";
    
    var Circle;

    /**
     * This constructs a Circle of a particular width, height and rotation.
     *
     * @type {Circle}
     */
    Circle = function (parameters) {
        THREE.Object3D.call(this, parameters);
        // Ensure parameters is not undefined.
        parameters = parameters || {};
        // The radius and amount of segments in the circle and its color.
        var radius = 1;
        var segments = 128;
        var color = parameters.color || 0xFF00FF;
        // Create the circle geometry.
        var geometry = new THREE.CircleGeometry(radius, segments);
        // Create a material
        var material = new THREE.MeshBasicMaterial({
            color: color
        });
        // Create the circle mesh with its geometry and specified material.
        this.mesh = new THREE.Mesh(geometry, material);
		// Move the position of the object.
		this.position.copy(parameters.position || new THREE.Vector3(0, 0, 0));
        // Set the rotation of the circle.
        var rotationX = (parameters.rotation && parameters.rotation.x) || 0;
        var rotationY = (parameters.rotation && parameters.rotation.y) || 0;
        var rotationZ = (parameters.rotation && parameters.rotation.z) || 0;
        this.mesh.rotation.set(rotationX, rotationY, rotationZ);
        // Change the width and height of the circle.
        this.mesh.scale.y = parameters.width * 2 || 1;
        this.mesh.scale.x = parameters.height * 2 || 1;
	    // Add a name to the object.
	    this.name = parameters.name || 'Circle';
        // Add the circle to the object.
        this.add(this.mesh);
    };

    Circle.prototype = Object.create(THREE.Object3D.prototype);
    // Export the object.
    window.Circle = Circle;
    
}());
