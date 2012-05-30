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
	vec4 vel = texture2D(velocity_data, coord.xy);
	gl_FragColor.r = length(pos.xyz);
	gl_FragColor.b = 1.0 - length(pos.xyz);
	gl_FragColor.g = length(vel.xyz) * 1000.0;
	gl_FragColor.a = 1.0;
}
