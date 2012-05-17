/* 
vim:ft=glsl 
*/
#ifdef GL_ES
precision highp float;
#endif
varying vec2 coord;
uniform sampler2D velocity_data;
uniform sampler2D position_data;

float gravity = 0.0000008;
vec3 center = vec3(0.0,0.0,0.0);

void main(void)
{   
	vec3 vel = texture2D(velocity_data, coord).xyz;
	vec3 pos = texture2D(position_data, coord).xyz;
  vec3 accel = -gravity / pow(distance(center, pos),2.0) * normalize(pos - center);

	// update speed and accel
	vel += accel ;
	gl_FragColor = vec4(vel, 1.0);
}
