/* 
vim:ft=glsl 
*/
#ifdef GL_ES
precision highp float;
#endif
varying vec2 coord;
uniform vec4 seed;

float rand(vec2 co){
	//stolen from http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

float speed_scale = 0.0004;

void main(void)
{
	float noize_r = rand(coord + seed[0]);
	float noize_g = rand(coord + seed[1]);
	float noize_b = rand(coord + seed[2]);
	float noize_a = rand(coord + seed[3]);
	gl_FragColor = (vec4(noize_r, noize_g, noize_b, noize_a)*2.0-1.0) * vec4(1.0,1.0,speed_scale,speed_scale);
}
