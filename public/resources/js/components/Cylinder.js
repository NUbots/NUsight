/**
 * This is the Goal object, It is an yellow cylinder.
 */
(function (THREE) {
    "use strict";

    var Cylinder;

    /**
     * This constructs a cylinder of a particular top and bottom radius, height and color.
     *
     * @param topRadius the size of the radius at the top of the cylinder
     * @param bottomRadius the size of the radius at the bottom of the cylinder
     * @param height the height of the cylinder
     * @param rotation the amount to rotate the cylinder by
     * @param color the colour of the cylinder
     * @constructor
     */
    Cylinder = function (topRadius, bottomRadius, height, rotation, color) {
        var cylinder;
        // call super constructor
        THREE.Object3D.call(this);
        // create the cylinder geometry
        var geometry = new THREE.CylinderGeometry(topRadius, bottomRadius, height, 50, 50);
        // create a material
        var material = new THREE.MeshLambertMaterial({
            color: color
        });
        // create the cylinder with its geometry and specified material
        cylinder = new THREE.Mesh(geometry, material);
        // rotate the cylinder
        cylinder.rotation.set(rotation.x, rotation.y, rotation.z);
        // move the cylinder so it's origin is on the ground
        cylinder.position.z = height / 2;
        // add this cylinder to the object
        this.add(cylinder);
    };

    Cylinder.prototype = Object.create(THREE.Object3D.prototype);
    // export the object
    window.Cylinder = Cylinder;

}(window.THREE));
