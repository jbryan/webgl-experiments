tdl.require('tdl.framebuffers');
tdl.require('tdl.fast');
tdl.require('tdl.clock');
tdl.require('tdl.models');
tdl.require('tdl.programs');
tdl.require('tdl.webgl');

window.onload = init;

/*
 * Init global vars
 */
var NUM_PARTICLES_X = 64;
var NUM_PARTICLES_Y = 64;
var NUM_PARTICLES = NUM_PARTICLES_X * NUM_PARTICLES_Y;
var width = 512;
var height = 512;
var zoom = 1.0;
//var zoom = 0.125;
var focus = [0,0,0];

var gl, model, positionBuffer, velocityBuffer, colorBuffer, programs, status, clock, screenModel, positionModel, velocityModel;


var wvp = new Float32Array(16);
var projection = new Float32Array(16);
var view = new Float32Array(16);
var world = new Float32Array(16);
var eyePosition = new Float32Array(3);
var resolution = new Float32Array([width, height]);

var uniforms = {};


/*
 * Initialize gl and set up buffers
 */
function init() {
	canvas = $("#canvas")[0];
	gl = tdl.webgl.setupWebGL(canvas);

	window.onresize = function() { scaleViewport(canvas, gl); };
	scaleViewport(canvas, gl);

	stats = setUpStats();
	clock = tdl.clock.createClock();



	// Setup Buffers
	positionBuffer = new DoubleBuffer(NUM_PARTICLES_X, NUM_PARTICLES_Y, true);
	positionBuffer.setTexParameter(gl.TEXTURE_WRAP_S, gl.REPEAT);
	positionBuffer.setTexParameter(gl.TEXTURE_WRAP_T, gl.REPEAT);
	positionBuffer.setTexParameter(gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	positionBuffer.setTexParameter(gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	velocityBuffer = new DoubleBuffer(NUM_PARTICLES_X, NUM_PARTICLES_Y, true);
	velocityBuffer.setTexParameter(gl.TEXTURE_WRAP_S, gl.REPEAT);
	velocityBuffer.setTexParameter(gl.TEXTURE_WRAP_T, gl.REPEAT);
	velocityBuffer.setTexParameter(gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	velocityBuffer.setTexParameter(gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	colorBuffer = new DoubleBuffer(NUM_PARTICLES_X, NUM_PARTICLES_Y, true);
	colorBuffer.setTexParameter(gl.TEXTURE_WRAP_S, gl.REPEAT);
	colorBuffer.setTexParameter(gl.TEXTURE_WRAP_T, gl.REPEAT);
	colorBuffer.setTexParameter(gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	colorBuffer.setTexParameter(gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	//set up projection matrix
	//tdl.fast.matrix4.ortho(projection, -1, 1, -1, 1, 0, -1);
	tdl.fast.matrix4.perspective(projection, Math.PI/3.0, canvas.width/canvas.height, 1, 50);
	
	// Load the programs.
	AJAXProgramLoader(
		{
			screen: { vert: 'glsl/particles.vert', frag: 'glsl/particles.frag' },
			gravity_pos: { vert: 'glsl/identity.vert', frag: 'glsl/gravity_pos.frag' },
			gravity_vel: { vert: 'glsl/identity.vert', frag: 'glsl/gravity_vel.frag' },
			init_vel: { vert: 'glsl/identity.vert', frag: 'glsl/init_vel.frag' },
			init_pos: { vert: 'glsl/identity.vert', frag: 'glsl/init_pos.frag' },
			init_color: { vert: 'glsl/identity.vert', frag: 'glsl/init_color.frag' }
		}, 
		start
	)
}

function initParticles() {
	var positions = new tdl.primitives.AttribBuffer(4, NUM_PARTICLES);
	var indices = new tdl.primitives.AttribBuffer(3, NUM_PARTICLES, 'Uint16Array');
	for (var x = 0; x < NUM_PARTICLES_X; x++)
		for (var y = 0; y < NUM_PARTICLES_Y; y++)
			positions.push([x/NUM_PARTICLES_X, y/NUM_PARTICLES_Y, 0.0, 1.0]);
	for (var i = 0; i < NUM_PARTICLES; i++)
		indices.push([i]);
	return {
		position: positions,
		indices: indices
	}
}

/*
 * After the programs are loaded, start rendering
 */
function start(loaded) {
	programs = loaded;
	sq= square();
	p = initParticles();

	uniforms.seed = new Float32Array([Math.random(), Math.random(), Math.random(), Math.random()]);
	initPosModel = new tdl.models.Model(programs.init_pos, sq, null);
	positionBuffer.bind();
	initPosModel.drawPrep();
	initPosModel.draw(uniforms);
	positionBuffer.unbind();
	positionBuffer.swap();

	uniforms.position_data = positionBuffer.texture;
	uniforms.seed = new Float32Array([Math.random(), Math.random(), Math.random(), Math.random()]);
	initVelModel = new tdl.models.Model(programs.init_vel, sq, null);
	velocityBuffer.bind();
	initVelModel.drawPrep();
	initVelModel.draw(uniforms);
	velocityBuffer.unbind();
	velocityBuffer.swap();

	uniforms.position_data = positionBuffer.texture;
	uniforms.velocity_data = velocityBuffer.texture;
	initColorModel = new tdl.models.Model(programs.init_color, sq, null);
	colorBuffer.bind();
	initColorModel.drawPrep();
	initColorModel.draw(uniforms);
	colorBuffer.unbind();
	colorBuffer.swap();

	positionModel = new tdl.models.Model(programs.gravity_pos, sq, null);
	velocityModel = new tdl.models.Model(programs.gravity_vel, sq, null);
	screenModel = new tdl.models.Model(programs.screen, p, null, gl.POINTS);


	tdl.webgl.requestAnimationFrame(render, canvas);
	return true;
}

var theta = 0.0;
/*
 * Main render loop
 */
function render() {
	tdl.webgl.requestAnimationFrame(render, canvas);

	gl.colorMask(true, true, true, true);
	gl.depthMask(true);
	gl.clearColor(0,0,0,0);
	gl.clearDepth(1);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

	uniforms.position_data = positionBuffer.texture;
	uniforms.velocity_data = velocityBuffer.texture;
	uniforms.color_data = colorBuffer.texture;

	positionBuffer.bind();
	positionModel.drawPrep();
	positionModel.draw(uniforms);
	positionBuffer.unbind();

	velocityBuffer.bind();
	velocityModel.drawPrep();
	velocityModel.draw(uniforms);
	velocityBuffer.unbind();

	velocityBuffer.swap();
	positionBuffer.swap();
	uniforms.position_data = positionBuffer.texture;
	uniforms.velocity_data = velocityBuffer.texture;
	uniforms.color_data = colorBuffer.texture;

	//compute new uniforms
	tdl.fast.matrix4.scaling(world, [zoom, zoom, zoom]);
	tdl.fast.matrix4.translate(world, focus);
	//tdl.fast.matrix4hjk
	//tdl.fast.identity4(world);
	tdl.fast.matrix4.lookAt(view, [Math.sin(theta) * 4,0,Math.cos(theta) * 4], [0,0,0], [0,1,0])
	theta += 0.001;

	tdl.fast.matrix4.mul(wvp, view, projection);
	tdl.fast.matrix4.mul(wvp, world, wvp);

	uniforms.wvp = wvp
	uniforms.world = world;
	uniforms.view = view;
	uniforms.projection = projection;
	

  gl.enable(gl.BLEND);
	gl.enable(gl.CULL_FACE);
	//gl.enable(gl.DEPTH_TEST);
	gl.blendEquation(gl.FUNC_ADD);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	//draw the frontbuffer to the screen
	screenModel.drawPrep();
	screenModel.draw(uniforms);
  gl.disable(gl.BLEND);


	stats.update();
}
