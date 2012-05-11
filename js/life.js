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
var gl, model, lifeBuffer, backBuffer, programs, status, clock;

var quality = 1.0;
var width = 2048;
var height = 1024;
var zoom = 1.0;
var focus = [0,0,0];
var mouse_coord = [0,0];
var mouse_down = false;

var projection = new Float32Array(16);
var view = new Float32Array(16);
var world = new Float32Array(16);
var eyePosition = new Float32Array(3);
var resolution = new Float32Array([width, height]);

var uniforms = {
	projection: projection,
	resolution: resolution,
	mouse_coord: mouse_coord,
	world: world
};

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
 * Calculate the zoom
 */
function wheelzoom(jq_event) {
	evt = jq_event.originalEvent;
	zoom += zoom * evt.wheelDelta / 1000.0;
	zoom = Math.max(1,zoom);
	focusmouse(jq_event);
}

/*
 * Track with the mouse
 */
function focusmouse(jq_event) {
	evt = jq_event.originalEvent;
	mouse_coord[0] = ( evt.clientX / window.innerWidth ) * 2 - 1;
	mouse_coord[1] = -( evt.clientY / window.innerHeight ) * 2 + 1;
	focus[0] = -mouse_coord[0] * (zoom-1);
	focus[1] = -mouse_coord[1] * (zoom-1);
}

/*
 * Initialize gl and set up buffers
 */
function init() {
	canvas = $("#canvas")[0];
	gl = tdl.webgl.setupWebGL(canvas);

	window.onresize = function() { scaleViewport(canvas, gl, quality); };

	$('#canvas').bind( 'mousewheel', wheelzoom);
	$('#canvas').bind( 'mousemove', focusmouse);
	$('#canvas').bind( 'mousedown', function(evt) { mouse_down = true; } );
	$('#canvas').bind( 'mouseup', function(evt) { mouse_down = false; } );

	scaleViewport(canvas, gl, quality);

	stats = setUpStats();
	clock = tdl.clock.createClock();


	// Setup Buffers
	lifeBuffer = new DoubleBuffer(width,height);
	lifeBuffer.setTexParameter(gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	lifeBuffer.setTexParameter(gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	lifeBuffer.setTexParameter(gl.TEXTURE_WRAP_S, gl.REPEAT);
	lifeBuffer.setTexParameter(gl.TEXTURE_WRAP_T, gl.REPEAT);

	//set up projection matrix
	tdl.fast.matrix4.ortho(projection, -1, 1, -1, 1, 0, -1);
	
	// Load the programs.
	AJAXProgramLoader(
		{
			life: { vert: 'glsl/identity.vert', frag: 'glsl/life.frag' },
			screen: { vert: 'glsl/wvp.vert', frag: 'glsl/tex2frag.frag' },
			random: { vert: 'glsl/identity.vert', frag: 'glsl/random.frag' } 
		}, 
		start
	)

}

/*
 * After the programs are loaded, start rendering
 */
function start(loaded) {
	programs = loaded;
	sq= square();
	lifeModel = new tdl.models.Model(programs.life, sq, null);
	screenModel = new tdl.models.Model(programs.screen, sq, null);

	loadRandomness(lifeBuffer);
	lifeBuffer.swap();
	
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

	gl.enable(gl.CULL_FACE);
	gl.enable(gl.DEPTH_TEST);

	//compute new uniforms
	uniforms.frontbuffer = lifeBuffer.texture;
	uniforms.mouse_down = mouse_down;

	tdl.fast.matrix4.translation(world, focus);
	tdl.fast.matrix4.scale(world, [zoom, zoom, zoom]);
	
	//draw new frontbuffer
	lifeBuffer.bind();
	lifeModel.drawPrep();
	lifeModel.draw(uniforms);
	lifeBuffer.unbind();
	//swap buffers
	lifeBuffer.swap()

	//draw the frontbuffer to the screen
	uniforms.frontbuffer = lifeBuffer.texture;
	screenModel.drawPrep();
	screenModel.draw(uniforms);


	stats.update();
}
