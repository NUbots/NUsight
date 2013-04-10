(function (window) {
    
    "use strict";
    
    var LocalisationVisualiser = function () {
        
        THREE.Circle.apply(this, arguments);
        
    };
    
    LocalisationVisualiser.prototype = Object.create(THREE.Circle.prototype);
    
    LocalisationVisualiser.prototype.setHeight = function (height) {
        
        this.scale.x = height * 2;
            
    };
    
    LocalisationVisualiser.prototype.setWidth = function (width) {
        
        this.scale.z = width * 2;
        
    };
    
    LocalisationVisualiser.prototype.update = function () {
        
        
        
    };
    
    // static
    LocalisationVisualiser.localise = function (object, parameters) {
        
        var newObject = new THREE.Object3D();
        var visualiser = new LocalisationVisualiser(parameters);
        
        newObject.visualiser = visualiser;
        newObject.add(visualiser);
        
        newObject.object = object;
        newObject.add(object);
        
        return newObject;
        
    }
    
    window.LocalisationVisualiser = LocalisationVisualiser;
    
}(window));