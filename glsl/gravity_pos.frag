/* 
vim:ft=glsl 
*/
#ifdef GL_ES
precision highp float;
#endif
varying vec2 coord;
uniform sampler2D velocity_data;
uniform sampler2D position_data;
uniform vec4 seed;

#define DIA 0.3

float rand(vec2 co){
	//stolen from http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
void main(void)
{   
	vec3 vel = texture2D(velocity_data, coord).xyz;
	vec3 pos = texture2D(position_data, coord).xyz;
	if (length(pos) < DIA) {
		float dist = rand(coord + seed[0]);
		gl_FragColor.xyz = vec3(DIA + dist,0.0,0.0);
		gl_FragColor.w = 1.0;
		return;
	}

	pos += vel;
	gl_FragColor = vec4(pos, 1.0);
}
