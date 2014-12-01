#include "Vision.h"

/**
 * The colour to compare with
 */
uniform vec3 colour;
/**
 * The tolerance value
 */
uniform float tolerance;
/**
 * The classification value to use when classifying new colours
 */
uniform float classification;
/**
 * The original raw (e.g. YCbCr) colour from the image that is being classified
 */
varying vec4 rawColour;

void main() {
	// Check if pixel colour is close to the reference colour
	// Converts values to the range [0-1] before comparing
	// Assumes alpha-blending is turned on for the material and uses:
	// Source factor: SrcAlpha,
	// Destination factor: OneMinusSrcAlpha
	// Also assumes the LUT has been rendered 1st
	if (distance(rawColour.xyz, colour / 255.0) / MAX_DISTANCE <= tolerance / MAX_TOLERANCE) {
		// classify the pixel by overwriting current value
		gl_FragColor = vec4(classification, classification, classification, 255.0) / 255.0;
	} else {
		// leave value as it already was
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
	}
}
