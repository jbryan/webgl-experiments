tdl.require('tdl.buffers');
tdl.require('tdl.framebuffers');
tdl.require('tdl.fast');
tdl.require('tdl.clock');
tdl.require('tdl.log');
tdl.require('tdl.math');
tdl.require('tdl.misc');
tdl.require('tdl.models');
tdl.require('tdl.primitives');
tdl.require('tdl.programs');
tdl.require('tdl.textures');
tdl.require('tdl.webgl');

window.onload = init;

var gl, model, frontBuffer, backBuffer, programs, status, clock;

var quality = 1.0;
var width = 4096;
var height = 2048;
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



function loadRandomness(buffer) {

	sq= square();

	randomModel = new tdl.models.Model(programs.random, sq, null);

	buffer.bind();
	seed = new Float32Array([Math.random(), Math.random(), Math.random()]);
	randomModel.drawPrep();
	randomModel.draw({seed: seed});
	buffer.unbind();
}


function wheelzoom(jq_event) {
	evt = jq_event.originalEvent;
	zoom += zoom * evt.wheelDelta / 1000.0;
	zoom = Math.max(1,zoom);
	focusmouse(jq_event);
}

function focusmouse(jq_event) {
	evt = jq_event.originalEvent;
	mouse_coord[0] = ( evt.clientX / window.innerWidth ) * 2 - 1;
	mouse_coord[1] = -( evt.clientY / window.innerHeight ) * 2 + 1;
	focus[0] = -mouse_coord[0] * (zoom-1);
	focus[1] = -mouse_coord[1] * (zoom-1);
}

function start(loaded) {
	programs = loaded;
	sq= square();
	lifeModel = new tdl.models.Model(programs.life, sq, null);
	screenModel = new tdl.models.Model(programs.screen, sq, null);

	loadRandomness(backBuffer);
	render();
	return true;
}

function init() {
	canvas = $("#canvas")[0];
	gl = tdl.webgl.setupWebGL(canvas);

	window.onresize = function() { scaleViewport(canvas, gl); };

	$('#canvas').bind( 'mousewheel', wheelzoom);
	$('#canvas').bind( 'mousemove', focusmouse);
	$('#canvas').bind( 'mousedown', function(evt) { mouse_down = true; } );
	$('#canvas').bind( 'mouseup', function(evt) { mouse_down = false; } );

	scaleViewport(canvas, gl);

	stats = setUpStats();
	clock = tdl.clock.createClock();


	// Setup Buffers
	frontBuffer = new tdl.framebuffers.Framebuffer(width,height);
	frontBuffer.texture.setParameter(gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	//frontBuffer.texture.setParameter(gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	frontBuffer.texture.setParameter(gl.TEXTURE_WRAP_S, gl.REPEAT);
	frontBuffer.texture.setParameter(gl.TEXTURE_WRAP_T, gl.REPEAT);
	backBuffer = new tdl.framebuffers.Framebuffer(width,height);
	backBuffer.texture.setParameter(gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	//backBuffer.texture.setParameter(gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	backBuffer.texture.setParameter(gl.TEXTURE_WRAP_S, gl.REPEAT);
	backBuffer.texture.setParameter(gl.TEXTURE_WRAP_T, gl.REPEAT);

	//set up projection matrix
	tdl.fast.matrix4.ortho(projection, -1, 1, -1, 1, 0, -1);
	
	AJAXProgramLoader(
		{
			life: { vert: 'glsl/identity.vert', frag: 'glsl/life.frag' },
			screen: { vert: 'glsl/wvp.vert', frag: 'glsl/tex2frag.frag' },
			random: { vert: 'glsl/identity.vert', frag: 'glsl/random.frag' } 
		}, 
		start
	)

}

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
	uniforms.backbuffer = backBuffer.texture;
	uniforms.frontbuffer = frontBuffer.texture;
	uniforms.mouse_down = mouse_down;

	tdl.fast.matrix4.translation(world, focus);
	tdl.fast.matrix4.scale(world, [zoom, zoom, zoom]);
	
	//draw new frontbuffer
	frontBuffer.bind();
	lifeModel.drawPrep();
	lifeModel.draw(uniforms);
	frontBuffer.unbind();

	//draw the frontbuffer to the screen
	screenModel.drawPrep();
	screenModel.draw(uniforms);

	//swap buffers
	tmp = backBuffer;
	backBuffer = frontBuffer;
	frontBuffer = tmp;

	stats.update();

}
