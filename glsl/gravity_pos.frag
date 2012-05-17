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
	vec3 vel = texture2D(velocity_data, coord).xyz;
	vec3 pos = texture2D(position_data, coord).xyz;
	pos += vel;
	gl_FragColor = vec4(pos, 1.0);
}
