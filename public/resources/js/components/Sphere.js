/**
 * This is the Sphere object
 */
(function (THREE) {
	"use strict";

	var Sphere;

    /**
     * This constructs a sphere of a particular radius and color.
     *
     * @param parameters the radius and color of the sphere
     * @constructor
     */
	Sphere = function (parameters) {
		// call super constructor
		THREE.Object3D.call(this);
        // ensure parameters is not undefined
        parameters = parameters || {};
        // the radius and the amount of segments and rings in the sphere and its color
        var radius = parameters.radius || 0.0335;
        var segments = 16;
        var rings = 16;
        var color = parameters.color || 0xFFCC00;
        // create the sphere geometry
        var geometry = new THREE.SphereGeometry(radius, segments, rings);
        // create a material
        var material = new THREE.MeshLambertMaterial({
            color: color
        });
        // create the sphere mesh with its geometry and specified material
        this.mesh = new THREE.Mesh(geometry, material);
		// move the position of the object
		this.position = parameters.position || new THREE.Vector3(0, 0, 0);
		// add a name to the object
		this.name = parameters.name || "Sphere";
        // add the sphere to the object
        this.add(this.mesh);
	};

	Sphere.prototype = Object.create(THREE.Object3D.prototype);
	// export the object
	window.Sphere = Sphere;

}(window.THREE));
