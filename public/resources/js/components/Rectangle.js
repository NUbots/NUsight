(function () {

    "use strict";

    var Rectangle;

    /**
     * This constructs a Rectangle of a particular width and length
     *
     * @type {Rectangle}
     */
    Rectangle = THREE.Rectangle = function (parameters) {
        THREE.Object3D.call(this, parameters);
        // ensure parameters is not undefined
        parameters = parameters || {};
        // the width and length in the rectangle and its color
        var width = parameters.width || 0.5;
        var length = parameters.length || 0.8;
        var color = parameters.color || 0x1111FF;
        // create the lines for the rectangle
        var rectangle = new THREE.Shape();
        rectangle.moveTo(0, 0);
        rectangle.lineTo(0, width);
        rectangle.lineTo(length, width);
        rectangle.lineTo(length, 0);
        rectangle.lineTo(0, 0);
        // create the rectangle geometry
        var geometry = new THREE.ShapeGeometry(rectangle);
        // create a material
        var material = new THREE.MeshBasicMaterial({
            color: color
        });
        // create the rectangle mesh with its geometry and specified material
        this.mesh = new THREE.Mesh(geometry, material);
        // move the rectangle so its origin is on the ground
        this.mesh.position.z = 0.001;
        // add the rectangle to the object
        this.add(this.mesh);
    };

    Rectangle.prototype = Object.create(THREE.Object3D.prototype);
    // export the object
    window.Rectangle = Rectangle;

}());
