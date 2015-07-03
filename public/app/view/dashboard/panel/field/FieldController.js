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
		this.distanceOutsideField = {
			width: Field.constants.GOAL_AREA_LENGTH,
			height: Field.constants.GOAL_AREA_LENGTH
		};
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

	/**
	 *
	 * @param context
	 * @param width
	 * @returns {number}
	 */
	SIToScreenWidth: function (context, width) {
		var canvas = context.canvas;
		return width * (canvas.width / (Field.constants.FIELD_LENGTH + (this.distanceOutsideField.width * 2)));
	},

	/**
	 *
	 * @param context
	 * @param height
	 * @returns {number}
	 */
	SIToScreenHeight: function (context, height) {
		var canvas = context.canvas;
		return height * (canvas.height / (Field.constants.FIELD_WIDTH + (this.distanceOutsideField.height * 2)));
	},

	/**
	 * Converts a world coordinate to its respective screen coordinate by multiplying the original position by the
	 * ratio of the field to the canvas size. The offset of the canvas is added to this position so the origin begins
	 * at the center when drawing.
	 *
	 * @param context The canvas context.
	 * @param position The position being converted.
	 * @returns {vec2} The new screen position.
	 */
	worldToScreen: function (context, position) {
		var canvas = context.canvas;
		var width = this.SIToScreenWidth(context, 1);
		var height = this.SIToScreenHeight(context, 1);
		return vec2.fromValues(position[0] * width + (canvas.width * 0.5), -position[1] * height + (canvas.height * 0.5));
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
	 * Draws a rectangle on the canvas given a position, width and height.
	 *
	 * @param context The canvas context.
	 * @param position The position of the rectangle.
	 * @param width The width of the rectangle.
	 * @param height The height of the rectangle.
	 * @param fillColor The color of the rectangle.
	 * @param [strokeColor] An optional stroke color.
	 * @param [lineWidth] An optional line width.
	 */
	drawRectangle: function (context, position, width, height, fillColor, strokeColor, lineWidth) {
		context.rect(position[0], position[1], width, height);
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
	 * Draws the components that make up a field given the canvas context.
	 *
	 * @param context The canvas context.
	 */
	drawField: function (context) {
		var color = this.fieldLine.color;
		var fieldLineWidth = this.fieldLine.width;
		// Draw each component of the field.
		this.drawFieldBorder(context, color, fieldLineWidth);
		this.drawGoalArea(context, color, fieldLineWidth);
		this.drawCentreCircle(context, color, fieldLineWidth);
		this.drawCentreLine(context, color, fieldLineWidth);
	},

	/**
	 * Draws the top, right, bottom and left field border lines on the canvas using a rectangle.
	 *
	 * @param context The canvas context.
	 * @param color The color of the field lines.
	 * @param fieldLineWidth The width of the field lines.
	 */
	drawFieldBorder: function (context, color, fieldLineWidth) {
		var distanceOutsideField = {
			width: this.SIToScreenWidth(context, this.distanceOutsideField.width),
			height: this.SIToScreenHeight(context, this.distanceOutsideField.height)
		};
		var position = vec2.fromValues(distanceOutsideField.width, distanceOutsideField.height);
		var width = this.SIToScreenWidth(context, Field.constants.FIELD_LENGTH);
		var height = this.SIToScreenHeight(context, Field.constants.FIELD_WIDTH);
		this.drawRectangle(context, position, width, height, 'transparent', color, fieldLineWidth);
	},

	drawGoalArea: function (context, color, fieldLineWidth) {
		this.drawLeftGoalArea(context, color, fieldLineWidth);
		this.drawRightGoalArea(context, color, fieldLineWidth);
	},

	drawLeftGoalArea: function (context, color, fieldLineWidth) {

		//var blueGoalArea = buildRectangle(-halfLength, -Field.constants.GOAL_AREA_WIDTH * 0.5, Field.constants.GOAL_AREA_LENGTH, Field.constants.GOAL_AREA_WIDTH);
		//var yellowGoalArea = buildRectangle(halfLength - Field.constants.GOAL_AREA_LENGTH, -Field.constants.GOAL_AREA_WIDTH * 0.5, Field.constants.GOAL_AREA_LENGTH, Field.constants.GOAL_AREA_WIDTH);
	},

	drawRightGoalArea: function (context, color, fieldLineWidth) {

	},

	/**
	 * Draws the centre circle for the field given the canvas context.
	 *
	 * @param context The canvas conext.
	 * @param color The color of the centre circle.
	 * @param fieldLineWidth The thickness of the circle.
	 */
	drawCentreCircle: function (context, color, fieldLineWidth) {
		// Get the screen position of the origin.
		var position = this.worldToScreen(context, vec2.create());
		// Get the radius of the center circle.
		var radius = Field.constants.CENTER_CIRCLE_DIAMETER * 0.5;
		// Calculate the radius x and y component by converting from SI units to screen coordinates.
		var radiusX = this.SIToScreenWidth(context, radius);
		var radiusY = this.SIToScreenHeight(context, radius);
		// Draw the ellipse with the specified position and radius components.
		this.drawEllipse(context, position, radiusX, radiusY, 'transparent', color, fieldLineWidth);
	},

	/**
	 * Draws the centre vertical line of the field given the canvas context.
	 *
	 * @param context The canvas context.
	 * @param color The color of the centre line.
	 * @param fieldLineWidth The width of the centre line.
	 */
	drawCentreLine: function (context, color, fieldLineWidth) {
		var distanceOutsideField = {
			width: this.SIToScreenWidth(context, this.distanceOutsideField.width),
			height: this.SIToScreenHeight(context, this.distanceOutsideField.height)
		};
		var width = this.SIToScreenWidth(context, Field.constants.FIELD_LENGTH);
		var height = this.SIToScreenHeight(context, Field.constants.FIELD_WIDTH);
		var origin = vec2.fromValues(distanceOutsideField.width + width * 0.5, distanceOutsideField.height);
		var target = vec2.fromValues(origin[0], origin[1] + height);
		this.drawLine(context, origin, target, color, fieldLineWidth);
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
		var screenPosition = this.worldToScreen(context, position);
		var screenHeading = this.worldToScreen(context, robotHeading);
		// Draw a circle representing the robot using its screen coordinates.
		this.drawCircle(context, screenPosition, this.robot.radius, 'black', 'gray');
		this.drawLine(context, screenPosition, screenHeading, 'black');
	},

	drawBall: function (context, position) {
		// Get the screen position of the ball and draw the circle.
		var screenPosition = this.worldToScreen(context, position);
		this.drawCircle(context, screenPosition, this.ball.radius, 'orange', 'red');
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
	}

});
