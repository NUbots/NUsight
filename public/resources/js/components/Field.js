(function (THREE) {
	"use strict";

	var Field;

//    // Field dimensions
//	   var lineWidth = 0.05;
//    var markWidth = 0.1;
//    var fieldLength = 9.0;
//    var fieldWidth = 6.0;
//    var goalDepth = 0.5;
//    var goalWidth = 2.25;
//    var goalAreaLength = 0.6;
//    var goalAreaWidth = 3.45;
//    var goalCrossbarHeight = 1.10;
//    var goalpostDiameter = 0.1;
//    var goalNetHeight = 1.0;
//    var penaltyMarkDistance = 1.80;
//    var centerCircleDiameter = 1.50;
//    var borderStripMinWidth = 0.7;

    var lineWidth = 0.05;
    var markWidth = 0.1;
    var fieldLength = 6;
    var fieldWidth = 4;
    var goalDepth = 0.5;
    var goalWidth = 1.5;
    var goalAreaLength = 0.6;
    var goalAreaWidth = 2.2;
    var goalCrossbarHeight = 1.0;
    var goalpostDiameter = 0.1;
    var goalNetHeight = 0.8;
    var penaltyMarkDistance = 1.80;
    var centerCircleDiameter = 1.20;
    var borderStripMinWidth = 0.7;

	function buildFieldMesh() {
		function buildHorizontalLine(x1, x2, y, width) {
			width = typeof width !== 'undefined' ? width : lineWidth;
			y = typeof y !== 'undefined' ? y : 0;

			var length = x2 - x1;
			var hLine = new THREE.PlaneGeometry(length, width);
			hLine.applyMatrix(new THREE.Matrix4().makeTranslation(x1 + length * 0.5, y, 0));
			return hLine;
		}
		function buildVerticalLine(y1, y2, x, width) {
			width = typeof width !== 'undefined' ? width : lineWidth;
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
		function buildRectangle(x, y, w, h, lw) {
			lw = typeof lw !== 'undefined' ? lw : lineWidth;

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
		var ccInnerR = (centerCircleDiameter - lineWidth) * 0.5;
		var ccOuterR = (centerCircleDiameter + lineWidth) * 0.5;
		var halfLength = fieldLength * 0.5;
		var halfWidth = fieldWidth * 0.5;
		var goalAreaHalfWidth = goalAreaWidth * 0.5;
		

		// Define field lines
		var centerCircle = new THREE.RingGeometry(ccInnerR, ccOuterR, 128);

		var blueHalf = buildRectangle(-halfLength, -halfWidth, halfLength, fieldWidth);
		var yellowHalf = buildRectangle(0, -halfWidth, halfLength, fieldWidth);
		var blueGoalArea = buildRectangle(-halfLength, -goalAreaWidth * 0.5, goalAreaLength, goalAreaWidth);
		var yellowGoalArea = buildRectangle(halfLength - goalAreaLength, -goalAreaWidth * 0.5, goalAreaLength, goalAreaWidth);

		var markX = halfLength - penaltyMarkDistance;
		var blueMarkVLine = buildVerticalLine(-markWidth * 0.5, markWidth * 0.5, -markX);
		var blueMarkHLine = buildHorizontalLine(-markX - markWidth * 0.5, -markX + markWidth * 0.5, 0);

		var yellowMarkVLine = buildVerticalLine(-markWidth * 0.5, markWidth * 0.5, markX);
		var yellowMarkHLine = buildHorizontalLine(markX - markWidth * 0.5, markX + markWidth * 0.5, 0);

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
		var goalLineWidth = lineWidth * 0.5;
		var goalX = (halfLength - lineWidth * 0.5 + goalDepth + goalLineWidth * 0.5);
		var goalY = (goalWidth + goalpostDiameter) * 0.5;
		var goalW = (goalDepth - lineWidth + goalLineWidth * 0.5);
		var goalH = (goalWidth + goalpostDiameter);
		var goalPostRadius = goalpostDiameter * 0.5;
		var goalPostX = halfLength + goalPostRadius * 0.5;

		// Define goals
		var blueGoalBox = buildRectangle(-goalX, -goalY, goalW, goalH, goalLineWidth);
		var yellowGoalBox = buildRectangle(goalX - goalW, -goalY, goalW, goalH, goalLineWidth);
		var blueLeftGoalPost = buildCircle(-goalPostX, -goalY, goalPostRadius);
		var blueRightGoalPost = buildCircle(-goalPostX, goalY, goalPostRadius);
		var yellowLeftGoalPost = buildCircle(goalPostX, -goalY, goalPostRadius);
		var yellowRightGoalPost = buildCircle(goalPostX, goalY, goalPostRadius);

		var blueGoal = new THREE.Geometry();
		THREE.GeometryUtils.merge(blueGoal, blueGoalBox);
		THREE.GeometryUtils.merge(blueGoal, blueLeftGoalPost);
		THREE.GeometryUtils.merge(blueGoal, blueRightGoalPost);
		var blueGoalMesh = new THREE.Mesh(blueGoal, new THREE.MeshBasicMaterial({
			color: 0x0000ff
		}));
		blueGoalMesh.position.z = 0.001;

		var yellowGoal = new THREE.Geometry();
		THREE.GeometryUtils.merge(yellowGoal, yellowGoalBox);
		THREE.GeometryUtils.merge(yellowGoal, yellowLeftGoalPost);
		THREE.GeometryUtils.merge(yellowGoal, yellowRightGoalPost);
		var yellowGoalMesh = new THREE.Mesh(yellowGoal, new THREE.MeshBasicMaterial({
			color: 0xffff00
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
			fieldLength + borderStripMinWidth * 2,
			fieldWidth + borderStripMinWidth * 2);
		var fieldGroundMesh = new THREE.Mesh(fieldGround, new THREE.MeshBasicMaterial({
			color: 0x009900
		}));
		fieldGroundMesh.add(fieldMarkingsMesh);

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

	window.Field = Field;

}(window.THREE));
