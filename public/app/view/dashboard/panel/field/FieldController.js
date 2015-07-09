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
		var distance = 0.5;
		this.distanceOutsideField = {
			width: Field.constants.GOAL_AREA_LENGTH + distance,
			height: Field.constants.GOAL_AREA_LENGTH + distance
		};
		this.fieldLine = {
			color: 'white',
			width: 2
		};
		this.robot = {
			color: 'black',
			radius: 6
		};
		this.ball = {
			radius: 4
		};
		this.pathPlan = {
			color: '#ff7fff',
			width: 2
		}
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
		this.drawField(this.context);
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
	 * Converts a SI unit to its respective screen width.
	 *
	 * @param context The canvas context.
	 * @param width The width being scaled to the screen width.
	 * @returns {number}
	 */
	SIToScreenWidth: function (context, width) {
		var canvas = context.canvas;
		return width * (canvas.width / (Field.constants.FIELD_LENGTH + (this.distanceOutsideField.width * 2)));
	},

	/**
	 * Converts a SI unit to its respective screen height.
	 *
	 * @param context The canvas context.
	 * @param height The height being scaled to the screen height.
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
		context.beginPath();
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
		var field = {
			width: this.SIToScreenWidth(context, Field.constants.FIELD_LENGTH),
			height: this.SIToScreenHeight(context, Field.constants.FIELD_WIDTH)
		};
		var distanceOutsideField = {
			width: this.SIToScreenWidth(context, this.distanceOutsideField.width),
			height: this.SIToScreenHeight(context, this.distanceOutsideField.height)
		};
		// Draw each component of the field.
		this.drawGoalBoxes(context, field, distanceOutsideField, fieldLineWidth);
		this.drawFieldBorder(context, field, distanceOutsideField, color, fieldLineWidth);
		this.drawGoalArea(context, field, distanceOutsideField, color, fieldLineWidth);
		this.drawCentreCircle(context, color, fieldLineWidth);
		this.drawCentreLine(context, field, distanceOutsideField, color, fieldLineWidth);
	},

	/**
	 * Draws the left and right goal boxes for field on the canvas.
	 *
	 * @param context The canvas context.
	 * @param field The dimensions of the field in screen units.
	 * @param distanceOutsideField The distance outside of the field in screen units.
	 * @param fieldLineWidth The line width of the goal boxes.
	 */
	drawGoalBoxes: function (context, field, distanceOutsideField, fieldLineWidth) {
		var width = this.SIToScreenWidth(context, Field.constants.GOAL_DEPTH);
		var height = this.SIToScreenHeight(context, Field.constants.GOAL_WIDTH);
		var y = ((field.height - height) * 0.5) + distanceOutsideField.height;
		this.drawRectangle(context, vec2.fromValues(distanceOutsideField.width - width, y), width, height, 'transparent', 'blue', fieldLineWidth);
		this.drawRectangle(context, vec2.fromValues(distanceOutsideField.width + field.width, y), width, height, 'transparent', 'yellow', fieldLineWidth);
	},

	/**
	 * Draws the top, right, bottom and left field border lines on the canvas using a rectangle.
	 *
	 * @param context The canvas context.
	 * @param field The dimensions of the field in screen units.
	 * @param distanceOutsideField The distance outside of the field in screen units.
	 * @param color The color of the field border.
	 * @param fieldLineWidth The line width of the field border.
	 */
	drawFieldBorder: function (context, field, distanceOutsideField, color, fieldLineWidth) {
		// Get the position of the field border in screen units and draw the field border.
		var position = vec2.fromValues(distanceOutsideField.width, distanceOutsideField.height);
		this.drawRectangle(context, position, field.width, field.height, 'transparent', color, fieldLineWidth);
	},

	/**
	 * Draws the left and right goal area for the field on the canvas.
	 *
	 * @param context The canvas context.
	 * @param field The dimensions of the field in screen units.
	 * @param distanceOutsideField The distance outside of the field in screen units.
	 * @param color The oolor of the goal areas.
	 * @param fieldLineWidth The line width of the goal area.
	 */
	drawGoalArea: function (context, field, distanceOutsideField, color, fieldLineWidth) {
		// Get the width and height of the goal area in screen units.
		var width = this.SIToScreenWidth(context, Field.constants.GOAL_AREA_LENGTH);
		var height = this.SIToScreenHeight(context, Field.constants.GOAL_AREA_WIDTH);
		// Calculate the y value of the goal area.
		var y = ((field.height - height) * 0.5) + distanceOutsideField.height;
		// Draw the left and right goal area.
		this.drawRectangle(context, vec2.fromValues(distanceOutsideField.width, y), width, height, 'transparent', color, fieldLineWidth);
		this.drawRectangle(context, vec2.fromValues(distanceOutsideField.width + field.width - width, y), width, height, 'transparent', color, fieldLineWidth);
	},

	/**
	 * Draws the centre circle for the field on the canvas.
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
	 * @param field The dimensions of the field in screen units.
	 * @param distanceOutsideField The distance outside of the field in screen units.
	 * @param color The color of the centre line.
	 * @param fieldLineWidth The width of the centre line.
	 */
	drawCentreLine: function (context, field, distanceOutsideField, color, fieldLineWidth) {
		// Calculate the origin and target of the circle.
		var origin = vec2.fromValues(distanceOutsideField.width + field.width * 0.5, distanceOutsideField.height);
		var target = vec2.fromValues(origin[0], origin[1] + field.height);
		// Draw the centre circle.
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
		// Get the color of the robot.
		var color = this.robot.color;
		// Get the screen position and heading of the robot.
		var screenPosition = this.worldToScreen(context, position);
		// Check if the robot is going to be rendered on the canvas.
		if (this.inBounds(context, screenPosition)) {
			var screenHeading = this.worldToScreen(context, robotHeading);
			// Draw a circle representing the robot using its screen coordinates and its heading as a line.
			this.drawCircle(context, screenPosition, this.robot.radius, color, 'gray');
			this.drawLine(context, screenPosition, screenHeading, color);
		} else {
			// The robot will not be rendered, so draw a line indicating its position from the center.
			this.drawLine(context, this.worldToScreen(context, vec2.create()), screenPosition, color);
		}
	},

	/**
	 * Draws the ball on the canvas.
	 *
	 * @param context The canvas context.
	 * @param position The world position of the ball.
	 */
	drawBall: function (context, position) {
		// Get the screen position of the ball and draw the circle.
		var screenPosition = this.worldToScreen(context, position);
		this.drawCircle(context, screenPosition, this.ball.radius, 'orange', 'red');
	},

	/**
	 * Draws the robot's path plan on the field.
	 *
	 * @param context The canvas context.
	 * @param pathPlan The list of path plan points.
	 */
	drawPathPlan: function (context, pathPlan) {
		// Get the color and line width of the path plan.
		var color = this.pathPlan.color;
		var lineWidth = this.pathPlan.lineWidth;
		// Get the first point of the path plan and then check if it exists.
		var start = pathPlan[0];
		if (start) {
			// Instantiate the origin to the start value in screen coordinates.
			var origin = this.worldToScreen(context, vec2.fromValues(start.x, start.y));
			// Iterate from the first point to the end of the path plan.
			for (var i = 1, len = pathPlan.length; i < len; i++) {
				// Get the current point and initialise it as the target in screen coordinates.
				var point = pathPlan[i];
				var target = this.worldToScreen(context, vec2.fromValues(point.x, point.y));
				// Draw the line from the origin to the target and set the new origin to the target.
				this.drawLine(context, origin, target, color, lineWidth);
				origin = target;
			}
		}
	},

	/**
	 * Checks if a particular position is in the bounds of the canvas.
	 *
	 * @param context The canvas context.
	 * @param position The position being checked in screen units.
	 * @returns {boolean} Whether the position will be rendered on the canvas.
	 */
	inBounds: function (context, position) {
		var canvas = context.canvas;
		return position[0] >= 0 && position[0] <= canvas.width && position[1] >= 0 && position[1] <= canvas.height;
	},

	/**
	 * This method is triggered when an Overview packet is sent to this view.
	 *
	 * @param robotPosition The position of the robot in world space.
	 * @param robotPositionCovariance The certainty of the robot position.
	 * @param robotHeading The direction the robot is facing in local space.
	 * @param ballPosition The position of the ball in world space.
	 * @param pathPlan The walk path plan.
	 */
	onUpdate: function (robotPosition, robotPositionCovariance, robotHeading, ballPosition, pathPlan) {
		// Get the context and check if it exists.
		var context = this.context;
		if (context) {
			// Get the canvas and clear what was drawn in the previous frame.
			var canvas = this.canvas;
			this.context.clearRect(0, 0, canvas.getWidth(), canvas.getHeight());
			// Draw the field.
			this.drawField(context);
			// Check the robot position and robot heading exist.
			if (robotPosition && robotHeading) {
				// Convert the robot position and robot heading to vectors.
				robotPosition = vec2.fromValues(robotPosition.x, robotPosition.y);
				robotHeading = vec2.fromValues(robotHeading.x, robotHeading.y);
				// Convert the robot heading to world space.
				robotHeading = this.localToWorld(robotPosition, robotHeading);
				// Draw the robot and the ball on the field.
				this.drawRobot(context, robotPosition, robotHeading);
			}
			// Check if a ball position exists.
			if (ballPosition) {
				// Convert the ball position to a vector and draw it on the field.
				this.drawBall(context, vec2.fromValues(ballPosition.x, ballPosition.y));
			}
			// Check if a path plan exists and then draw it.
			if (pathPlan) {
				this.drawPathPlan(context, pathPlan);
			}
		}
	}

});
