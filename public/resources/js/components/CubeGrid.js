/**
 * This is a Cube Grid object
 */
(function (THREE) {

    "use strict";

    var CubeGrid;

    /**
     * This constructs a Cube Grid of a particular width, height, depth and color.
     *
     * @param parameters The width, height, depth and color of the Cube Grid.
     * @constructor
     */
    CubeGrid = function (parameters) {
        // Call super constructor.
        THREE.Object3D.call(this);
        // Ensure parameters is not undefined.
        parameters = parameters || {};
        
        var color = parameters.color || 0xffffff; //grid colour 
        var sideLength = parameters.sideLength || 0.1; //the length that each side of the cube is
        var width = parameters.width || 0.6; //the width of the grid
        var height = parameters.height || 0.6; //the height of the grid
        var depth = parameters.depth || 0.6; //the depth of the grid

        var geometry = new THREE.Geometry();
        var material = new THREE.LineBasicMaterial( { color: color} );

        for(var z = 0; z < height + sideLength; z += sideLength) {
            for(var y = 0; y < depth + sideLength; y += sideLength) {
                geometry.vertices.push(new THREE.Vector3(0, y, z));
                geometry.vertices.push(new THREE.Vector3(width, y, z));
            }
        }

        for(var x = 0; x < width + sideLength; x += sideLength) {
            for(var y = 0; y < depth + sideLength; y += sideLength) {
                geometry.vertices.push(new THREE.Vector3(x, y, 0));
                geometry.vertices.push(new THREE.Vector3(x, y, height));
            }
        }

        for(var x = 0; x < width + sideLength; x += sideLength) {
            for(var z = 0; z < height + sideLength; z += sideLength) {
                geometry.vertices.push(new THREE.Vector3(x, 0, z));
                geometry.vertices.push(new THREE.Vector3(x, depth, z));
            }
        }

        //translate the grid to the correct position
        geometry.translate(-(width / 2), - (depth / 2), 0.253 - (height/2));

        //create the line object
        this.line = new THREE.Line(geometry, material, THREE.LinePieces);

	    // Add a name to the object.
	    this.name = parameters.name || 'CubeGrid';

        // Add the lines to the object.
        this.add(this.line);
    };

    CubeGrid.prototype = Object.create(THREE.Object3D.prototype);
    // Export the object.
    window.CubeGrid = CubeGrid;

}(window.THREE));