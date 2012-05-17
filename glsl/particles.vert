/* 
vim:ft=glsl 
*/
attribute vec4 position;
uniform sampler2D velocity_data;
uniform sampler2D position_data;
uniform sampler2D color_data;

varying vec4 color;

void main()
{
	vec4 pos = texture2D(position_data, position.xy);
	color = texture2D(color_data, position.xy);

	gl_PointSize = 6.0;
	gl_Position = pos;
}
