// CSI 4130 Assignment 1
// Aaron Ng
// March 7, 2022
// Code from ColouredTetra_Sol.js

// Vertex shader program
var VSHADER_SOURCE = null;
// Fragment shader program
var FSHADER_SOURCE = null;

// Rotation speed (degrees/second)
var SPEED;

// Initialize time of last rotation update
var LAST_FRAME = Date.now();
var VAO_A;
var VAO_N;

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
 setDefault(); // set global variables to default

  // Read shader from file
  readShaderFile(gl, 'shader/tetrahedron_sol.vs', 'v');
  readShaderFile(gl, 'shader/tetrahedron.fs', 'f');
}


// Read shader from file
function readShaderFile(gl, fileName, shader) {
    var request = new XMLHttpRequest();
    request.open('GET', fileName , true);


  request.onreadystatechange = function() {
    if (request.readyState == 4 && request.status !== 404) {
	onReadShader(gl, request.responseText, shader);
  }
  }
  // Create a request to acquire the file

  request.send();                      // Send the request
}


// The shader is loaded from file
function onReadShader(gl, fileString, shader) {
  if (shader == 'v') { // Vertex shader
    VSHADER_SOURCE = fileString;
  } else
  if (shader == 'f') { // Fragment shader
    FSHADER_SOURCE = fileString;
  }
  // When both are available, call start().
  if (VSHADER_SOURCE && FSHADER_SOURCE) start(gl);
}


function start(gl) {

  // Initialize shaders - string now available
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Write the positions of vertices to a vertex shader
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }
  // Must enable depth test for proper 3D display
  gl.enable(gl.DEPTH_TEST);
  // Set clear color - state info
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Specify the mvp_matrix as a uniform
  // get the storage location of mvp_matrix
  var u_mvp_matrix = gl.getUniformLocation(gl.program, 'mvp_matrix');
  if (!u_mvp_matrix) {
    console.log('Failed to get the storage location of mvp_matrix');
    return;
  }

  // Create the matrix to set the projection matrix
  var projMatrix = glMatrix.mat4.create();
  glMatrix.mat4.ortho(projMatrix,-5.0, 5.0, -5.0, 5.0, -5.0, 4.0);

  // Current axis angle
  var axisAngle = 0.0;
  // Current rotation angle
  var currentAngle = 0.0;

  // Register the event handler to be called on key press
  document.onkeydown = function(ev){
    keydown(ev, gl, n, currentAngle, projMatrix, u_mvp_matrix)};

  // Register the animation callback
  var tick = function() {

    var now = Date.now();
    var elapsed = now - LAST_FRAME;
    currentAngle = animate(currentAngle, SPEED, elapsed );  // Update the rotation angle
    axisAngle = animate(axisAngle, SPEED/7.0, elapsed );  // Update the axis angle
    LAST_FRAME = now;
    draw(gl, n, currentAngle, axisAngle, projMatrix, u_mvp_matrix); // Draw the triangle
    requestAnimationFrame(tick);   // Request that the browser calls tick
  };
  tick();
}


