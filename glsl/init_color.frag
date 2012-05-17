/* 
vim:ft=glsl 
*/
#ifdef GL_ES
precision highp float;
#endif
varying vec2 coord;
uniform sampler2D velocity_data;
uniform sampler2D position_data;

void main(void)
{   
	vec4 pos = texture2D(position_data, coord.xy);
	gl_FragColor = pos;
}
