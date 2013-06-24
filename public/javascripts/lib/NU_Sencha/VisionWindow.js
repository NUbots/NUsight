Ext.define('Ext.ux.NU.VisionWindow', {
	extend : 'Ext.ux.NU.DisplayWindow',
	alias : ['widget.nu.vision_window'],
	autoShow: true,
	title: 'Vision Display',
	width: 410,
	height: 295,
	canvas: null,
	context: null,
	displayClassifiedImage: true,
	displayFieldObjects: true,
	resizable: {
		preserveRatio: true
	},
	lastDraw: 0,
	layout: 'border',
	items: [{
		xtype: 'component',
		region: 'center',
		width: 320,
		height: 240,
		autoEl: {
			tag: 'canvas',
			width: 320,
			height: 240
		},
		itemId: 'canvas',
		layout: 'fit'
	}, {
		xtype: 'panel',
		region: 'east',
		width: 80,
		itemId: 'varDisplay'
	}],
	constructor: function () {
		
		NU.Network.on('vision', Ext.bind(this.onVision, this));
		
		this.callParent(arguments);
		
	},
	listeners: {
		afterRender: function () {
			
			this.varDisplay = this.down('#varDisplay');
			this.canvas = this.down('#canvas');
			this.context = this.canvas.el.dom.getContext('2d');
			//this.context.translate(0.5, 0.5); // HACK: stops antialiasing on pixel width lines
			
		},
		resize: function (obj, width, height) {
			
			this.canvas.setWidth(obj.body.getWidth());
			this.canvas.setHeight(obj.body.getHeight());
			
		}
	},
	onVision: function (robotIP, api_message) {
		
		if (robotIP != this.robotIP) { // TODO: delete
			return;
		}
		
		if (Date.now() <= this.lastDraw + 3000)
		{
			return;
		}
		this.lastDraw = Date.now();
		
		if (this.displayClassifiedImage) {
			this.drawClassifiedImage(api_message.vision.classified_image);
		}
		
		if (this.displayFieldObjects) {
			this.drawFieldObjects(api_message.vision.field_object);
		}
	
	},
	drawClassifiedImage: function (api_classified_image) {
		
		var api_segments  = api_classified_image.segment;
		var imageData = this.context.createImageData(320, 240);
		var pixels = imageData.data;
		
		for (var i = 0; i < 320 * 240; i++)
		{
			pixels[4 * i + 0] = 0;
			pixels[4 * i + 1] = 0;
			pixels[4 * i + 2] = 0;
			pixels[4 * i + 3] = 255;
		}
		
		for (var i = 0; i < api_segments.length; i++) {
			var segment = api_segments[i];
			var colour = this.segmentColourToRGB2(segment.colour);
			
			if (segment.start_x == segment.end_x) {
				
				// vertical lines
				for (var y = segment.start_y; y <= segment.end_y; y++)
				{
					pixels[(4 * 320 * y) + (4 * segment.start_x + 0)] = colour[0];
					pixels[(4 * 320 * y) + (4 * segment.start_x + 1)] = colour[1];
					pixels[(4 * 320 * y) + (4 * segment.start_x + 2)] = colour[2];
					pixels[(4 * 320 * y) + (4 * segment.start_x + 3)] = colour[3];
				}
				
			} else if (segment.start_y == segment.end_y) {
				
				// horizontal lines
				for (var x = segment.start_x; x <= segment.end_x; x++)
				{
					pixels[(4 * 320 * segment.start_y) + (4 * x + 0)] = colour[0];
					pixels[(4 * 320 * segment.start_y) + (4 * x + 1)] = colour[1];
					pixels[(4 * 320 * segment.start_y) + (4 * x + 2)] = colour[2];
					pixels[(4 * 320 * segment.start_y) + (4 * x + 3)] = colour[3];
				}
			}
			else {
				console.log('unsupported diagonal classified image segment');
			}
			//segment.start_x, segment.start_y
			//segment.end_x, segment.end_y
		}
		
		imageData.data = pixels;
		this.context.putImageData(imageData, 0, 0);
		
	},
	drawFieldObjects: function (field_objects) {
		
		
		var api_ball = field_objects[0];
		var api_goals = [];
		var api_obstacles = [];
		
		for (var i = 0; i < field_objects.length; i++) {
			var obj = field_objects[i];
			if (obj.visible) {
				//console.log(obj.name);
				if (obj.name == "Unknown Yellow Post"
					||
					obj.name == "Left Yellow Post"
					||
					obj.name == "Right Yellow Post"
				) {
					api_goals.push(obj); // TODO: mark type
				} else if (obj.name == "Unknown Obstacle") {
					api_obstacles.push(obj);
				}
			}
		}
		
		if (api_ball.visible) {
			this.context.beginPath();
			
			this.context.shadowColor = 'black';
			this.context.shadowBlur = 5;
			this.context.shadowOffsetX = 0;
			this.context.shadowOffsetY = 0;
			
			this.context.arc(api_ball.screen_x, api_ball.screen_y, api_ball.radius, 0, Math.PI*2, true);
			this.context.closePath();
			//this.context.fillStyle = "rgba(255, 0, 0, 1)";//"rgba(255, 85, 0, 0.5)";
			//this.context.fill();
			this.context.strokeStyle = "rgba(255, 255, 255, 1)";
			this.context.lineWidth = 2;
			this.context.lineWidth = 2;
			this.context.stroke();
			
			var position = api_ball.measured_relative_position;
			this.varDisplay.update(position[0] + "<br>" + position[1] + "<br>" + position[2]);
		};
		
		Ext.each(api_goals, function (goal) {
			
			var topLeftX = goal.screen_x - (goal.width / 2);
			var topLeftY = goal.screen_y - goal.height;
			
			this.context.beginPath();
			
			this.context.moveTo(topLeftX, topLeftY);
			this.context.lineTo(topLeftX + goal.width, topLeftY);
			this.context.lineTo(topLeftX + goal.width, topLeftY + goal.height);
			this.context.lineTo(topLeftX, topLeftY + goal.height);
			this.context.closePath();
			
			this.context.shadowColor = 'black';
			this.context.shadowBlur = 5;
			this.context.shadowOffsetX = 0;
			this.context.shadowOffsetY = 0;
			
			this.context.fillStyle = "rgba(255, 242, 0, 0.2)";
			this.context.fill();
			
			this.context.strokeStyle = "rgba(255, 242, 0, 1)";
			this.context.lineWidth = 2;
			this.context.lineWidth = 2;
			
			this.context.stroke();
			
		}, this);
		
		Ext.each(api_obstacles, function (obstacle) {
			
			var topLeftX = obstacle.screen_x - (obstacle.width / 2);
			var topLeftY = 0;//obstacle.screen_y - obstacle.height; // TODO: waiting for shannon to fix height on obstacles
			
			this.context.beginPath();
			
			this.context.moveTo(topLeftX, topLeftY);
			this.context.lineTo(topLeftX + obstacle.width, topLeftY);
			this.context.lineTo(topLeftX + obstacle.width, obstacle.screen_y);
			this.context.lineTo(topLeftX, obstacle.screen_y);
			this.context.closePath();
			
			this.context.shadowColor = 'black';
			this.context.shadowBlur = 5;
			this.context.shadowOffsetX = 0;
			this.context.shadowOffsetY = 0;
			
			this.context.fillStyle = "rgba(255, 255, 255, 0.2)";
			this.context.fill();
			
			this.context.strokeStyle = "rgba(255, 255, 255, 0.5)";
			this.context.lineWidth = 2;
			this.context.lineWidth = 2;
			
			this.context.stroke();
			
		}, this);
		
	},
	segmentColourToRGB: function (colourType)
	{
		var colour;
		
		switch (colourType)
		{
		case 0:
			colour = "rgba(0,0,0,1)";
			break;
		case 1:
			colour = "rgba(255,255,255,1)";
			break;
		case 2:
			colour = "rgba(0,255,0,1)";
			break;
		case 3:
			colour = "rgba(168,168,168,1)";
			break;
		case 4:
			colour = "rgba(255,20,127,1)";
			break;
		case 5:
			colour = "rgba(255,128,128,1)";
			break;
		case 6:
			colour = "rgba(255,165,0,1)";
			break;
		case 7:
			colour = "rgba(238,219,83,1)";
			break;
		case 8:
			colour = "rgba(255,255,0,1)";
			break;
		case 9:
			colour = "rgba(0,0,255,1)";
			break;
		case 10:
			colour = "rgba(25,25,112,1)";
			break;
		default:
			colour = "rgba(0,0,0,1)";
		}
		return colour;
	},
	segmentColourToRGB2: function (colourType)
	{
		var colour;
		
		switch (colourType)
		{
		case 0:
			colour = [0,0,0,255];
			break;
		case 1:
			colour = [255,255,255,255];
			break;
		case 2:
			colour = [0,255,0,255];
			break;
		case 3:
			colour = [168,168,168,255];
			break;
		case 4:
			colour = [255,20,127,255];
			break;
		case 5:
			colour = [255,128,128,255];
			break;
		case 6:
			colour = [255,165,0,255];
			break;
		case 7:
			colour = [238,219,83,255];
			break;
		case 8:
			colour = [255,255,0,255];
			break;
		case 9:
			colour = [0,0,255,255];
			break;
		case 10:
			colour = [25,25,112,255];
			break;
		default:
			colour = [0,0,0,255];
		}
		return colour;
	},
	code: function () {	
		this.context.fillStyle="black";
		this.context.fillRect(0, 0, 320, 240);
		
		var api_classified_image = api_message.vision.classified_image;
		var api_segments  = api_classified_image.segment;
		for (var i = 0; i < api_segments.length; i++) {
			var segment = api_segments[i];
			var colour;
			
			// TODO: make this less horrific
			switch (segment.colour)
			{
			case 0:
				colour = "rgba(0,0,0,1)";
				break;
			case 1:
				colour = "rgba(255,255,255,1)";
				break;
			case 2:
				colour = "rgba(0,255,0,1)";
				break;
			case 3:
				colour = "rgba(168,168,168,1)";
				break;
			case 4:
				colour = "rgba(255,20,127,1)";
				break;
			case 5:
				colour = "rgba(255,128,128,1)";
				break;
			case 6:
				colour = "rgba(255,165,0,1)";
				break;
			case 7:
				colour = "rgba(238,219,83,1)";
				break;
			case 8:
				colour = "rgba(255,255,0,1)";
				break;
			case 9:
				colour = "rgba(0,0,255,1)";
				break;
			case 10:
				colour = "rgba(25,25,112,1)";
				break;
			default:
				colour = "rgba(0,0,0,1)";
			}
			
			//this.context.strokeStyle = "rgba(" + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ", " + Math.round(Math.random() * 255) + ", 0.5)";
			
			this.context.beginPath();
			this.context.moveTo(segment.start_x, segment.start_y);
			this.context.lineTo(segment.end_x, segment.end_y);
			this.context.lineWidth = 1;
			this.context.strokeStyle = colour;
			this.context.stroke();
		}
		
		var api_ball = api_message.vision.field_object[0];
		var api_goals = [];
		var api_obstacles = [];
		
		var field_objects = api_message.vision.field_object;
		for (var i = 0; i < field_objects.length; i++) {
			var obj = field_objects[i];
			if (obj.visible) {
				//console.log(obj.name);
				if (obj.name == "Unknown Yellow Post"
					||
					obj.name == "Left Yellow Post"
					||
					obj.name == "Right Yellow Post"
				) {
					api_goals.push(obj); // TODO: mark type
				} else if (obj.name == "Unknown Obstacle") {
					api_obstacles.push(obj);
				}
			}
		}
		
		if (api_ball.visible) {
			this.context.beginPath();
			
			this.context.shadowColor = 'black';
			this.context.shadowBlur = 5;
			this.context.shadowOffsetX = 0;
			this.context.shadowOffsetY = 0;
			
			this.context.arc(api_ball.screen_x, api_ball.screen_y, api_ball.radius, 0, Math.PI*2, true);
			this.context.closePath();
			//this.context.fillStyle = "rgba(255, 0, 0, 1)";//"rgba(255, 85, 0, 0.5)";
			//this.context.fill();
			this.context.strokeStyle = "rgba(255, 255, 255, 1)";
			this.context.lineWidth = 2;
			this.context.lineWidth = 2;
			this.context.stroke();
		};
		
		Ext.each(api_goals, function (goal) {
			
			var topLeftX = goal.screen_x - (goal.width / 2);
			var topLeftY = goal.screen_y - goal.height;
			
			this.context.beginPath();
			
			this.context.moveTo(topLeftX, topLeftY);
			this.context.lineTo(topLeftX + goal.width, topLeftY);
			this.context.lineTo(topLeftX + goal.width, topLeftY + goal.height);
			this.context.lineTo(topLeftX, topLeftY + goal.height);
			this.context.closePath();
			
			this.context.shadowColor = 'black';
			this.context.shadowBlur = 5;
			this.context.shadowOffsetX = 0;
			this.context.shadowOffsetY = 0;
			
			this.context.fillStyle = "rgba(255, 242, 0, 0.2)";
			this.context.fill();
			
			this.context.strokeStyle = "rgba(255, 242, 0, 1)";
			this.context.lineWidth = 2;
			this.context.lineWidth = 2;
			
			this.context.stroke();
			
		}, this);
		
		Ext.each(api_obstacles, function (obstacle) {
			
			var topLeftX = obstacle.screen_x - (obstacle.width / 2);
			var topLeftY = 0;//obstacle.screen_y - obstacle.height; // TODO: waiting for shannon to fix height on obstacles
			
			this.context.beginPath();
			
			this.context.moveTo(topLeftX, topLeftY);
			this.context.lineTo(topLeftX + obstacle.width, topLeftY);
			this.context.lineTo(topLeftX + obstacle.width, obstacle.screen_y);
			this.context.lineTo(topLeftX, obstacle.screen_y);
			this.context.closePath();
			
			this.context.shadowColor = 'black';
			this.context.shadowBlur = 5;
			this.context.shadowOffsetX = 0;
			this.context.shadowOffsetY = 0;
			
			this.context.fillStyle = "rgba(255, 255, 255, 0.2)";
			this.context.fill();
			
			this.context.strokeStyle = "rgba(255, 255, 255, 0.5)";
			this.context.lineWidth = 2;
			this.context.lineWidth = 2;
			
			this.context.stroke();
			
		}, this);
		
	}
});