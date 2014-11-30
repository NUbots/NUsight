#include "Vision.h"

varying vec4 rawColour;

void main() {
	gl_PointSize = 1.0;
	// TODO
	float bitsR = 6.0;
	float bitsG = 6.0;
	float bitsB = 6.0;
	rawColour = vec4(position, 255.0) / 255.0;
	float index = getLutIndex(rawColour, bitsR, bitsG, bitsB);
	vec2 coordinate = getCoordinate(index, 512.0) * 512.0; // TODO
    gl_Position = projectionMatrix * modelViewMatrix * vec4(coordinate, 0.5, 1.0);
}
