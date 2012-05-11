/* 
vim:ft=glsl 
*/
attribute vec4 position;
uniform sampler2D particle_data;

varying vec4 color;

void main()
{
	vec4 pos;
	vec4 particle = texture2D(particle_data, position.xy);
	pos.xy = particle.xy;
	pos.zw = vec2(position.z,1.0);
	
	color.r = dot(particle.zw, vec2(0.0,1.0))/ length(particle.zw);
	color.g = dot(particle.zw, vec2(1.0,0.0))/ length(particle.zw);
	color.b = dot(particle.zw, vec2(-1.0,0.0))/ length(particle.zw);
  color.a = 1.0;

	gl_PointSize = 6.0;
	gl_Position = pos;
}
