/* 
vim:ft=glsl 
*/
uniform mat4 wvp;
uniform vec3 eye_position;
attribute vec4 position;
uniform sampler2D velocity_data;
uniform sampler2D position_data;
uniform sampler2D color_data;

varying vec4 color;

void main()
{
	vec4 pos = texture2D(position_data, position.xy);
	color = texture2D(color_data, position.xy);

	/*gl_Position = (world * (view * projection)) * pos;*/
	gl_Position = wvp * pos;
	gl_PointSize = 20.0/distance(pos.xyz, eye_position);
	/*gl_PointSize = 3.0;*/
}
