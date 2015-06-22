/**
 * This is the Arrow object
 */
(function (THREE) {

    "use strict";

    var Arrow;

    /**
     * This constructs an arrow of a particular direction, length, depth and color.
     *
     * @param parameters The direction, length, depth and color of the arrow.
     * @constructor
     */
    Arrow = function (parameters) {
        // Call super constructor.
        THREE.Object3D.call(this);
        // Ensure parameters is not undefined.
        parameters = parameters || {};
        // The origin, direction, length, width and height of the arrow and its color.
        var origin = parameters.position || new THREE.Vector3(0, 0, 0);
		var arrowOrigin = new THREE.Vector3(0, 0, 0);
        var direction;
        var length;
		if (parameters.direction == null && parameters.length == undefined) {
            var target = parameters.target;
            direction = target.clone().sub(origin);
            length = origin.distanceTo(target);
        } else {
			direction = parameters.direction || new THREE.Vector3(1, 0, 0);
			length = parameters.length !== undefined ? parameters.length : 1;
		}
        // Proportional to the length or the min default width
        var width = Math.min(length * 0.05, 0.05);
        var depth = parameters.depth || 0.05;
        // The value for left and right side of the arrow in the y-direction.
        var arrowBodyLeft = arrowOrigin.y - width * 0.5;
        var arrowBodyRight = arrowOrigin.y + width * 0.5;
        // The arrow head is 1/4 of the length, we need a 0.75 multiplier.
        var arrowHeadMultiplier = 0.75;
		// The left and right arrow head position.
		var arrowHeadLeft = arrowBodyLeft - width * 2;
		var arrowHeadRight = arrowBodyRight + width * 2;
        // The bottom of the arrow head x coordinate with a maximum value.
        var arrowHeadBottom = Math.max((arrowOrigin.x + length) * arrowHeadMultiplier, length - 0.25);
        // The top of the arrow head x coordinate.
        var arrowHeadTop = arrowHeadBottom + width * 0.5;
	    // The value for the end of the arrow body.
	    var arrowBodyEnd = arrowHeadBottom + width * 2 * Math.tan(55 * Math.PI / 180); // Math.tan needs to be in radians
        // End of the arrow.
        var arrowEnd = arrowOrigin.x + length;
        var color = parameters.color || 0xF0FAB0;
        // Create the arrow geometry.
        var arrow = new THREE.Shape();
        arrow.moveTo(arrowOrigin.x, arrowBodyLeft); // 0
        arrow.lineTo(arrowBodyEnd, arrowBodyLeft); // 2
        arrow.lineTo(arrowHeadBottom, arrowHeadLeft); // 5
        arrow.lineTo(arrowHeadTop, arrowHeadLeft - width); // 6
        arrow.lineTo(arrowEnd, arrowOrigin.y); // 4
        arrow.lineTo(arrowHeadTop, arrowHeadRight + width); // 8
        arrow.lineTo(arrowHeadBottom, arrowHeadRight); // 7
        arrow.lineTo(arrowBodyEnd, arrowBodyRight); // 3
        arrow.lineTo(arrowOrigin.x, arrowBodyRight); // 1
        arrow.lineTo(arrowOrigin.x, arrowBodyLeft); // 0
        // Create the geometry by extruding the arrow shape.
        var geometry = new THREE.ExtrudeGeometry(arrow, {
            amount: depth,
            curveSegments: 3,
            bevelEnabled: false
        });
        // Create a material.
        var material = new THREE.MeshLambertMaterial({
            color: color
        });
        // Create the arrow mesh with its geometry and specified material.
        this.mesh = new THREE.Mesh(geometry, material);
		// Set the position of the object.
		this.position.copy(origin);
		// Change the rotation order.
        this.rotation.order = 'ZYX';
        // Point the mesh in the direction vector.
		this.rotation.y = -Math.atan2(direction.z, Math.sqrt(Math.pow(length, 2) - Math.pow(direction.z, 2)));
		this.rotation.z = Math.PI * 0.5 - Math.atan2(direction.x, direction.y);
	    // Add a name to the object.
	    this.name = parameters.name || 'Arrow';
        // Add this mesh to the object.
        this.add(this.mesh);
    };

    Arrow.prototype = Object.create(THREE.Object3D.prototype);
    // Export the object.
    window.Arrow = Arrow;

}(window.THREE));
