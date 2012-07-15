/* 
vim:ft=glsl 
*/
#ifdef GL_ES
precision highp float;
#endif
varying vec2 coord;
uniform sampler2D velocity_data;
uniform sampler2D position_data;
uniform sampler2D color_data;
uniform vec4 seed;

float rand(vec2 co){
	//stolen from http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(void)
{   
	vec3 pos = texture2D(position_data, coord.xy).xyz;
	if (length(pos) < 0.1) {
		float dist = rand(coord + seed[0]);
		gl_FragColor.r = dist;
		gl_FragColor.g = 1.0 - dist;
		return;
	}

	gl_FragColor = texture2D(color_data, coord.xy);
}
