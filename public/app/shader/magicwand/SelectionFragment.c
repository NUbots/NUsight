#include "Vision.h"

/**
 * The raw (e.g. YCbCr) image
 */
uniform sampler2D rawImage;
/**
 * The colour to compare with
 */
uniform vec3 colour;
/**
 * The tolerance value
 */
uniform float tolerance;
/**
 * The coordinate of the current pixel, usually just maps to the current UV coordinate
 */
varying vec2 center;

void main() {
	vec4 rawColour = texture2D(rawImage, 1.0 - center);
	// check euclidean distance between rawColour and colour
	// makes sure to keep units in range 0-1
	if (distance(rawColour.xyz, colour / 255.0) / MAX_DISTANCE <= tolerance / MAX_TOLERANCE) {
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	} else {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
	}
}
