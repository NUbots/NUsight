/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.dashboard.panel.field.FieldController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.DashboardPanelField',
	init: function () {
		var view = this.getView();
		//this.field = view;
		this.canvas = view.lookupReference('canvas');
		this.context = null;
		this.fieldLine = {
			color: 'white',
			width: 3
		};
		this.robot = {
			radius: 6
		};
		this.ball = {
			radius: 4
		};
	},

	/**
	 * This event is triggered when the container and all of its children have been rendered. This method sets the
	 * canvas context so shapes can be drawn.
	 */
	onAfterRender: function () {
		this.context = this.canvas.getEl().dom.getContext('2d');
	},

	/**
	 * An event triggered when the view is resized. This method modifies the canvas width and height so it can render
	 * shapes correctly.
	 *
	 * @param component The view that was resized.
	 * @param width The new width of the component.
	 * @param height The new height of the component.
	 */
	onResize: function (component, width, height) {
		this.setSize(this.canvas.getEl().dom, width, height);
	},

	/**
	 * Set the size of the canvas to the specified width and height.
	 *
	 * @param canvas The canvas dom element.
	 * @param width The new width of the canvas.
	 * @param height The new height of the canvas.
	 */
	setSize: function (canvas, width, height) {
		canvas.width = width;
		canvas.height = height;
	},

	drawField: function (context) {
		var canvas = context.canvas;
		var width = canvas.width;
		var height = canvas.height;
		this.drawCentreCircle(context, width, height);
		this.drawCentreLine(context, width, height);
	},


	drawCentreCircle: function (context, width, height) {
		var position = this.worldToScreen(vec2.create());
		var radius = (Field.constants.CENTER_CIRCLE_DIAMETER * 0.5);
		var radiusX = Math.round(radius  * (width / Field.constants.FIELD_LENGTH));
		var radiusY = Math.round(radius * (height / Field.constants.FIELD_WIDTH));
		this.drawEllipse(context, position, radiusX, radiusY, 'transparent', this.fieldLine.color, this.fieldLine.width);
	},

	/**
	 * A method that draws the centre vertical line of the field given the canvas context, width, height and line
	 * width.
	 *
	 * @param context The canvas context.
	 * @param width The width of the canvas.
	 * @param height The height of the canvas.
	 * @param lineWidth The width of the line.
	 */
	drawCentreLine: function (context, width, height, lineWidth) {
		this.drawLine(context, vec2.fromValues(width * 0.5, 0), vec2.fromValues(width * 0.5, height), this.fieldLine.color, this.fieldLine.width);
	},

	/**
	 * This method is triggered when an Overview packet is sent to this view.
	 *
	 * @param robotPosition The position of the robot in world space.
	 * @param robotPositionCovariance The certainty of the robot position.
	 * @param robotHeading The direction the robot is facing in local space.
	 * @param ballPosition The position of the ball in world space.
	 */
	onUpdate: function (robotPosition, robotPositionCovariance, robotHeading, ballPosition) {
		// Get the context and check if it exists.
		var context = this.context;
		if (context) {
			// Get the canvas and clear what was drawn in the previous frame.
			var canvas = this.canvas;
			this.context.clearRect(0, 0, canvas.getWidth(), canvas.getHeight());
			// Convert the robot position, robot heading and ball position to vectors.
			robotPosition = vec2.fromValues(robotPosition.x, robotPosition.y);
			robotHeading = vec2.fromValues(robotHeading.x, robotHeading.y);
			ballPosition = vec2.fromValues(ballPosition.x, ballPosition.y);
			// Convert the robot heading to world space.
			robotHeading = this.localToWorld(robotPosition, robotHeading);
			// Draw the field.
			this.drawField(context);
			// Draw the robot and the ball on the field.
			this.drawRobot(context, robotPosition, robotHeading);
			this.drawBall(context, ballPosition);
		}
	},

	/**
	 * Converts a world coordinate to its respective screen coordinate by multiplying the original position by the
	 * ratio of the field to the canvas size. The offset of the canvas is added to this position so the origin begins
	 * at the center when drawing.
	 *
	 * @param position The position being converted.
	 * @returns {vec2} The new screen position.
	 */
	worldToScreen: function (position) {
		var canvas = this.canvas;
		var width = canvas.getWidth();
		var height = canvas.getHeight();
		var fieldWidth = Math.round(width / Field.constants.FIELD_LENGTH);
		var fieldHeight = Math.round(height / Field.constants.FIELD_WIDTH);
		return vec2.fromValues(position[0] * fieldWidth + (width * 0.5), -position[1] * fieldHeight + (height * 0.5));
	},

	/**
	 * Converts a local position to world position.
	 *
	 * @param local The local position.
	 * @param world The world position to base the local position off.
	 * @returns {vec2} The new world position.
	 */
	localToWorld: function (local, world) {
		var out = vec2.create();
		vec2.add(out, local, world);
		return out;
	},

	/**
	 * Draws a circle in the specified canvas context using a screen position, radius and fill color.
	 *
	 * @param context The canvas context.
	 * @param position The position to draw the circle on.
	 * @param radius The radius of the circle.
	 * @param fillColor The color of the circle.
	 * @param [strokeColor] An optional stroke color.
	 * @param [lineWidth] An optional line width.
	 */
	drawCircle: function (context, position, radius, fillColor, strokeColor, lineWidth) {
		this.drawEllipse(context, position, radius, radius, fillColor, strokeColor, lineWidth);
	},

	/**
	 * Draws an ellipse in the specified canvas context using a screen position, radius and fill color.
	 *
	 * @param context The canvas context.
	 * @param position The position to draw the ellipse on.
	 * @param radiusX The radius of the ellipse in the x direction.
	 * @param radiusY The radius of teh sllipse in the y direction.
	 * @param fillColor The color of the ellipse.
	 * @param [strokeColor] An optional stroke color.
	 * @param [lineWidth] An optional line width.
	 */
	drawEllipse: function (context, position, radiusX, radiusY, fillColor, strokeColor, lineWidth) {
		context.beginPath();
		context.ellipse(position[0], position[1], radiusX, radiusY, 0, 0, Math.PI * 2);
		context.fillStyle = fillColor;
		context.lineWidth = lineWidth || 1;
		context.fill();
		if (strokeColor) {
			context.strokeStyle = strokeColor;
			context.stroke();
		}
	},

	/**
	 * Draws a line in the specified canvas context using a screen origin and target.
	 *
	 * @param context The canvas context.
	 * @param origin The point to begin the line at.
	 * @param target The point to end the line at.
	 * @param strokeColor The color of the line.
	 * @param [lineWidth] The width of the line.
	 */
	drawLine: function (context, origin, target, strokeColor, lineWidth) {
		context.beginPath();
		context.moveTo(origin[0], origin[1]);
		context.lineTo(target[0], target[1]);
		context.strokeStyle = strokeColor;
		context.lineWidth = lineWidth || 2;
		context.stroke();
	},

	/**
	 * Draws a robot position and its heading arrow on the field.
	 *
	 * @param context The canvas context.
	 * @param position The world position of the robot.
	 * @param robotHeading The direction the robot is facing.
	 */
	drawRobot: function (context, position, robotHeading) {
		// Get the screen position and heading of the robot.
		var screenPosition = this.worldToScreen(position);
		var screenHeading = this.worldToScreen(robotHeading);
		// Draw a circle representing the robot using its screen coordinates.
		this.drawCircle(context, screenPosition, this.robot.radius, 'black', 'gray');
		this.drawLine(context, screenPosition, screenHeading, 'black');
	},

	drawBall: function (context, position) {
		// Get the screen position of the ball and draw the circle.
		var screenPosition = this.worldToScreen(position);
		this.drawCircle(context, screenPosition, this.ball.radius, 'orange', 'red');
	}

});
