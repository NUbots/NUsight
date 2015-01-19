#include "Vision.h"

uniform sampler2D lut;
uniform float lutSize;
uniform float bitsR;
uniform float bitsG;
uniform float bitsB;

uniform float scale;
uniform float size;

uniform bool renderRaw;

varying vec4 colour;

void main() {
	vec4 rawColour = vec4(
		position.r / (exp2(bitsR) - 1.0),
		position.g / (exp2(bitsG) - 1.0),
		position.b / (exp2(bitsB) - 1.0),
		1.0
	);

	vec3 positionScaled = 100.0 * rawColour.brg - 50.0;

	vec4 mvPosition = modelViewMatrix * vec4(positionScaled, 1.0);
	gl_PointSize = size * (scale / length(mvPosition.xyz));

	float classification = classify(rawColour, lut, lutSize, bitsR, bitsG, bitsB);
	if (classification == T_UNCLASSIFIED) {
		gl_Position = vec4(0, 0, 2, 1); // put the point behind the camera to discard it
	}
	else {
		if (renderRaw) {
			colour = YCbCrToRGB(rawColour);
		}
		else {
			colour = getColour(classification);
		}
		gl_Position = projectionMatrix * mvPosition;
	}
}

