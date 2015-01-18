#include "Vision.h"

uniform sampler2D lut;
uniform float lutSize;
uniform float bitsR;
uniform float bitsG;
uniform float bitsB;

varying vec4 colour;

float scale(float value) {
	return 100.0 * value - 50.0;
}

void main() {
	gl_PointSize = 10.0; // TODO

	vec4 rawColour = vec4(
		position.r / (exp2(bitsR) - 1.0),
		position.g / (exp2(bitsG) - 1.0),
		position.b / (exp2(bitsB) - 1.0),
		1.0
	);

	vec3 positionScaled = vec3(
		scale(position.r / (exp2(bitsR) - 1.0)),
		scale(position.g / (exp2(bitsG) - 1.0)),
		scale(position.b / (exp2(bitsB) - 1.0))
	);

	float classification = classify(rawColour, lut, lutSize, bitsR, bitsG, bitsB);
	if (classification == T_UNCLASSIFIED || classification == 0.0) {
		gl_Position = vec4(0, 0, 2, 1); // put the point behind the camera to discard it
	}
	else {
		colour = getColour(classification);
		gl_Position = projectionMatrix * modelViewMatrix * vec4(positionScaled, 1.0);
	}

}

