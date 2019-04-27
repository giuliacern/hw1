"use strict";

var canvas;
var gl;

var numVertices  = 36;

var numChecks = 8;

var program;

var c;

var flag = true;

var pointsArray = [];
var colorsArray = [];

var vertices = [
	vec4( -0.5, -0.5,  0.5, 1.0 ),
	vec4( -0.5,  0.5,  0.5, 1.0 ),
	vec4( 0.5,  0.5,  0.5, 1.0 ),
	vec4( 0.5, -0.5,  0.5, 1.0 ),
	vec4( -0.5, -0.5, -0.5, 1.0 ),
	vec4( -0.5,  0.5, -0.5, 1.0 ),
	vec4( 0.5,  0.5, -0.5, 1.0 ),
	vec4( 0.5, -0.5, -0.5, 1.0 )
];

var vertexColors = [
	vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
	vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
	vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
	vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
	vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
	vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
	vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
	vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

	var modelView;

	var radiusCamera = 1.5;
	var thetaCamera  = 0.0;
	var phiCamera	= 0.0;

	var eye,
		at = vec3(0.0, 0.0, 0.0),
		up = vec3(0.0, 1.1, 0.0);

	var ProjectionMat;

	var near = 0.01,
		far = 10,
		fovy = 120,
		aspect = 1;

//Step 2
	var xTransVal = 0.0,
		yTransVal = 0.0,
		zTransVal = 0.0;
	var scaleFactor = 1;

//Step 5
	var lightPositionVec = 	vec4(0.0, 0.0, -10.0, 0.0);
	var lightAmbientVec = 	vec4(0.4, 0.4, 0.4,   1.0);
	var lightDiffuseVec = 	vec4(1.0, 1.0, 1.0,   1.0);
	var lightSpecularVec = 	vec4(1.0, 1.0, 1.0,   1.0);

	//var materialAmbient = 	vec4(0.1745,   0.01175, 	0.01175, 	1.0);
	//var materialDiffuse = 	vec4(0.61424,  0.04136, 	0.04136, 	1.0);
	//var materialSpecular = 	vec4(0.727811, 0.626959, 	0.626959, 	1.0);
	//var materialShininess = 0.6;

  var materialAmbient = vec4(0.25, 0.20725, 0.20725, 1.0); //0.25	0.20725	0.20725
  var materialDiffuse = vec4(1.0, 0.829, 0.829, 1.0); //1	0.829	0.829
  var materialSpecular = vec4(0.296648, 0.296648, 0.296648, 1.0); //0.296648	0.296648	0.296648
  var materialShininess = 0.088; //0.088

	var ambientColor, diffuseColor, specularColor;

// Step 6
	var shadingType = true;

// Step 7
	var textureSize = 64;

	var imageCheckerboard  = new Array()
		for (var i =0; i<textureSize; i++)  imageCheckerboard [i] = new Array();
		for (var i =0; i<textureSize; i++)
			for ( var j = 0; j < textureSize; j++)
			   imageCheckerboard [i][j] = new Float32Array(4);
		for (var i =0; i<textureSize; i++) for (var j=0; j<textureSize; j++) {
			var c = (((i & 0x8) == 0) ^ ((j & 0x8)  == 0));
			imageCheckerboard [i][j] = [c, c, c, 1];
		}

	var imageTexture = new Uint8Array(4*textureSize*textureSize);
		for ( var i = 0; i < textureSize; i++ )
			for ( var j = 0; j < textureSize; j++ )
			   for(var k =0; k<4; k++)
					imageTexture[4*textureSize*i+4*j+k] = 255*imageCheckerboard [i][j][k];

	var texCoordsArray = [];

	var texCoord = [
		vec2(0, 0),
		vec2(0, 1),
		vec2(1, 1),
		vec2(1, 0)
	];

	function configureTexture(image) {
		var texture = gl.createTexture();
		gl.activeTexture( gl.TEXTURE0 );
		gl.bindTexture( gl.TEXTURE_2D, texture );
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, textureSize, textureSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.generateMipmap( gl.TEXTURE_2D );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR );
		gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
	}

	function quad(a, b, c, d) {
		pointsArray.push(vertices[a]);
		colorsArray.push(vertexColors[a]);
		texCoordsArray.push(texCoord[0]);

		pointsArray.push(vertices[b]);
		colorsArray.push(vertexColors[a]);
		texCoordsArray.push(texCoord[1]);

		pointsArray.push(vertices[c]);
		colorsArray.push(vertexColors[a]);
		texCoordsArray.push(texCoord[2]);

		pointsArray.push(vertices[a]);
		colorsArray.push(vertexColors[a]);
		texCoordsArray.push(texCoord[0]);

		pointsArray.push(vertices[c]);
		colorsArray.push(vertexColors[a]);
		texCoordsArray.push(texCoord[2]);

		pointsArray.push(vertices[d]);
		colorsArray.push(vertexColors[a]);
		texCoordsArray.push(texCoord[3]);
	}


