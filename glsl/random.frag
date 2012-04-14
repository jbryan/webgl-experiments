/* 
vim:ft=glsl 
*/
#ifdef GL_ES
precision highp float;
#endif
varying vec2 coord;
uniform vec3 seed;

float rand(vec2 co){
	//stolen from http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(void)
{
	float noize_r = rand(coord + seed[0]);
	float noize_g = rand(coord + seed[1]);
	float noize_b = rand(coord + seed[2]);
	gl_FragColor = vec4(noize_r, noize_g, noize_b, 1.0);
}
