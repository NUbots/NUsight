function ScatterPlotGraph(id) {
	var canvas = document.getElementById(id);
	var gl = canvas.getContext("experimental-webgl");
	var fps = 0;
	var screenSize = [gl.canvas.width, gl.canvas.height];
	console.log(screenSize);
	var frameCount = 0;

	var uiOffset = 20;

	if (gl) {
		canvas.style.width = '100%';
		canvas.style.height = '100%';
	    // Set clear color to black, fully opaque
	    gl.clearColor(0.0, 0.0, 0.0, 1.0);
	    // Enable depth testing
	    gl.enable(gl.DEPTH_TEST);
	    // Near things obscure far things
	    gl.depthFunc(gl.LEQUAL);
	    // Clear the color as well as the depth buffer.
	    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  	}
  	
	var fragment = 'varying lowp vec3 colour; void main(void) {gl_FragColor = vec4(colour, 1.0);}';

    var vertex = 'attribute vec2 a_position; attribute vec3 a_colour; uniform vec2 resolution; varying lowp vec3 colour; void main() {colour = a_colour; gl_Position = vec4((a_position / resolution) - vec2(1, 1), 0, 1); gl_PointSize = 10.0;}';

	var shaderProgram = createShader(gl, vertex, fragment);

  	var vboUI = new VBO(gl, shaderProgram, gl.LINES);
	vboUI.addData(uiOffset, uiOffset, 0.2, 0.3, 0.8);
	vboUI.addData(uiOffset, screenSize[1] - uiOffset, 0.2, 0.3, 0.8);
	vboUI.addData(uiOffset, uiOffset, 0.2, 0.3, 0.8);
	vboUI.addData(screenSize[0] - uiOffset, uiOffset, 0.2, 0.3, 0.8);

  	var vboData = new VBO(gl, shaderProgram, gl.POINTS);

	var elapsedTime = 0;
	var frameCount = 0;
	var lastTime = 0;
	lastTime = new Date().getTime();

	var resolutionLocation = gl.getUniformLocation(shaderProgram, "resolution");

	this.width = function() {
		return screenSize[0];
	}

	this.height = function() {
		return screenSize[1];
	}

	this.resize = function() {
		screenSize = [canvas.width, canvas.height];
		gl.viewport(0, 0, screenSize[0], screenSize[1]);
	}

	this.render = function() {
		gl.useProgram(shaderProgram);
		var now = new Date().getTime();
		frameCount++;
		elapsedTime += (now-lastTime);
		lastTime = now;

		if(elapsedTime >= 1000) {
			fps = frameCount;
			frameCount = 0;
			elapsedTime -= 1000;

			document.getElementById('test').innerHTML = fps;
		}

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.uniform2f(resolutionLocation, screenSize[0] / 2, screenSize[1] / 2);

		vboUI.render();
		vboData.render();

		lastTime = new Date().getTime();
	}

	this.addData = function(x, y) {
		vboData.addData(uiOffset + x, uiOffset + y, 0.6, 0, 0);
	}

	function createShader(gl, vertex, fragment) {
		var vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vertex);
		gl.compileShader(vertexShader);

		var compilationLog = gl.getShaderInfoLog(vertexShader);
		console.log('Shader compiler log: ' + compilationLog);


		var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, fragment);
		gl.compileShader(fragmentShader);

		compilationLog = gl.getShaderInfoLog(fragmentShader);
		console.log('Shader compiler log: ' + compilationLog);

		var shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, vertexShader);
		gl.attachShader(shaderProgram, fragmentShader);
		gl.linkProgram(shaderProgram);


		if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
			console.log("failed to link shaders");
		}

		return shaderProgram;
	}
}

//vertex buffer object
//type is gl.POINTS, gl.LINES, gl.TRIANGLES etc
function VBO(gl, shaderProgram, type){
	//id of this vbo
	var id = gl.createBuffer();

	//x, y, z, r, g, b
	var vertices = [];

	//should reupload the vertice data
	var rebuild = true;
	
	//shader attribute locations
	var vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "a_position");
  	var colourAttribute = gl.getAttribLocation(shaderProgram, "a_colour");
	
	//render
	this.render = function() {
		gl.bindBuffer(gl.ARRAY_BUFFER, id);

		//only rebuild when there is new data
		if(rebuild) {
  			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  			rebuild = false;
  			console.log(vertices.length / 5);
		}


		//set vertex position
		gl.enableVertexAttribArray(vertexPositionAttribute);
		gl.vertexAttribPointer(vertexPositionAttribute, 2, gl.FLOAT, false, 5 * 4, 0 * 4);

		//set colour
		gl.enableVertexAttribArray(colourAttribute);
		gl.vertexAttribPointer(colourAttribute, 3, gl.FLOAT, false, 5 * 4, 2 * 4);

		//draw our vertices
		gl.drawArrays(type, 0, vertices.length / 5);
	}


	this.addData = function(x, y, r, g, b) {
		vertices.push(x, y, r, g, b);
		rebuild = true;
	}
}