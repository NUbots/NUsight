(function (THREE) {
	"use strict";

	var Field, FieldMap, SCALE, FIELD_LENGTH, FIELD_WIDTH, GOAL_DEPTH, GOAL_WIDTH,
	GOAL_HEIGHT, GOAL_AREA_LENGTH, GOAL_AREA_WIDTH, PENALTY_MARK_DISTANCE,
	PENALTY_MARK_LENGTH, CENTRE_CIRCLE_RADIUS, BORDER_STRIP_WIDTH, LINE_WIDTH,
	POLE_RADIUS;

	SCALE = 1;
	FIELD_LENGTH = 600 * SCALE;
	FIELD_WIDTH = 400 * SCALE;
	GOAL_DEPTH = 50 * SCALE;
	GOAL_WIDTH = 150 * SCALE;
	GOAL_HEIGHT = 80 * SCALE;
	GOAL_AREA_LENGTH = 60 * SCALE;
	GOAL_AREA_WIDTH = 220 * SCALE;
	PENALTY_MARK_DISTANCE = 180 * SCALE;
	PENALTY_MARK_LENGTH = 10 * SCALE;
	CENTRE_CIRCLE_RADIUS = 60 * SCALE;
	BORDER_STRIP_WIDTH = 70 * SCALE;
	LINE_WIDTH = 5 * SCALE;
	POLE_RADIUS = 5 * SCALE;

	Field = function () {
		var tube, post, i;

		//Create a new container object
		THREE.Object3D.call(this);
		
		this.field = new THREE.Object3D();
		this.field.rotation.y = Math.PI / 2;
		//this.field.rotation.x = Math.PI / 2;

		//Create the field
		this.map = new FieldMap();

		//Create a plane which is the size of the field (/100 because field is measured in centimeters while the 3d is in meters)
		this.plane = new THREE.PlaneGeometry(this.map.canvas.width, this.map.canvas.height);
		this.plane.overdraw = true;

		//Create a new mesh which is made from this texture
		this.ground = new THREE.Mesh(this.plane, new THREE.MeshBasicMaterial({
			map: this.map.texture
		}));
		this.ground.rotation.x = (3/2) * Math.PI;
		//this.ground.position.x = this.map.canvas.width/200;
		//this.ground.position.z = this.map.canvas.height/200;

		this.field.add(this.ground);
		this.add(this.field);

		var splines = [];
		//Build our Squircle spline
		for(i = -Math.PI; i < Math.PI; i += Math.PI/180) {
			var x = (1/(Math.pow(Math.pow(Math.tan(i), 20) + 1, 1/20)));
			var y = (Math.pow(1 - Math.pow(x, 20), 1/20));

			x *= GOAL_WIDTH/100;
			y *= GOAL_HEIGHT/100;

			//console.log("x:" + x + " y:" + y);

			splines.push(new THREE.Vector3(x, y, 0));
		}

		//Build the poles
		post = new THREE.SplineCurve3([
			new THREE.Vector3(0, 0, 0),
			new THREE.Vector3(0, 0.8, 0),
			new THREE.Vector3(1.8, 0.8, 0),
			new THREE.Vector3(1.8, 0, 0),
			]);

		post = new THREE.SplineCurve3(splines);

		tube = new THREE.TubeGeometry(post, 20, POLE_RADIUS/100, 12, false);

		this.goals = new THREE.Mesh(tube, new THREE.MeshPhongMaterial({
			color: 0x11BB11
		}));

		//this.field.add(this.goals);
	};
	
	Field.prototype = Object.create(THREE.Object3D.prototype);

	FieldMap = function () {
		this.canvas = document.createElement("canvas");
		var context = this.canvas.getContext("2d");

		this.canvas.width = FIELD_WIDTH + (2 * BORDER_STRIP_WIDTH);
		this.canvas.height = FIELD_LENGTH + (2 * BORDER_STRIP_WIDTH);

		//Draw the field (green)
		context.fillStyle = '#009900';
		context.strokeStyle = '#FFF';
		context.lineWidth = LINE_WIDTH;

		//Draw the field
		context.fillRect(0,0,this.canvas.width, this.canvas.height);

		//Draw the outer box
		context.strokeRect(BORDER_STRIP_WIDTH, BORDER_STRIP_WIDTH, FIELD_WIDTH, FIELD_LENGTH);

		//Draw the centre line
		context.beginPath();
		context.moveTo(BORDER_STRIP_WIDTH, BORDER_STRIP_WIDTH + (FIELD_LENGTH / 2));
		context.lineTo(BORDER_STRIP_WIDTH + FIELD_WIDTH, BORDER_STRIP_WIDTH + (FIELD_LENGTH / 2));
		context.stroke();
		context.closePath();

		//Draw the circle in the middle
		context.beginPath();
		context.arc(this.canvas.width/2, this.canvas.height/2, CENTRE_CIRCLE_RADIUS, 0, Math.PI*2, true);
		context.stroke();
		context.closePath();

		//Draw the two goal areas
		context.strokeRect(BORDER_STRIP_WIDTH + ((FIELD_WIDTH - GOAL_AREA_WIDTH) / 2), BORDER_STRIP_WIDTH, GOAL_AREA_WIDTH, GOAL_AREA_LENGTH);
		context.strokeRect(BORDER_STRIP_WIDTH + ((FIELD_WIDTH - GOAL_AREA_WIDTH) / 2), BORDER_STRIP_WIDTH + FIELD_LENGTH - GOAL_AREA_LENGTH, GOAL_AREA_WIDTH, GOAL_AREA_LENGTH);

		//Draw the two goal boxes
		context.strokeRect(BORDER_STRIP_WIDTH + ((FIELD_WIDTH - GOAL_WIDTH)/2), BORDER_STRIP_WIDTH - GOAL_DEPTH, GOAL_WIDTH, GOAL_DEPTH);
		context.strokeRect(BORDER_STRIP_WIDTH + ((FIELD_WIDTH - GOAL_WIDTH)/2), BORDER_STRIP_WIDTH + FIELD_LENGTH, GOAL_WIDTH, GOAL_DEPTH);

		//Draw the three crosses
		context.beginPath();
		//First One
		context.moveTo((this.canvas.width/2) + PENALTY_MARK_LENGTH/2, BORDER_STRIP_WIDTH + PENALTY_MARK_DISTANCE);
		context.lineTo((this.canvas.width/2) - PENALTY_MARK_LENGTH/2, BORDER_STRIP_WIDTH + PENALTY_MARK_DISTANCE);
		context.moveTo((this.canvas.width/2), BORDER_STRIP_WIDTH + PENALTY_MARK_DISTANCE + PENALTY_MARK_LENGTH/2);
		context.lineTo((this.canvas.width/2), BORDER_STRIP_WIDTH + PENALTY_MARK_DISTANCE - PENALTY_MARK_LENGTH/2);
		//Center one
		context.moveTo((this.canvas.width/2) + PENALTY_MARK_LENGTH/2, (this.canvas.height/2));
		context.lineTo((this.canvas.width/2) - PENALTY_MARK_LENGTH/2, (this.canvas.height/2));
		context.moveTo((this.canvas.width/2), (this.canvas.height/2) + PENALTY_MARK_LENGTH/2);
		context.lineTo((this.canvas.width/2), (this.canvas.height/2) - PENALTY_MARK_LENGTH/2);
		//Last One
		context.moveTo((this.canvas.width/2) + PENALTY_MARK_LENGTH/2, BORDER_STRIP_WIDTH + FIELD_LENGTH - PENALTY_MARK_DISTANCE);
		context.lineTo((this.canvas.width/2) - PENALTY_MARK_LENGTH/2, BORDER_STRIP_WIDTH + FIELD_LENGTH - PENALTY_MARK_DISTANCE);
		context.moveTo((this.canvas.width/2), BORDER_STRIP_WIDTH + FIELD_LENGTH - PENALTY_MARK_DISTANCE + PENALTY_MARK_LENGTH/2);
		context.lineTo((this.canvas.width/2), BORDER_STRIP_WIDTH + FIELD_LENGTH - PENALTY_MARK_DISTANCE - PENALTY_MARK_LENGTH/2);
		context.stroke();
		context.closePath();

		//Create the texture for this object
		this.texture = new THREE.Texture(this.canvas);
		this.texture.needsUpdate = true;
	};

	window.Field = Field;

}(window.THREE));
