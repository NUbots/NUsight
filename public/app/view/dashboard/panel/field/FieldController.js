/**
 * @author: Monica Olejniczak
 */
Ext.define('NU.view.dashboard.panel.field.FieldController', {
	extend: 'Ext.app.ViewController',
	alias: 'controller.DashboardPanelField',
	init: function () {
		var view = this.getView();
		this.canvas = view.lookupReference('canvas');
		this.context = null;
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
		var canvas = this.canvas.getEl().dom;
		canvas.width = width;
		canvas.height = height;
	},

	/**
	 * This method is triggered when an Overview packet is sent to this view.
	 *
	 * @param robotPosition The position of the robot.
	 * @param robotPositionCovariance The certainty of the robot position.
	 * @param robotHeading The direction the robot is facing.
	 * @param ballPosition The position of the ball.
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
			// Draw the robot and the ball on the field.
			this.drawRobot(context, robotPosition, robotHeading);
			this.drawBall(context, ballPosition, robotPosition, robotHeading);
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
	 */
	drawCircle: function (context, position, radius, fillColor, strokeColor) {
		context.beginPath();
		context.arc(position[0], position[1], radius, 0, Math.PI * 2);
		context.fillStyle = fillColor;
		context.lineWidth = 1;
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
	 */
	drawLine: function (context, origin, target, strokeColor) {
		context.beginPath();
		context.moveTo(origin[0], origin[1]);
		context.lineTo(target[0], target[1]);
		context.strokeStyle = strokeColor;
		context.lineWidth = 2;
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

	drawBall: function (context, position, robotPosition, robotHeading) {
		// Get the screen position of the ball.
		var screenPosition = this.worldToScreen(this.localToWorld(position, robotPosition));
		debugger;
		this.drawCircle(context, screenPosition, this.ball.radius, 'orange', 'red');
	}

});
