/* 
vim:ft=glsl 
*/
uniform mat4 world;
uniform mat4 projection;
attribute vec4 position;
varying vec2 coord;
void main()
{
	coord = (position.xy + 1.0) /  2.0;
	gl_Position = world * projection * position;
}
