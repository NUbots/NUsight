Ext.define("Ext.ux.ThreeJS", {
	extend : 'Ext.Container',
	alias : ['widget.threejs'],
	renderer: null,
	camera: null,
	scene: null,
	controls: null,
	layout: 'fit',
	items: [{
		xtype: 'component',
		itemId: 'domElementContainer'
	}],
	setComponents: function (scene, renderer, camera) {
		
		this.scene = scene;
		this.renderer = renderer;
		this.camera = camera;
		this.clock = new THREE.Clock();
		
		this.domElementContainer = this.getComponent('domElementContainer').getEl().dom;
		this.domElementContainer.appendChild(this.renderer.domElement);
		this.domElement = this.domElementContainer.firstChild;
		this.setSize(this.getWidth(), this.getHeight());
		this.startAnimation();
		
		this.addEvents({
			"animate" : true,
			"threejsready" : true
		});
		
		return this;
		
	},
	enableControls: function (parameters) {
		
		this.controls = new THREE.NoClipControls(this.camera, this.domElement);
		this.scene.add(this.controls.getObject());
		Ext.apply(this.controls, parameters);
		
		return this;
		
	},
	startAnimation: function () {
		
		var self, delta;
		
		self = this;
		
		function animate () {
			
			delta = self.clock.getDelta();
            
            requestAnimationFrame(animate);
			if (self.controls) {
				self.controls.update(delta);
			}
			self.fireEvent("animate", delta);
            self.renderer.render(self.scene, self.camera);
            
        }
        
		self.fireEvent("threejsready");
        animate();
		
	},
	setRenderer: function (renderer) {
		
		this.renderer = renderer;
		this.setSize(this.getWidth(), this.getHeight());
		this.startAnimation();
		
		return this;
		
	},
	setCamera: function (camera) {
		
		this.camera = camera;
		this.setSize(this.getWidth(), this.getHeight());
		
		return this;
		
	},
	setScene: function (scene) {
		
		this.scene = scene;
		
		return this;
		
	},
	listeners: {
		resize: function (window, width, height) {
			
			this.setSize(width, height);
			
		}
	},
	setSize: function (width, height) {
		
		if (this.renderer) {
			this.renderer.setSize(width, height);
		}
		
		if (this.camera) {
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
		}
		
	}
});