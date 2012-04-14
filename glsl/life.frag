/* 
vim:ft=glsl 
*/
#ifdef GL_ES
precision highp float;
#endif
varying vec2 coord;
uniform vec2 resolution;
uniform sampler2D backbuffer;
uniform bool mouse_down;
uniform vec2 mouse_coord;

void main(void)
{   
	vec4 sumNeighbors = vec4(0.0,0.0,0.0,0.0);
	sumNeighbors += texture2D(backbuffer, coord + vec2(-1.0,-1.0)/resolution);
	sumNeighbors += texture2D(backbuffer, coord + vec2(-1.0, 0.0)/resolution);
	sumNeighbors += texture2D(backbuffer, coord + vec2(-1.0, 1.0)/resolution);
	sumNeighbors += texture2D(backbuffer, coord + vec2( 0.0,-1.0)/resolution);
	sumNeighbors += texture2D(backbuffer, coord + vec2( 0.0, 1.0)/resolution);
	sumNeighbors += texture2D(backbuffer, coord + vec2( 1.0,-1.0)/resolution);
	sumNeighbors += texture2D(backbuffer, coord + vec2( 1.0, 0.0)/resolution);
	sumNeighbors += texture2D(backbuffer, coord + vec2( 1.0, 1.0)/resolution);

	vec4 cellState = texture2D(backbuffer, coord);

	if (mouse_down) {
		vec2 dist = abs((mouse_coord + 1.0) / 2.0 - coord);
		if (max(dist.x, dist.y) < 0.01) {
			gl_FragColor = vec4(1.0,1.0,1.0,1.0);
		} else {
			gl_FragColor = cellState;
		}
	}
	else {
		for (int i = 0; i < 3; i++) {
			if (cellState[i] > 0.5) {
				//live
				if (sumNeighbors[i] < 1.5)
					gl_FragColor[i] = 0.0;
				else if (sumNeighbors[i] > 1.5 && sumNeighbors[i] < 3.5)
					gl_FragColor[i] = 1.0;
				else 
					gl_FragColor[i] = 0.0;
			}
			else {
				//dead
				if (sumNeighbors[i] > 2.5 && sumNeighbors[i] < 3.5)
					gl_FragColor[i] = 1.0;
				else
					gl_FragColor[i] = 0.0;
			}
		}
	}
}
