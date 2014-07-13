(function (window) {
    
    "use strict";
    
    var LocalisationVisualiser;

    /**
     * The visualisation constructor.
     *
     * @param parameters the color of the visualisation
     * @constructor
     */
    LocalisationVisualiser = function (parameters) {
        // call super constructor
        THREE.Circle.call(this, parameters);
        // set the position and rotation of the circle
        LocalisationVisualiser.z += LocalisationVisualiser.zDifference;
        this.position.z = LocalisationVisualiser.z; // keep the slightly apart
        this.rotation.x = Math.PI / 2;
        this.mesh.material.transparent = true;
        this.mesh.material.opacity = 0.6;
    };

    /**
     * A static variable for the amount to raise z by to remove clipping across objects.
     *
     * @type {number}
     */
    LocalisationVisualiser.zDifference = 0.002;

    /**
     * A static variable for the z value of the last object.
     *
     * @type {number}
     */
    LocalisationVisualiser.z = LocalisationVisualiser.zDifference;

    /**
     * A method to create the circle object.
     *
     * @type {THREE.Circle}
     */
    LocalisationVisualiser.prototype = Object.create(THREE.Circle.prototype);

    /**
     * This method sets the width of the circle by scaling the y value of the unit circle.
     *
     * @param width
     */
    LocalisationVisualiser.prototype.setWidth = function (width) {
        this.scale.y = width * 2;
    };

    /**
     * This method sets the height of the circle by scaling the x value of the unit circle.
     *
     * @param height
     */
    LocalisationVisualiser.prototype.setHeight = function (height) {
        this.scale.x = height * 2;
    };

    /**
     * This static method visualises a particular object.
     *
     * @param object the object being visualised
     * @param parameters the color of the visualiser
     * @returns {THREE.Object3D} the object with its visualisation
     */
    LocalisationVisualiser.visualise = function (object, parameters) {
        // create a new object and visualisation object
        var newObject = new THREE.Object3D();
        var visualiser = new LocalisationVisualiser(parameters);
        // attach the visualiser to the new object
        newObject.visualiser = visualiser;
        newObject.add(visualiser);
        // attach the object to the new object
        newObject.object = object.object || object;
        newObject.add(object);
        // ensure the new object's position matches the position of the model that was passed in
        newObject.position = object.position;
        // set the model's position to the default as it is now relative to the new object
        object.position = new THREE.Vector3(0, 0, 0);
        return newObject;
    };

    // export the object
    window.LocalisationVisualiser = LocalisationVisualiser;
    
}(window));
