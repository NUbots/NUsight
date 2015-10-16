(function () {

	"use strict";

	var Polyline;

	/**
	 * A constructor that builds a polyline mesh given a path.
	 *
	 * @param parameters The arguments that can be passed into the polyline constructor.
	 * @constructor
	 */
	Polyline = function (parameters) {
		THREE.Object3D.call(this, parameters);
		// Ensure the parameters exist.
		parameters = parameters || {};
		// Obtain the necessary parameters.
		var path = parameters.path || [];
		var width = parameters.width || 0.1;
		var color = parameters.color || 0xffaaff;
		// Create the geometry and material for the polyline.
		var linesGeometry = new THREE.Geometry();
		var pointsGeometry = new THREE.Geometry();
		var linesMaterial = new THREE.MeshBasicMaterial({ color: color });
		var pointsMaterial = new THREE.MeshBasicMaterial({ color: (color & 0xfefefe) >> 1 });
		// Set the radius for an endpoint.
		var radius = width * 0.5;
		// Iterate through each path.
		for (var i = 0, len = path.length; i < len; i++) {
			// Obtain the node and its information.
			var node = path[i];
			var position = node.position;
			var parentIndex = node.parentIndex;
			// Check if the parentIndex has a parent of itself.
			if (parentIndex === i) {
				// Create the circle and merge it with the base geometry.
				pointsGeometry.merge(this.createCircle(position, radius));
			} else {
				// Create the line and merge it with the base geometry.
				linesGeometry.merge(this.createLine(position, path[parentIndex].position, width));
				pointsGeometry.merge(this.createCircle(position, radius));
			}
		}
		// Add the polyline to the object.
		this.add(new THREE.Mesh(linesGeometry, linesMaterial));
		this.add(new THREE.Mesh(pointsGeometry, pointsMaterial));

	    this.name = parameters.name || 'Polyline';
	};

	Polyline.prototype = Object.create(THREE.Object3D.prototype);
	window.Polyline = Polyline;

	/**
	 * Creates and returns a circle geometry to use with the polyline.
	 *
	 * @param position The position of the circle.
	 * @param radius The radius of the circle.
	 * @returns {THREE.CircleGeometry}
	 */
	Polyline.prototype.createCircle = function (position, radius) {
		var circle = new THREE.CircleGeometry(radius, 64);
		circle.applyMatrix(new THREE.Matrix4().makeTranslation(position.x, position.y, 0.02));
		return circle;
	};

	/**
	 * Creates and returns a plane geometry to use with the polyline.
	 *
	 * @param position The position vector of the line.
	 * @param target The target position vector.
	 * @param width The width of the line.
	 * @returns {THREE.PlaneGeometry}
	 */
	Polyline.prototype.createLine = function (position, target, width) {
		// Convert the position and target object to vectors.
		position = new THREE.Vector2(position.x, position.y);
		target = new THREE.Vector2(target.x, target.y);
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
		line.applyMatrix(new THREE.Matrix4().makeTranslation(target.x, target.y, 0.01));
		// Return the geometry.
		return line;
	};

}());
