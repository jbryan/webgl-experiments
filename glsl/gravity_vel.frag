/* 
vim:ft=glsl 
*/
#ifdef GL_ES
precision highp float;
#endif
varying vec2 coord;
uniform vec4 seed;
uniform sampler2D velocity_data;
uniform sampler2D position_data;

#define DIA 0.3
#define PI 3.14159265

float gravity = 0.000008;

float rand(vec2 co){
	//stolen from http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(void)
{   
	vec3 vel = texture2D(velocity_data, coord).xyz;
	vec3 pos = texture2D(position_data, coord).xyz;

	if (length(pos) < DIA) {
		float dir = rand(coord + seed[1]) * 2.0 * PI;
		vec3 rand = vec3(0.0, cos(dir), sin(dir)) ;
		gl_FragColor.xyz = rand * 0.003;
		gl_FragColor.w = 1.0;
		return;
	}

  vec3 accel = -gravity / pow(length(pos),2.0) * normalize(pos);

	// update speed and accel
	vel += accel ;
	gl_FragColor = vec4(vel, 1.0);
}
