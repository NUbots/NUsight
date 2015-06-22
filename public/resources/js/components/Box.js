/**
 * This is the Box object
 */
(function (THREE) {

    "use strict";

    var Box;

    /**
     * This constructs a box of a particular width, height, depth and color.
     *
     * @param parameters The width, height, depth and color of the box.
     * @constructor
     */
    Box = function (parameters) {
        // Call super constructor.
        THREE.Object3D.call(this);
        // Ensure parameters is not undefined.
        parameters = parameters || {};
        // The width, height and depth of the box and its color.
        var width = parameters.width || 0.25;
        var height = parameters.height || 0.25;
        var depth = parameters.depth || 0.25;
        var color = parameters.color || 0x2B6E8F;
        // Create the box geometry.
        var geometry = new THREE.BoxGeometry(width, height, depth);
        // Create a material.
        var material = new THREE.MeshLambertMaterial({
            color: color
        });
        // Create the box mesh with its geometry and specified material.
        this.mesh = new THREE.Mesh(geometry, material);
        // Move the position of the object.
        this.position = parameters.position || new THREE.Vector3(0, 0, 0);
	    // Add a name to the object.
	    this.name = parameters.name || 'Box';
        // Add this mesh to the object.
        this.add(this.mesh);
    };

    Box.prototype = Object.create(THREE.Object3D.prototype);
    // Export the object.
    window.Box = Box;

}(window.THREE));