function colorCube() {
	quad( 1, 0, 3, 2 );
	quad( 2, 3, 7, 6 );
	quad( 3, 0, 4, 7 );
	quad( 6, 5, 1, 2 );
	quad( 4, 5, 6, 7 );
	quad( 5, 4, 0, 1 );
}

window.onload = function init() {

	canvas = document.getElementById( "gl-canvas" );

	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	gl.enable(gl.DEPTH_TEST);


	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	colorCube();

	var cBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW );

	var vColor = gl.getAttribLocation( program, "vColor" );
	gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vColor );

	var vBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );


		document.getElementById('RadiusCameraSpan').innerHTML = document.getElementById("RadiusCameraSlider").valueAsNumber;

		document.getElementById("RadiusCameraSlider").oninput = function() {
			radiusCamera = this.valueAsNumber;
			document.getElementById('RadiusCameraSpan').innerHTML = "" + this.valueAsNumber;
		};

		document.getElementById('thetaCameraSpan').innerHTML = document.getElementById("thetaCameraSlider").valueAsNumber;

		document.getElementById("thetaCameraSlider").oninput = function() {
			thetaCamera = this.valueAsNumber;
			document.getElementById('thetaCameraSpan').innerHTML = "" + this.valueAsNumber;
		};

		document.getElementById('phiCameraSpan').innerHTML = document.getElementById("phiCameraSlider").valueAsNumber;

		document.getElementById("phiCameraSlider").oninput = function() {
			phiCamera = this.valueAsNumber;
			document.getElementById('phiCameraSpan').innerHTML = "" + this.valueAsNumber;
		};

		document.getElementById('nearProjectionSpan').innerHTML = document.getElementById("nearProjectionSlider").valueAsNumber;

		document.getElementById("nearProjectionSlider").oninput = function() {
			near = this.valueAsNumber;
			document.getElementById("nearProjectionSpan").innerHTML = "" + this.valueAsNumber;
		};

		document.getElementById('farProjectionSpan').innerHTML = document.getElementById("farProjectionSlider").valueAsNumber;

		document.getElementById("farProjectionSlider").oninput = function() {
			far = this.valueAsNumber;
			document.getElementById('farProjectionSpan').innerHTML = "" + this.valueAsNumber;
		};

		document.getElementById('fovyProjectionSpan').innerHTML = document.getElementById("fovyProjectionSlider").valueAsNumber;

		document.getElementById("fovyProjectionSlider").oninput = function() {
			fovy = this.valueAsNumber;
			document.getElementById("fovyProjectionSpan").innerHTML = "" + this.valueAsNumber;
		};

		document.getElementById('aspectProjectionSpan').innerHTML = document.getElementById("aspectProjectionSlider").valueAsNumber;

		document.getElementById("aspectProjectionSlider").oninput = function() {
			aspect = this.valueAsNumber;
			document.getElementById('aspectProjectionSpan').innerHTML = "" + this.valueAsNumber;
		};


		document.getElementById('xPositionSpan').innerHTML = document.getElementById("xPositionSlider").valueAsNumber;

		document.getElementById("xPositionSlider").oninput = function() {
			xTransVal = this.valueAsNumber;
			document.getElementById('xPositionSpan').innerHTML = "" + this.valueAsNumber;
		};

		document.getElementById('yPositionSpan').innerHTML = document.getElementById("yPositionSlider").valueAsNumber;

		document.getElementById("yPositionSlider").oninput = function() {
			yTransVal = this.valueAsNumber;
			document.getElementById('yPositionSpan').innerHTML = "" + this.valueAsNumber;
		};

		document.getElementById('zPositionSpan').innerHTML = document.getElementById("zPositionSlider").valueAsNumber;

		document.getElementById("zPositionSlider").oninput = function() {
			zTransVal = this.valueAsNumber;
			document.getElementById('zPositionSpan').innerHTML = "" + this.valueAsNumber;
		};

		document.getElementById('scaleSpan').innerHTML = document.getElementById("scaleSlider").valueAsNumber;

		document.getElementById("scaleSlider").oninput = function() {
			scaleFactor = this.valueAsNumber;
			document.getElementById('scaleSpan').innerHTML = "" + this.valueAsNumber;
		};

		gl.uniform4fv(gl.getUniformLocation(program, "lightPositionVec"), flatten(lightPositionVec));

		var ambientProductVec = mult(lightAmbientVec, materialAmbient);
		gl.uniform4fv(gl.getUniformLocation(program, "v_ambientProductVec"), flatten(ambientProductVec));
		gl.uniform4fv(gl.getUniformLocation(program, "f_ambientProductVec"), flatten(ambientProductVec));

		var diffuseProductVec = mult(lightDiffuseVec, materialDiffuse);
		gl.uniform4fv(gl.getUniformLocation(program, "v_diffuseProductVec"), flatten(diffuseProductVec));
		gl.uniform4fv(gl.getUniformLocation(program, "f_diffuseProductVec"), flatten(diffuseProductVec));

		var specularProductVec = mult(lightSpecularVec, materialSpecular);
		gl.uniform4fv(gl.getUniformLocation(program, "v_specularProductVec"), flatten(specularProductVec));
		gl.uniform4fv(gl.getUniformLocation(program, "fragment_specularProductVec"), flatten(specularProductVec));

		gl.uniform1f(gl.getUniformLocation(program, "v_materialShininess"), materialShininess);
		gl.uniform1f(gl.getUniformLocation(program, "f_materialShininess"), materialShininess);

		document.getElementById('switchShadingSpan').innerHTML = "Phong";

		document.getElementById("switchShadingButton").onclick = function() {
		shadingType = !shadingType;
			if (shadingType) {
			  document.getElementById('switchShadingSpan').innerHTML = "Phong";
			} else {
			  document.getElementById('switchShadingSpan').innerHTML = "Gouraud";
			}
		};

		var tBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );
		var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
		console.log(vTexCoord);

		gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(vTexCoord);

		configureTexture(imageTexture);


	render();
}


