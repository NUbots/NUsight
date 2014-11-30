#include "Vision.h"

/**
 * The number of bits dedicated to the R colour channel
 */
uniform float bitsR;
/**
 * The number of bits dedicated to the G colour channel
 */
uniform float bitsG;
/**
 * The number of bits dedicated to the B colour channel
 */
uniform float bitsB;
/**
 * The colour to compare with
 */
uniform vec3 colour;
/**
 * The tolerance value
 */
uniform float tolerance;

uniform float classification;

varying vec4 rawColour;

const float MAX_TOLERANCE = 441.6730; // sqrt(255.0 * 255.0 * 3.0);
const float MAX_DISTANCE = 1.7321; // sqrt(1.0 * 3.0);

void main() {
//	gl_FragColor = vec4(T_GREEN, T_GREEN, T_GREEN, 255.0) / 255.0;
//	gl_FragColor = vec4(rawColour.rgb, 0.0) / 255.0;
	if (distance(rawColour.xyz, colour / 255.0) / MAX_DISTANCE <= tolerance / MAX_TOLERANCE) {
		gl_FragColor = vec4(classification, classification, classification, 255.0) / 255.0;
	} else {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
	}
}
