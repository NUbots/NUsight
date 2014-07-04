Ext.define('NU.controller.LayeredCanvas', {
	extend: 'Deft.mvc.ViewController',
	config: {
		layers: null,
		container: null,
		canvasWidth: 320,
		canvasHeight: 240,
		imageWidth: 320,
		imageHeight: 240
	},
	control: {
		'view': {
			boxready: function (view, width, height) {
				this.autoSize(width, height);
			},
			resize: function (view, width, height) {
				this.autoSize(width, height);
			}
		}
	},
	init: function () {
		this.setLayers([]);
		this.setContainer(this.getView().getEl());
//		this.add('default');
	},
	autoSize: function (width, height) {
		if (width === undefined) {
			width = this.getView().getWidth();
		}
		if (height === undefined) {
			height = this.getView().getHeight();
		}

		if (width / height > this.getCanvasWidth() / this.getCanvasHeight()) {
			// resize to height
			this.setImageSize('auto', height + 'px');
		} else {
			// resize to width
			this.setImageSize(width + 'px', 'auto');
		}
	},
	add: function (name, group) {
		var layers = this.getLayers();
		if (this.get(name) === null) {
			var canvas = new Ext.Element(document.createElement('canvas'));
			canvas.setStyle({
				zIndex: layers.length,
				position: 'absolute',
				top: 0,
				left: 0
			});
			canvas.set({
				width: this.getCanvasWidth(),
				height: this.getCanvasHeight()
			});
			var container = this.getContainer();
			container.appendChild(canvas);
			var layer = {
				name: name,
				group: group,
				canvas: canvas,
				context: canvas.dom.getContext('2d'),
				hidden: true
			};
			layers.push(layer);
			this.autoSize();
			return layer;
		}
		return null;
	},
	setImageSize: function (width, height) {
		var layers = this.getLayers();
		layers.forEach(function (layer) {
			var canvas = layer.canvas;
			canvas.setStyle({
				width: width,
				height: height
			});
			// TODO: do once?
			this.setImageWidth(canvas.getWidth());
			this.setImageHeight(canvas.getHeight());
		}, this);
	},
	setCanvasSize: function (width, height) {
		var layers = this.getLayers();
		layers.forEach(function (layer) {
			var canvas = layer.canvas;
			canvas.set({
				width: width,
				height: height
			});
		}, this);
		this.setCanvasWidth(width);
		this.setCanvasHeight(height);
		this.autoSize();
	},
	remove: function (name) {
		var layers = this.getLayers();
		var newLayers = [];
		layers.forEach(function (layer) {
			if (layer.name !== name) {
				newLayers.push(layer);
			}
		}, this);
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
	clear: function (name) {
		var context = this.getContext(name);
		context.clearRect(0, 0, this.getCanvasWidth(), this.getCanvasHeight());
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
