(function () {
    
    "use strict";
    
    var Circle = THREE.Circle = function (parameters) {
        
        THREE.Object3D.call(this, parameters);
        
        this.resolution = 128;
        //this.scale.set(50, 1, 50);
        this.scale.set(.5*100, 1*100, .5*100);
        
        this.color = (parameters && parameters.color) || 0xff00ff;
        
        this.render();
        
    };
    
    Circle.prototype = Object.create(THREE.Object3D.prototype);
    
    Circle.prototype.render = function () {
        
        var shape = this.drawShape(this.resolution);
        var geometry = new THREE.ShapeGeometry(shape);
        var material = new THREE.MeshBasicMaterial({color: this.color, opacity: 0.5, transparent: true})
        var circle = new THREE.Mesh(geometry, material);
        circle.position.set(0, 0.001, 0);
        circle.rotation.set(-Math.PI/2, 0, 0);
        this.add(circle);
        
        material = new THREE.LineBasicMaterial({linewidth: 5, color: 0x0, opacity: 0.5, transparent: true})
        geometry = new THREE.ShapeGeometry(shape);
        var line = new THREE.Line(geometry, material);
        line.position.set(0, 0.001, 0);
        line.rotation.set(-Math.PI/2, 0, 0);
        this.add(line);
        
    };
    
    Circle.prototype.drawShape = function (resolution) {
        
        var shape = new THREE.Shape();
        shape.moveTo(1, 0);
        for (var theta = Math.PI / resolution * 2; theta <= 2 * Math.PI; theta += Math.PI / resolution * 2) {
            var x = Math.cos(theta);
            var y = Math.sin(theta);
            shape.lineTo(x, y);
        }
        return shape;
    };
    
}());