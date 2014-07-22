(function (THREE) {

    "use strict";

	var Field;

	function buildFieldMesh() {
		function buildHorizontalLine(x1, x2, y, width) {
			width = typeof width !== 'undefined' ? width : Field.constants.LINE_WIDTH;
			y = typeof y !== 'undefined' ? y : 0;

			var length = x2 - x1;
			var hLine = new THREE.PlaneGeometry(length, width);
			hLine.applyMatrix(new THREE.Matrix4().makeTranslation(x1 + length * 0.5, y, 0));
			return hLine;
		}
		function buildVerticalLine(y1, y2, x, width) {
			width = typeof width !== 'undefined' ? width : Field.constants.LINE_WIDTH;
			x = typeof x !== 'undefined' ? x : 0;

			var length = y2 - y1;
			var vLine = new THREE.PlaneGeometry(width, length);
			vLine.applyMatrix(new THREE.Matrix4().makeTranslation(x, y1 + length * 0.5, 0));
			return vLine;
		}
		function buildCircle(x, y, r, segments) {
			segments = typeof segments !== 'undefined' ? segments : 64;

			var circle = new THREE.CircleGeometry(r, segments);
			circle.applyMatrix(new THREE.Matrix4().makeTranslation(x, y, 0));
			return circle;
		}
        function buildCylinder(x, y, radius, height, color) {
            return new Cylinder({
				position: new THREE.Vector3(x, y, 0.001 + height * 0.5),
				radius: radius,
				height: height,
				color: color
			});//, radius, height, new THREE.Vector3(0.5 * Math.PI, 0, 0), color);
            //cylinder.position = new THREE.Vector3(x, y, 0.001);
            //return cylinder;
        }
		function buildRectangle(x, y, w, h, lw) {
			lw = typeof lw !== 'undefined' ? lw : Field.constants.LINE_WIDTH;

			var x1 = x - lw * 0.5;
			var x2 = x + w + lw * 0.5;
			var topLine = buildHorizontalLine(x1, x2, y, lw);
			var bottomLine = buildHorizontalLine(x1, x2, y + h, lw);

			var leftLine = buildVerticalLine(y, y + h, x, lw);
			var rightLine = buildVerticalLine(y, y + h, x + w, lw);

			var rect = new THREE.Geometry();
			THREE.GeometryUtils.merge(rect, topLine);
			THREE.GeometryUtils.merge(rect, bottomLine);
			THREE.GeometryUtils.merge(rect, leftLine);
			THREE.GeometryUtils.merge(rect, rightLine);
			return rect;
		}

		// Convenience variables
		var ccInnerR = (Field.constants.CENTER_CIRCLE_DIAMETER - Field.constants.LINE_WIDTH) * 0.5;
		var ccOuterR = (Field.constants.CENTER_CIRCLE_DIAMETER + Field.constants.LINE_WIDTH) * 0.5;
		var halfLength = Field.constants.FIELD_LENGTH * 0.5;
		var halfWidth = Field.constants.FIELD_WIDTH * 0.5;
		var goalAreaHalfWidth = Field.constants.GOAL_AREA_WIDTH * 0.5;
		

		// Define field lines
		var centerCircle = new THREE.RingGeometry(ccInnerR, ccOuterR, 128);

		var blueHalf = buildRectangle(-halfLength, -halfWidth, halfLength, Field.constants.FIELD_WIDTH);
		var yellowHalf = buildRectangle(0, -halfWidth, halfLength, Field.constants.FIELD_WIDTH);
		var blueGoalArea = buildRectangle(-halfLength, -Field.constants.GOAL_AREA_WIDTH * 0.5, Field.constants.GOAL_AREA_LENGTH, Field.constants.GOAL_AREA_WIDTH);
		var yellowGoalArea = buildRectangle(halfLength - Field.constants.GOAL_AREA_LENGTH, -Field.constants.GOAL_AREA_WIDTH * 0.5, Field.constants.GOAL_AREA_LENGTH, Field.constants.GOAL_AREA_WIDTH);

		var markX = halfLength - Field.constants.PENALTY_MARK_DISTANCE;
		var blueMarkVLine = buildVerticalLine(-Field.constants.MARK_WIDTH * 0.5, Field.constants.MARK_WIDTH * 0.5, -markX);
		var blueMarkHLine = buildHorizontalLine(-markX - Field.constants.MARK_WIDTH * 0.5, -markX + Field.constants.MARK_WIDTH * 0.5, 0);

		var yellowMarkVLine = buildVerticalLine(-Field.constants.MARK_WIDTH * 0.5, Field.constants.MARK_WIDTH * 0.5, markX);
		var yellowMarkHLine = buildHorizontalLine(markX - Field.constants.MARK_WIDTH * 0.5, markX + Field.constants.MARK_WIDTH * 0.5, 0);

		// Merge all field lines into a single geometry for performance
		var fieldLines = new THREE.Geometry();
		THREE.GeometryUtils.merge(fieldLines, centerCircle);
		THREE.GeometryUtils.merge(fieldLines, blueHalf);
		THREE.GeometryUtils.merge(fieldLines, yellowHalf);
		THREE.GeometryUtils.merge(fieldLines, blueGoalArea);
		THREE.GeometryUtils.merge(fieldLines, yellowGoalArea);
		THREE.GeometryUtils.merge(fieldLines, blueMarkVLine);
		THREE.GeometryUtils.merge(fieldLines, blueMarkHLine);
		THREE.GeometryUtils.merge(fieldLines, yellowMarkVLine);
		THREE.GeometryUtils.merge(fieldLines, yellowMarkHLine);


		// Goal convenience variables
		// TODO: Check that 'Goal depth' is handled correctly
		// (should be from the front of the baseline to the back of the goal)
		var goalLineWidth = Field.constants.LINE_WIDTH * 0.5;
		var goalX = (halfLength - Field.constants.LINE_WIDTH * 0.5 + Field.constants.GOAL_DEPTH + goalLineWidth * 0.5);
		var goalY = (Field.constants.GOAL_WIDTH + Field.constants.GOAL_POST_DIAMETER) * 0.5;
		var goalW = (Field.constants.GOAL_DEPTH - Field.constants.LINE_WIDTH + goalLineWidth * 0.5);
		var goalH = (Field.constants.GOAL_WIDTH + Field.constants.GOAL_POST_DIAMETER);
		var goalPostRadius = Field.constants.GOAL_POST_DIAMETER * 0.5;
		var goalPostX = halfLength + goalPostRadius * 0.5;
        var blue = 0x0000ff;
        var yellow = 0xffff00;

		// Define goals
		var blueGoalBox = buildRectangle(-goalX, -goalY, goalW, goalH, goalLineWidth);
		var yellowGoalBox = buildRectangle(goalX - goalW, -goalY, goalW, goalH, goalLineWidth);
        var blueLeftGoalPost = buildCylinder(-goalPostX, goalY, goalPostRadius, Field.constants.GOAL_CROSSBAR_HEIGHT, blue);
        var blueRightGoalPost = buildCylinder(-goalPostX, -goalY, goalPostRadius, Field.constants.GOAL_CROSSBAR_HEIGHT, blue);
        var yellowLeftGoalPost = buildCylinder(goalPostX, -goalY, goalPostRadius, Field.constants.GOAL_CROSSBAR_HEIGHT, yellow);
        var yellowRightGoalPost = buildCylinder(goalPostX, goalY, goalPostRadius, Field.constants.GOAL_CROSSBAR_HEIGHT, yellow);
		//var blueRightGoalPost = buildCircle(-goalPostX, goalY, goalPostRadius);
		//var yellowLeftGoalPost = buildCircle(goalPostX, -goalY, goalPostRadius);
		//var yellowRightGoalPost = buildCircle(goalPostX, goalY, goalPostRadius);

		var blueGoal = new THREE.Geometry();
		THREE.GeometryUtils.merge(blueGoal, blueGoalBox);
		//THREE.GeometryUtils.merge(blueGoal, blueLeftGoalPost);
		//THREE.GeometryUtils.merge(blueGoal, blueRightGoalPost);
		var blueGoalMesh = new THREE.Mesh(blueGoal, new THREE.MeshBasicMaterial({
			color: blue
		}));
		blueGoalMesh.position.z = 0.001;

		var yellowGoal = new THREE.Geometry();
		THREE.GeometryUtils.merge(yellowGoal, yellowGoalBox);
		//THREE.GeometryUtils.merge(yellowGoal, yellowLeftGoalPost);
		//THREE.GeometryUtils.merge(yellowGoal, yellowRightGoalPost);
		var yellowGoalMesh = new THREE.Mesh(yellowGoal, new THREE.MeshBasicMaterial({
			color: yellow
		}));
		yellowGoalMesh.position.z = 0.001;

		var fieldMarkingsMesh = new THREE.Mesh(fieldLines, new THREE.MeshBasicMaterial({
			color: 0xffffff
		}));
		fieldMarkingsMesh.add(blueGoalMesh);
		fieldMarkingsMesh.add(yellowGoalMesh);
		fieldMarkingsMesh.position.z = 0.001;


		// var fieldGround = buildRectangle(-halfLength - borderStripMinWidth,
		// 								 -halfWidth - borderStripMinWidth,
		// 								 fieldLength + borderStripMinWidth * 2,
		// 								 fieldWidth + borderStripMinWidth * 2);
		var fieldGround = new THREE.PlaneGeometry(
            Field.constants.FIELD_LENGTH + Field.constants.BORDER_STRIP_MIN_WIDTH * 2,
            Field.constants.FIELD_WIDTH + Field.constants.BORDER_STRIP_MIN_WIDTH * 2);
		var fieldGroundMesh = new THREE.Mesh(fieldGround, new THREE.MeshBasicMaterial({
			color: 0x009900
		}));
		fieldGroundMesh.add(fieldMarkingsMesh);
        fieldGroundMesh.add(blueLeftGoalPost);
        fieldGroundMesh.add(blueRightGoalPost);
        fieldGroundMesh.add(yellowLeftGoalPost);
        fieldGroundMesh.add(yellowRightGoalPost);

		return fieldGroundMesh;
	}

	Field = function () {
		//Create a new container object
		THREE.Object3D.call(this);
		
		this.fieldMesh = buildFieldMesh();
		this.add(this.fieldMesh);


		// var splines = [];
		// //Build our Squircle spline
		// for(i = -Math.PI; i < Math.PI; i += Math.PI/180) {
		// 	var x = (1/(Math.pow(Math.pow(Math.tan(i), 20) + 1, 1/20)));
		// 	var y = (Math.pow(1 - Math.pow(x, 20), 1/20));
			
		// 	x *= GOAL_WIDTH;
		// 	y *= GOAL_HEIGHT;
			
		// 	//console.log("x:" + x + " y:" + y);
			
		// 	splines.push(new THREE.Vector3(x, y, 0));
		// }
		
		// //Build the poles
		// post = new THREE.SplineCurve3([
		// 	new THREE.Vector3(0, 0, 0),
		// 	new THREE.Vector3(0, 0.8, 0),
		// 	new THREE.Vector3(1.8, 0.8, 0),
		// 	new THREE.Vector3(1.8, 0, 0),
		// ]);
		
		// post = new THREE.SplineCurve3(splines);
		
		// tube = new THREE.TubeGeometry(post, 0.020, POLE_RADIUS, 0.012, false);
		
		// this.goals = new THREE.Mesh(tube, new THREE.MeshBasicMaterial({
		// 	color: 0xb9bb11
		// }));
		
		// this.add(this.goals);
	};
	
	Field.prototype = Object.create(THREE.Object3D.prototype);

	// field constants
    Field.constants = {
        LINE_WIDTH: 0.05,
        MARK_WIDTH: 0.05,
        FIELD_LENGTH: 9,
        FIELD_WIDTH: 6,
        GOAL_DEPTH: 0.5,
        GOAL_WIDTH: 2.25,
        GOAL_AREA_LENGTH: 0.6,
        GOAL_AREA_WIDTH: 3.45,
        GOAL_CROSSBAR_HEIGHT: 1.1,
        GOAL_POST_DIAMETER: 0.1,
        GOAL_NET_HEIGHT: 1,
        PENALTY_MARK_DISTANCE: 1.80,
        CENTER_CIRCLE_DIAMETER: 1.50,
        BORDER_STRIP_MIN_WIDTH: 0.7
    };

    // export the object
	window.Field = Field;

}(window.THREE));
