/* 
vim:ft=glsl 
*/
#ifdef GL_ES
precision highp float;
#endif
varying vec2 coord;
uniform sampler2D frontbuffer;

void main(void)
{
	gl_FragColor = texture2D(frontbuffer, coord);
}
