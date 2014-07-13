/**
 * This is the Box object
 */
(function (THREE) {

    "use strict";

    var Box;

    /**
     * This constructs a box of a particular width, height, depth and color.
     *
     * @param parameters the width, height, depth and color of the box
     * @constructor
     */
    Box = function (parameters) {
        // call super constructor
        THREE.Object3D.call(this);
        // ensure parameters is not undefined
        parameters = parameters || {};
        // the width, height and depth of the box and its color
        var width = parameters.width || 0.25;
        var height = parameters.height || 0.25;
        var depth = parameters.depth || 0.25;
        var color = parameters.color || 0x2B6E8F;
        // create the box geometry
        var geometry = new THREE.BoxGeometry(width, height, depth);
        // create a material
        var material = new THREE.MeshLambertMaterial({
            color: color
        });
        // create the box mesh with its geometry and specified material
        this.mesh = new THREE.Mesh(geometry, material);
        // move the box so its origin is on the ground
        this.mesh.position.z = height * 0.5;
        // add this mesh to the object
        this.add(this.mesh);
    };

    Box.prototype = Object.create(THREE.Object3D.prototype);
    // export the object
    window.Box = Box;

}(window.THREE));