function initVertexBuffers(gl) {

  // @@@@@@@@@@@@@@@@ For Letter A @@@@@@@@@@@@@@@@
  VAO_A = gl.createVertexArray();
  gl.bindVertexArray(VAO_A);
  var x = -4.0; // offset
  var vertices_A = new Float32Array([
      0.0+x, 0.0, 0.0, 0.5, 0.5, 0.0,
    1.0+x, 0.0, 0.0, 0.5, 0.5, 0.0,
    1.5+x, 4.0, 0.0, 0.5, 0.5, 0.0, 
    2.5+x, 4.0, 0.0, 0.5, 0.5, 0.0,
    3.0+x, 0.0, 0.0, 0.5, 0.5, 0.0, // 5
    4.0+x, 0.0, 0.0, 0.5, 0.5, 0.0,
    3.5+x, 1.0, 0.0, 0.5, 0.5, 0.0,
    3.0+x, 1.5, 0.0, 0.5, 0.5, 0.0,
    0.5+x, 1.0, 0.0, 0.5, 0.5, 0.0,
    1.5+x, 1.5, 0.0, 0.5, 0.5, 0.0, // 10
  ]);
  var n_A = 10; // The number of vertices
  var fsize_A = vertices_A.BYTES_PER_ELEMENT;

  // Create a buffer object
  var vertexColorBuffer_A = gl.createBuffer();
  if (!vertexColorBuffer_A) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer_A);
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices_A, gl.STATIC_DRAW);

  var a_vertex_A = gl.getAttribLocation(gl.program, 'a_vertex');
  if (a_vertex_A < 0) {
    console.log('Failed to get the storage location of a_vertex');
    return -1;
  }
  // 6 entries per vertex: x y z r g b
  gl.vertexAttribPointer(a_vertex_A, 3, gl.FLOAT, false, 6*fsize_A,  fsize_A * 0);
  gl.enableVertexAttribArray(a_vertex_A);

  // Get the storage location of a_color, assign buffer and enable
  var a_color_A = gl.getAttribLocation(gl.program, 'a_color');
  if(a_color_A < 0) {
    console.log('Failed to get the storage location of a_color');
    return -1;
  }
  // Colors start after 3 entries - the first x y z coordinates
  gl.vertexAttribPointer(a_color_A, 3, gl.FLOAT, false, 6*fsize_A, 3*fsize_A);
  gl.enableVertexAttribArray(a_color_A);

  gl.bindVertexArray(null);


  // @@@@@@@@@@@@@@@@ For Letter N @@@@@@@@@@@@@@@@
  VAO_N = gl.createVertexArray();
  gl.bindVertexArray(VAO_N);

  var vertices = new Float32Array([
      0.0, 0.0, 0.0, 0.5, 0.5, 0.0,
    1.0, 0.0, 0.0, 0.5, 0.5, 0.0,
    0.0, 4.0, 0.0, 0.5, 0.5, 0.0,
    1.0, 4.0, 0.0, 0.5, 0.5, 0.0,
    1.0, 2.5, 0.0, 0.5, 0.5, 0.0, //5
    3.0, 1.5, 0.0, 0.5, 0.5, 0.0, //6
    3.0, 0.0, 0.0, 0.5, 0.5, 0.0,
    4.0, 0.0, 0.0, 0.5, 0.5, 0.0,
    3.0, 4.0, 0.0, 0.5, 0.5, 0.0,
    4.0, 4.0, 0.0, 0.5, 0.5, 0.0,
  ]);
  n_N = 10; // The number of vertices
  var fsize = vertices.BYTES_PER_ELEMENT;

  // Create a buffer object
  var vertexColorBuffer = gl.createBuffer();
  if (!vertexColorBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
  // Write data into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  var a_vertex = gl.getAttribLocation(gl.program, 'a_vertex');
  if (a_vertex < 0) {
    console.log('Failed to get the storage location of a_vertex');
    return -1;
  }
  // 6 entries per vertex: x y z r g b
  gl.vertexAttribPointer(a_vertex, 3, gl.FLOAT, false, 6*fsize,  fsize * 0);
  gl.enableVertexAttribArray(a_vertex);

  // Get the storage location of a_color, assign buffer and enable
  var a_color = gl.getAttribLocation(gl.program, 'a_color');
  if(a_color < 0) {
    console.log('Failed to get the storage location of a_color');
    return -1;
  }
  // Colors start after 3 entries - the first x y z coordinates
  gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 6*fsize, 3*fsize);
  gl.enableVertexAttribArray(a_color);

  gl.bindVertexArray(null);


  return 10;
}


function draw(gl, n, currentAngle, axisAngle, projMatrix, u_mvp_matrix) {
  // Combine model and projection matrix in js -- could also multiply in shader
  // View matrix is still identity
  var mvpMatrix = glMatrix.mat4.clone(projMatrix);
  // Set the rotation matrix
  glMatrix.mat4.rotateY(mvpMatrix, mvpMatrix, glMatrix.glMatrix.toRadian(axisAngle));

  // Pass the mvp matrix to the vertex shader
  gl.uniformMatrix4fv(u_mvp_matrix, false, mvpMatrix );

  // Clear <canvas> - both color and depth
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.bindVertexArray(VAO_A);
  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 10);

  gl.bindVertexArray(VAO_N);
  // Draw the rectangle
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 10);
  gl.bindVertexArray(null);
}


// Make a time based animation to keep things smooth
// Initialize global variable
function animate(angle,speed,elapsed) {
  // Calculate the elapsed time
  // Update the current rotation angle (adjusted by the elapsed time)
  var newAngle = angle + (speed * elapsed) / 1000.0;
  return newAngle %= 360;
}

function keydown(ev, n, gl, currentAngle, projMatrix, u_mvp_matrix) {
  switch(ev.keyCode) {
  case 38: // up arrow key
    SPEED += 2.0;
    break;
  case 40: // down arrow key
    SPEED -= 2.0;
    break;
  }
  draw(gl, n, currentAngle, projMatrix, u_mvp_matrix);
}

function setDefault() {
  SPEED = 20.0;
}

function faster() {
  SPEED += 2;
}

function slower() {
  SPEED -= 2;
}
