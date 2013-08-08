(function (window) {
    
    "use strict";
    
    var BehaviourVisualiser = function () {
		
		THREE.Object3D.apply(this, arguments);
        
		this.speed = Math.random();
		this.relativeBearing = 0;
		this.relativeHeading = Math.random() * 0.4;
        this.color = 0x000000;
		
		//this.render();
        
    };
    
    BehaviourVisualiser.prototype = Object.create(THREE.Object3D.prototype);
    
    BehaviourVisualiser.prototype.update = function () {
        
        
        
    };
    
    BehaviourVisualiser.prototype.render = function () {
        
		var shape = this.drawShape();
        var material = new THREE.LineBasicMaterial({color: this.color, opacity: 1.0, transparent: true})
        var geometry = new THREE.ShapeGeometry(shape);
        var line = new THREE.Line(geometry, material);
        line.position.set(0, 0.001, 0);
        line.rotation.set(-Math.PI / 2, 0, 0);
        this.add(line);
        
    };
    
    BehaviourVisualiser.prototype.drawShape = function () {
        
        var shape = new THREE.Shape();
        shape.moveTo(0, 0);
		
		var properSpeed = this.speed * 20;
		var resolution = 500 / 1000;
		
		var projectedTime = 10;
		
		var x = Math.cos(this.relativeBearing) * properSpeed * resolution;
		var y = Math.sin(this.relativeBearing) * properSpeed * resolution;
        
		for (var i = 1; i < projectedTime / resolution; i++)
		{
			shape.lineTo(x, y);
			x += Math.cos(this.relativeHeading * i * resolution) * properSpeed * resolution;
			y += Math.sin(this.relativeHeading * i * resolution) * properSpeed * resolution;
		}
		
        return shape;
    };
    
    // static
    BehaviourVisualiser.visualise = function (object, parameters) {
        
        var newObject = new THREE.Object3D();
        var visualiser = new BehaviourVisualiser(parameters);
        
        newObject.visualiser = object.visualiser;
        newObject.behaviourVisualiser = visualiser;
        newObject.add(visualiser);
        
        newObject.object = object.object || object;
        newObject.add(object);
        
        return newObject;
        
    }
    
    window.BehaviourVisualiser = BehaviourVisualiser;
    
}(window));
