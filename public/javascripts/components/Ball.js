/**
 * This is the Ball object, It is an orange sphere with the radius of a tennis
 * ball.
 */
(function (THREE) {
	"use strict";

	var Ball, RADIUS, COLOR;

	//The radius and Color constants
	RADIUS = 0.0335;
	COLOR = 0xFFA500;

	/**
	 * This constructs the ball, It is simply an orange sphere with the radius
	 * of a tennis ball.
	 */
	Ball = function () {

		var sphere, mesh;

		//Call super constructor
		THREE.Object3D.call(this);

		//Create a sphere
		sphere = new THREE.SphereGeometry(RADIUS, 24, 24);

		//Create the mesh
		mesh = new THREE.Mesh(sphere, new THREE.MeshPhongMaterial({
			color: COLOR
		}));

		//Move the mesh so it's origin is on the ground
		mesh.position.y = RADIUS;

		//Add this mesh to the object
		this.add(mesh);
	};

	Ball.prototype = Object.create(THREE.Object3D.prototype);

	//Export the object
	window.Ball = Ball;

}(window.THREE));