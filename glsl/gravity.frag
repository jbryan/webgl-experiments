/* 
vim:ft=glsl 
*/
#ifdef GL_ES
precision highp float;
#endif
varying vec2 coord;
uniform sampler2D particle_data;

float gravity = 0.0000004;
vec2 center = vec2(0.0,0.0);

void main(void)
{   
	vec4 sample = texture2D(particle_data, coord);
  vec2 speed = sample.zw;
  vec2 position = sample.xy;
  vec2 accel = -gravity / distance(center, position) * normalize(position - center);

	// update speed and accel
	speed += accel ;
	position += speed;
	gl_FragColor = vec4(position, speed);
}
