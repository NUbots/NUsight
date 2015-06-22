(function () {

	"use strict";

	var Polypath;

	/**
	 * A constructor that builds a polypath mesh given a path.
	 *
	 * @param parameters The arguments that can be passed into the polypath constructor.
	 * @constructor
	 */
	Polypath = function (parameters) {
		THREE.Object3D.call(this, parameters);
		// Ensure the parameters exist.
		parameters = parameters || {};
		// Obtain the necessary parameters.
		var path = parameters.path || [];
		var width = parameters.width || 0.1;
		var color = parameters.color || 0xFFFFFF;
		// Create the geometry and material for the polypath.
		var geometry = new THREE.Geometry();
		var material = new THREE.MeshBasicMaterial({
			color: color
		});
		// Set the radius for an endpoint.
		var radius = width * 0.5;
		// Iterate through each path.
		for (var i = 0, len = path.length; i < len; i++) {
			// Obtain the node and its information.
			var node = path[i];
			var position = node[0];
			var parentIndex = node[1];
			// Check if the parentIndex has a parent of itself.
			if (parentIndex === i) {
				// Create the circle and merge it with the base geometry.
				geometry.merge(this.createCircle(position, radius));
			} else {
				// Create the line and merge it with the base geometry.
				geometry.merge(this.createLine(position, path[parentIndex][0], width));
			}
		}
		// Add the polypath to the object.
		this.add(new THREE.Mesh(geometry, material));
	};

	Polypath.prototype = Object.create(THREE.Object3D.prototype);
	window.Polypath = Polypath;

	/**
	 * Creates and returns a circle geometry to use with the polypath.
	 *
	 * @param position The position of the circle.
	 * @param radius The radius of the circle.
	 * @returns {THREE.CircleGeometry}
	 */
	Polypath.prototype.createCircle = function (position, radius) {
		var circle = new THREE.CircleGeometry(radius, 128);
		circle.applyMatrix(new THREE.Matrix4().makeTranslation(position.x, position.y, 0));
		return circle;
	};

	/**
	 * Creates and returns a plane geometry to use with the polypath.
	 *
	 * @param position The position vector of the line.
	 * @param target The target position vector.
	 * @param width The width of the line.
	 * @returns {THREE.PlaneGeometry}
	 */
	Polypath.prototype.createLine = function (position, target, width) {
		// The vector going from the target to the position.
		var vector = position.clone().sub(target);
		// Obtain the angle from the positive x-axis.
		var theta = Math.atan2(vector.y, vector.x);
		// Get the length of the vector by applying sqrt(x*x + y*y).
		var length = vector.length();
		// Create the line plane geometry with the specified length and width.
		var line = new THREE.PlaneGeometry(length, width);
		// Apply a translation to the line so that the endpoint is at the correct position.
		line.applyMatrix(new THREE.Matrix4().makeTranslation(length * 0.5, 0, 0));
		// Rotate the line along the vertical up-axis to face the target vector.
		line.applyMatrix(new THREE.Matrix4().makeRotationZ(theta));
		// Apply a translation to the line so that the line is at the desired position.
		line.applyMatrix(new THREE.Matrix4().makeTranslation(target.x, target.y, 0));
		// Return the geometry.
		return line;
	};

}());
