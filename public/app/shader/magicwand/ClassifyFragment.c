#include "Vision.h"

/**
 * The width/height of the square lut texture
 */
uniform float lutSize;
/**
 * The square lut texture
 */
uniform sampler2D lut;
/**
 * The raw (e.g. YCbCr) image
 */
uniform sampler2D rawImage;
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
/**
 * The classification to use
 */
uniform float classification;
/**
 * The coordinate of the current pixel, usually just maps to the current UV coordinate
 */
varying vec2 center;

const float MAX_TOLERANCE = 441.6730; // sqrt(255.0 * 255.0 * 3.0);
const float MAX_DISTANCE = 1.7321; // sqrt(1.0 * 3.0);

void main() {
	// TODO
	vec4 rawColour = texture2D(rawImage, 1.0 - center);
	if (distance(rawColour.xyz, colour / 255.0) / MAX_DISTANCE <= tolerance / MAX_TOLERANCE) {
		gl_FragColor = vec4(classification / 255.0, classification / 255.0, classification / 255.0, 1.0);
	} else {
		gl_FragColor = texture2D(lut, vec2(center.x, 1.0 - center.y) + 0.5 / lutSize);
	}
}
