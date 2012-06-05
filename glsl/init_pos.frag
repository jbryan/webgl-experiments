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

void main(void)
{
	float noize_r = rand(coord + seed[0]);
	float noize_g = rand(coord + seed[1]);
	float noize_b = rand(coord + seed[2]);
	gl_FragColor.xyz = vec3(noize_r, noize_g, noize_b) * 2.0 - 1.0;
	/*gl_FragColor.xyz = vec3(coord, noize_b) * 2.0 - 1.0;*/
	/*gl_FragColor.z = 0.0;*/
	gl_FragColor.w = 1.0;
}
