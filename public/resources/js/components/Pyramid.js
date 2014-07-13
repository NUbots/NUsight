/**
 * This is the Pyramid object
 */
(function (THREE) {
    "use strict";

    var Pyramid;

    /**
     * This constructs a pyramid of a particular radius and color.
     *
     * @param parameters the radius, height, amount of faces and color of the pyramid
     * @constructor
     */
    Pyramid = function (parameters) {
        // call super constructor
        THREE.Geometry.call(this);
        // ensure parameters is not undefined
        parameters = parameters || {};
        // the radius, height and amount of faces in the cylinder and its color
        var radius = parameters.radius || 0.25;
        var height = parameters.height || 0.25;
        var faces = parameters.faces || 4;
        var color = parameters.color || 0x8F2F7C;
        // create the pyramid geometry
        var geometry = new THREE.CylinderGeometry(0, radius, height, faces, false);
        // create a material
        var material = new THREE.MeshLambertMaterial({
            color: color
        });
        // create the pyramid mesh with its geometry and specified material
        this.mesh = new THREE.Mesh(geometry, material);
        // set the rotation of the cylinder
        var rotationX = (parameters.rotation && parameters.rotation.x) || (0.5 * Math.PI);
        var rotationY = (parameters.rotation && parameters.rotation.y) || 0;
        var rotationZ = (parameters.rotation && parameters.rotation.z) || 0;
        this.mesh.rotation.set(rotationX, rotationY, rotationZ);
        // move the sphere so it's origin is on the ground
        this.mesh.position.z = radius * 0.5;
        // add the pyramid to the object
        this.add(this.mesh);
    };

    Pyramid.prototype = Object.create(THREE.Object3D.prototype);
    // export the object
    window.Pyramid = Pyramid;

}(window.THREE));
