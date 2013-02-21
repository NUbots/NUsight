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
        
        var visualiser = new LocalisationVisualiser(parameters);
        
        object.visualiser = visualiser;
        object.add(visualiser);
        
    }
    
    window.LocalisationVisualiser = LocalisationVisualiser;
    
}(window));