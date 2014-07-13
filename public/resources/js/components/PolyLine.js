(function () {

    "use strict";

    var PolyLine;

    /**
     * This constructs a Polygon using lines through specified vertices
     *
     * @type {PolyLine}
     */
    PolyLine = THREE.Rectangle = function (parameters) {
        THREE.Object3D.call(this, parameters);
        // ensure parameters is not undefined
        parameters = parameters || {};
        // the vertices and fill of the polygon and its color
        var vertices = parameters.vertices;
        debugger;
        var lineWidth = parameters.lineWidth || 500;
        var fill = parameters.fill || true;
        var color = parameters.color || 0x00FF45;
        // create the geometry
        var geometry = new THREE.Geometry();
        // add the points to the geometry
        Ext.each(vertices , function (vertex) {
            var x = vertex[0] || 0;
            var y = vertex[1] || 0;
            var z = vertex[2] || 0;
            geometry.vertices.push(new THREE.Vector3(x, y, z));
        });
        // create a material
        var material = new THREE.LineBasicMaterial({
            color: color,
            lineWidth: lineWidth
        });
        // create the polyLine mesh with its geometry and specified material
        this.mesh = new THREE.Line(geometry, material);
        // move the rectangle so its origin is on the ground
        this.mesh.position.z = 0.001;
        // add the rectangle to the object
        this.add(this.mesh);
    };

    PolyLine.prototype = Object.create(THREE.Object3D.prototype);
    // export the object
    window.PolyLine = PolyLine;

}());
