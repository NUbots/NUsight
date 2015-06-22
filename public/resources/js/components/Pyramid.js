/**
 * This is the Pyramid object
 */
(function (THREE) {

    "use strict";

    var Pyramid;

    /**
     * This constructs a pyramid of a particular radius and color.
     *
     * @param parameters The radius, height, amount of faces and color of the pyramid.
     * @constructor
     */
    Pyramid = function (parameters) {
        // Call super constructor.
        THREE.Object3D.call(this);
        // Ensure parameters is not undefined.
        parameters = parameters || {};
        // The radius, height and amount of faces in the cylinder and its color.
        var radius = parameters.radius || 0.25;
        var height = parameters.height || 0.25;
        var faces = parameters.faces || 4;
        var color = parameters.color || 0x8F2F7C;
        // Create the pyramid geometry.
        var geometry = new THREE.CylinderGeometry(0, radius, height, faces, false);
        // Create a material.
        var material = new THREE.MeshLambertMaterial({
            color: color
        });
        // Create the pyramid mesh with its geometry and specified material.
        this.mesh = new THREE.Mesh(geometry, material);
		// Move the position of the object.
		this.position = parameters.position || new THREE.Vector3(0, 0, 0);
        // Set the rotation of the cylinder.
        var rotationX = (parameters.rotation && parameters.rotation.x) || (0.5 * Math.PI);
        var rotationY = (parameters.rotation && parameters.rotation.y) || 0;
        var rotationZ = (parameters.rotation && parameters.rotation.z) || 0;
        this.mesh.rotation.set(rotationX, rotationY, rotationZ);
	    // Add a name to the object.
	    this.name = parameters.name || 'Pyramid';
        // Add the pyramid to the object.
        this.add(this.mesh);
    };

    Pyramid.prototype = Object.create(THREE.Object3D.prototype);
    // Export the object.
    window.Pyramid = Pyramid;

}(window.THREE));