var render = function() {
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		eye = vec3(radiusCamera*Math.sin(thetaCamera)*Math.cos(phiCamera),
					radiusCamera*Math.sin(thetaCamera)*Math.sin(phiCamera),
					radiusCamera*Math.cos(thetaCamera));

		modelView = lookAt(eye, at, up);
		gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelView"), false, flatten(modelView));

		var transMat = [
		1.0, 0.0, 0.0, 0.0,
		0.0, 1.0, 0.0, 0.0,
		0.0, 0.0, 1.0, 0.0,
		xTransVal, yTransVal, zTransVal, 1.0
		];

		gl.uniformMatrix4fv(gl.getUniformLocation(program, "transMat"), false, transMat);

		var scaleMat = [
		scaleFactor, 0.0, 0.0, 0.0,
		0.0, scaleFactor, 0.0, 0.0,
		0.0, 0.0, scaleFactor, 0.0,
		0.0, 0.0, 0.0, 1.0
		];

		gl.uniformMatrix4fv(gl.getUniformLocation(program, "scaleMat"), false, scaleMat);

		var width = gl.canvas.width;
		var height = gl.canvas.height;

		ProjectionMat = perspective(fovy, aspect, near, far);
		gl.uniformMatrix4fv(gl.getUniformLocation(program, "ProjectionMat"), false, flatten(ProjectionMat));

		gl.scissor(0, height/2, width/2, height/2);
		gl.viewport(0, height/2, width/2, height/2);
		gl.drawArrays(gl.TRIANGLES, 0, numVertices);

		ProjectionMat = ortho(-1.0, 1.0, -1.0, 1.0, near, far);
		gl.uniformMatrix4fv(gl.getUniformLocation(program, "ProjectionMat"), false, flatten(ProjectionMat));

		gl.scissor(width/2, height/2, width/2, height/2);
		gl.viewport(width/2, height/2, width/2, height/2);
		gl.drawArrays(gl.TRIANGLES, 0, numVertices);

		gl.uniform1i(gl.getUniformLocation(program, "shadingType"), shadingType);


	gl.drawArrays( gl.TRIANGLES, 0, numVertices );

	requestAnimFrame(render);
}
