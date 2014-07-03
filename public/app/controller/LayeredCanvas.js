Ext.define('NU.controller.LayeredCanvas', {
	extend: 'Deft.mvc.ViewController',
	config: {
		layers: null,
		container: null,
		width: 320,
		height: 240
	},
	init: function () {
		this.setLayers([]);
		this.setContainer(this.getView().getEl());
		this.add('default');
	},
	add: function (name, group) {
		var layers = this.getLayers();
		if (this.get(name) === null) {
			var canvas = new Ext.Element(document.createElement('canvas'));
			canvas.setStyle({
				zIndex: layers.length,
				position: 'absolute'
			});
			canvas.set({
				width: this.getWidth(),
				height: this.getHeight()
			});
			var container = this.getContainer();
			container.appendChild(canvas);
			layers.push({
				name: name,
				group: group,
				canvas: canvas,
				context: canvas.dom.getContext('2d'),
				hidden: true
			});
			return canvas;
		}
		return null;
	},
	remove: function (name) {
		var layers = this.getLayers();
		var newLayers = [];
		layers.forEach(function (layer) {
			if (layer.name !== name) {
				newLayers.push(layer);
			}
		});
		this.setLayers(newLayers);
	},
	hideAll: function () {
		var layers = this.getLayers();
		layers.forEach(function (layer) {
			this.hide(layer);
		}, this);
	},
	showAll: function () {
		var layers = this.getLayers();
		layers.forEach(function (layer) {
			this.show(layer);
		}, this);
	},
	hide: function (name) {
		var layer = typeof name !== "string" ? name : this.get(name);
		layer.canvas.setStyle({
			display: 'none'
		});
		layer.hidden = true;
	},
	show: function (name) {
		var layer = typeof name !== "string" ? name : this.get(name);
		layer.canvas.setStyle({
			display: 'block'
		});
		layer.hidden = false;
	},
	showGroup: function (name) {
		var layers = this.getLayers();
		layers.forEach(function (layer) {
			if (layer.group === name) {
				this.show(layer);
			}
		}, this);
	},
	hideGroup: function (name) {
		var layers = this.getLayers();
		layers.forEach(function (layer) {
			if (layer.group === name) {
				this.hide(layer);
			}
		}, this);
	},
	get: function (name) {
		var result = null;
		var layers = this.getLayers();
		layers.forEach(function (layer) {
			if (layer.name === name) {
				result = layer;
				return false;
			}
		});
		return result;
	},
	getContext: function (name) {
		return this.get(name).context;
	}
});
