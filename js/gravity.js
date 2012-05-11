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
var NUM_PARTICLES_X = 128;
var NUM_PARTICLES_Y = 128;
var NUM_PARTICLES = NUM_PARTICLES_X * NUM_PARTICLES_Y;
//var NUM_PARTICLES = 16;
var width = 512;
var height = 512;
var zoom = 1.0;
var focus = [0,0,0];

var gl, model, particleBuffer, programs, status, clock, screenModel, gravityModel;


var projection = new Float32Array(16);
var view = new Float32Array(16);
var world = new Float32Array(16);
var eyePosition = new Float32Array(3);
var resolution = new Float32Array([width, height]);

var uniforms = {};

/*
 * Function to load random noise
 */
function loadRandomness(buffer) {
	sq= square();
	randomModel = new tdl.models.Model(programs.random, sq, null);
	buffer.bind();
	seed = new Float32Array([Math.random(), Math.random(), Math.random(), Math.random()]);
	randomModel.drawPrep();
	randomModel.draw({seed: seed});
	buffer.unbind();
}



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
	particleBuffer = new DoubleBuffer(NUM_PARTICLES_X, NUM_PARTICLES_Y, true);
	particleBuffer.setTexParameter(gl.TEXTURE_WRAP_S, gl.REPEAT);
	particleBuffer.setTexParameter(gl.TEXTURE_WRAP_T, gl.REPEAT);
	particleBuffer.setTexParameter(gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	particleBuffer.setTexParameter(gl.TEXTURE_MIN_FILTER, gl.NEAREST);

	//set up projection matrix
	tdl.fast.matrix4.ortho(projection, -1, 1, -1, 1, 0, -1);
	
	// Load the programs.
	AJAXProgramLoader(
		{
			screen: { vert: 'glsl/particles.vert', frag: 'glsl/particles.frag' },
			//screen: { vert: 'glsl/wvp.vert', frag: 'glsl/tex2frag.frag' },
			gravity: { vert: 'glsl/identity.vert', frag: 'glsl/gravity.frag' },
			random: { vert: 'glsl/identity.vert', frag: 'glsl/random.frag' } 
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

	screenModel = new tdl.models.Model(programs.screen, p, null, gl.POINTS);
	//screenModel = new tdl.models.Model(programs.screen, sq, null);
	gravityModel = new tdl.models.Model(programs.gravity, sq, null);

	loadRandomness(particleBuffer);
	particleBuffer.swap();
	loadRandomness(particleBuffer);

	tdl.webgl.requestAnimationFrame(render, canvas);
	return true;
}

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


	particleBuffer.bind();
	gravityModel.drawPrep();
	gravityModel.draw({particle_data: particleBuffer.texture});
	particleBuffer.unbind();
	particleBuffer.swap();

	//compute new uniforms
	uniforms.particle_data = particleBuffer.texture;
	tdl.fast.matrix4.translation(world, focus);
	tdl.fast.matrix4.scale(world, [zoom, zoom, zoom]);
	uniforms.world = world;
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
