/* 
vim:ft=glsl 
*/
#ifdef GL_ES
precision highp float;
#endif

varying vec4 color;

void main(void)
{
	float d = 1.0 - 2.0 *distance(gl_PointCoord.xy, vec2(0.5,0.5));
	gl_FragColor = vec4(color.rgb,d);
}
