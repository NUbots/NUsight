/**
 * This is the Sphere object
 */
(function (THREE) {
	"use strict";

	var Sphere;

    /**
     * This constructs a sphere of a particular radius and color.
     *
     * @param radius the size of the radius
     * @param color the color of the sphere
     * @constructor
     */
	Sphere = function (radius, color) {
		var sphere;
        var segments = 16;
        var rings = 16;
		// call super constructor
		THREE.Object3D.call(this);
        // create the sphere geometry
        var geometry = new THREE.SphereGeometry(radius, segments, rings);
        // create a material
        var material = new THREE.MeshLambertMaterial({
            color: color
        });
        // create the sphere with its geometry and specified material
        sphere = new THREE.Mesh(geometry, material);
        // move the sphere so it's origin is on the ground
        sphere.position.z = radius;
        // add this mesh to the object
        this.add(sphere);
	};

	Sphere.prototype = Object.create(THREE.Object3D.prototype);

	//Export the object
	window.Sphere = Sphere;

}(window.THREE));
