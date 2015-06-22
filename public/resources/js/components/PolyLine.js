(function () {

    "use strict";

    var Polyline;

    /**
     * This constructs a Polygon using lines through specified vertices.
     *
     * @type {Polyline}
     */
    Polyline = function (parameters) {
        THREE.Object3D.call(this, parameters);
        // Ensure parameters is not undefined.
        parameters = parameters || {};
        // The vertices and fill of the polygon and its color.
        var vertices = parameters.vertices;
        var lineWidth = parameters.lineWidth || 500;
        var fill = parameters.fill || true;
        var color = parameters.color || 0x00FF45;
        // Create the geometry
        var geometry = new THREE.Geometry();
        // Add the points to the geometry.
        Ext.each(vertices , function (vertex) {
            var x = vertex[0] || 0;
            var y = vertex[1] || 0;
            var z = vertex[2] || 0;
            geometry.vertices.push(new THREE.Vector3(x, y, z));
        });
        // Create a material.
        var material = new THREE.LineBasicMaterial({
            color: color,
            lineWidth: lineWidth
        });
        // Create the polyline mesh with its geometry and specified material.
        this.mesh = new THREE.Line(geometry, material);
		// Move the position of the object.
		this.position = parameters.position || new THREE.Vector3(0, 0, 0);
	    // Add a name to the object.
	    this.name = parameters.name || 'Polyline';
        // Add the rectangle to the object.
        this.add(this.mesh);
    };

    Polyline.prototype = Object.create(THREE.Object3D.prototype);
    // Export the object.
    window.Polyline = Polyline;

}());
