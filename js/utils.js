
tdl.require('tdl.programs');
tdl.require('tdl.primitives');
tdl.require('tdl.framebuffers');

function AJAXProgramLoader(programs, success_cb, error_cb) {
	loader = this;
	this.src = {};
	this.programs = {};
	this.loaded = false;
	this.remaining = 0;


	//TODO: these should be prototype functions?
	this.success_cb = success_cb || function() { };
	this.error_cb = error_cb || function(msg) { console.error(msg); };

	$(document).ajaxStop(function() {
		try{
			$(this).unbind("ajaxStop");
			$.each( loader.src, function (key, value) {
				//console.log(value);
				loader.programs[key] = tdl.programs.loadProgram(value.vert, value.frag);
			})
			loader.loaded = true;
			loader.success_cb(loader.programs);
		} catch (err) {
			loader.error_cb(err);
		}
	})
	
	//load each program
	$.each(programs, function (key, value) {
		loader.src[key] = {};

		//load the vertex and fragment shader
		$.each(["vert","frag"], function(index, type) {
			$.ajax({
				url: value[type],
				success: function(data) {
					loader.src[key][type] = data;
					loader.remaining -=1;
				},
				error: function(xhr, stat, msg) { loader.error_cb( { xhr: xhr, stat: stat, msg: msg} ); }
			});
		});
	});
}


function scaleViewport(canvas, gl, quality) {
	if (quality === undefined)
		quality = 1.0;
	canvas.width = window.innerWidth * quality;
	canvas.height = window.innerHeight * quality;
	console.log("Resized to: " + canvas.width + "x" + canvas.height);
	gl.drawingBufferHeight = canvas.height;
	gl.drawingBufferWidth = canvas.width;
	gl.viewport(0,0,canvas.width, canvas.height);
}

/*
 * Sets up the framerate element.
 */
function setUpStats() {
	if (Stats == undefined) return;
	var stats = new Stats();
	stats.getDomElement().style.position = 'absolute';
	stats.getDomElement().style.left = '0px';
	stats.getDomElement().style.top = '0px';

	document.body.appendChild( stats.getDomElement() );
	return stats;
}

/*
 * Creates a simple square.
 */
function square() {
	var positions = new tdl.primitives.AttribBuffer(4, 4);
	var indices = new tdl.primitives.AttribBuffer(3, 2, 'Uint16Array');
	positions.push([-1.0 , -1.0 , 0.0 , 1.0]);
	positions.push([-1.0 , 1.0 , 0.0 , 1.0]);
	positions.push([1.0 , -1.0 , 0.0 , 1.0]);
	positions.push([1.0 , 1.0 , 0.0 , 1.0]);
	indices.push([0,2,1]);
	indices.push([1,2,3]);
	return {
		position: positions,
		indices: indices
	}
}


function DoubleBuffer(width, height, float32) {
	if ( float32 ) {
		this.frontBuffer = new tdl.framebuffers.Float32Framebuffer(width,height);
		this.backBuffer = new tdl.framebuffers.Float32Framebuffer(width,height);
	} else {
		this.frontBuffer = new tdl.framebuffers.Framebuffer(width,height);
		this.backBuffer = new tdl.framebuffers.Framebuffer(width,height);
	}
	console.log("Creating Double Buffer");
}

DoubleBuffer.prototype = {
	get texture() {
		return this.frontBuffer.texture;
	}
}

DoubleBuffer.prototype.setTexParameter = function(type, value) {
	this.frontBuffer.texture.setParameter(type, value);
	this.backBuffer.texture.setParameter(type, value);
}

DoubleBuffer.prototype.bind = function() {
	this.backBuffer.bind();
}

DoubleBuffer.prototype.unbind = function() {
	this.backBuffer.unbind();
}

DoubleBuffer.prototype.swap = function() {
	var temp = this.backBuffer;
	this.backBuffer = this.frontBuffer;
	this.frontBuffer = temp;
}
