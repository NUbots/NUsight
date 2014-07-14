/**
 * This is the Arrow object
 */
(function (THREE) {

    "use strict";

    var Arrow;

    /**
     * This constructs an arrow of a particular direction, length, depth and color.
     *
     * @param parameters the direction, length, depth and color of the arrow
     * @constructor
     */
    Arrow = function (parameters) {
        // call super constructor
        THREE.Object3D.call(this);
        // ensure parameters is not undefined
        parameters = parameters || {};
        // the origin, direction, length, width and height of the arrow and its color
        var origin = new THREE.Vector3(0, 0, 0);
        var direction = parameters.direction || new THREE.Vector3(1, 0, 0);
        var length = parameters.length || 1;
        var width = length * 0.05; // proportional to the length
        var depth = parameters.depth || 0.05;
        // the value for left and right side of the arrow and arrow head in the y-direction
        var arrowBodyLeft = origin.y - width * 0.5;
        var arrowBodyRight = origin.y + width * 0.5;
        var arrowHeadLeft = arrowBodyLeft - width * 2;
        var arrowHeadRight = arrowBodyRight + width * 2;
        // the arrow head is 1/4 of the length, we need a 0.75 multiplier
        var arrowHeadMultiplier = 0.75;
        // the value for the end of the arrow body
        var arrowBodyEnd = origin.x + length - width * 2;
        // the bottom of the arrow head x coordinate
        var arrowHeadBottom = (origin.x + length) * arrowHeadMultiplier;
        // the top of the arrow head x coordinate
        var arrowHeadTop = arrowHeadBottom + width * 0.5;
        // end of the arrow
        var arrowEnd = origin.x + length;
        var color = parameters.color || 0xF0FAB0;
        // create the arrow geometry
        var arrow = new THREE.Shape();
        arrow.moveTo(origin.x, arrowBodyLeft); // 0
        arrow.lineTo(arrowBodyEnd, arrowBodyLeft); // 2
        arrow.lineTo(arrowHeadBottom, arrowHeadLeft); // 5
        arrow.lineTo(arrowHeadTop, arrowHeadLeft - width); // 6
        arrow.lineTo(arrowEnd, origin.y); // 4
        arrow.lineTo(arrowHeadTop, arrowHeadRight + width); // 8
        arrow.lineTo(arrowHeadBottom, arrowHeadRight); // 7
        arrow.lineTo(arrowBodyEnd, arrowBodyRight); // 3
        arrow.lineTo(origin.x, arrowBodyRight); // 1
        arrow.lineTo(origin.x, arrowBodyLeft); // 0
        // create the geometry by extruding the arrow shape
        var geometry = new THREE.ExtrudeGeometry(arrow, {
            amount: depth,
            curveSegments: 3,
            bevelEnabled: false
        });
        // create a material
        var material = new THREE.MeshLambertMaterial({
            color: color
        });
        // create the arrow mesh with its geometry and specified material
        this.mesh = new THREE.Mesh(geometry, material);
        this.rotation.order = 'ZYX';
        // point the mesh in the direction vector
        this.rotation.y = -Math.atan2(direction.z, Math.abs(direction.x));
        this.rotation.z = Math.atan2(direction.y, direction.x);
        // move the arrow so its origin is on the ground
        this.position.z = 0.001;
        // add this mesh to the object
        this.add(this.mesh);
    };

    Arrow.prototype = Object.create(THREE.Object3D.prototype);
    // export the object
    window.Arrow = Arrow;

}(window.THREE));
