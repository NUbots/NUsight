#include "Vision.glsl"

uniform sampler2D lut;
uniform float lutSize;
uniform float bitsR;
uniform float bitsG;
uniform float bitsB;

uniform float scale;
uniform float size;

uniform bool renderRaw;
uniform bool renderCube;

uniform int outputColourSpace;

varying vec4 colour;

void main() {
	// Colours are given via their position attribute
	// Scale colour to the range: [0,1]
	vec4 rawColour = vec4(
		position.r / (exp2(bitsR) - 1.0),
		position.g / (exp2(bitsG) - 1.0),
		position.b / (exp2(bitsB) - 1.0),
		1.0
	);

	// Classify the colour
	float classification = classify(rawColour, lut, lutSize, bitsR, bitsG, bitsB);

	if (!renderCube && classification == T_UNCLASSIFIED) {
		// The colour is unclassified, no need to display it
		// Put the point behind the camera to discard it
		gl_Position = vec4(0, 0, 2, 1);
	}
	else {
		if (renderRaw) {
			// For rendering the raw colour
			colour = YCbCrToRGB(rawColour);
		}
		else {
			// For rendering the classification colour
			colour = getColour(classification);
		}

		vec4 outputColour;
		if (outputColourSpace == COLOUR_SPACE_YCBCR) {
		 	outputColour = rawColour;
		}
		else if (outputColourSpace == COLOUR_SPACE_RGB) {
		 	outputColour = YCbCrToRGB(rawColour);
		}
		// Scale the position to the range [-50,50] as that is the scale of the plot
		vec3 positionScaled = 100.0 * outputColour.brg - 50.0;
		// Transform to eye-space
		vec4 mvPosition = modelViewMatrix * vec4(positionScaled, 1.0);
		// Scale the point size based on distance from the camera (aka. size attenuation)
		gl_PointSize = size * (scale / length(mvPosition.xyz));
		// Transform to clip space and set as position
		gl_Position = projectionMatrix * mvPosition;
	}
}

