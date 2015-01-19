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
 * The width/height of the square lut texture
 */
uniform float lutSize;
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
 * The classification colour of the point
 */
varying vec4 classificationColour;

void main() {
	// Render a single pixel
	gl_PointSize = 1.0;
	// The geometry is assumed to be the raw (e.g. YCbCr) colours of the image
	// Normalize them to the range [0-1]
	vec4 rawColour = vec4(position, 255.0) / 255.0;
	// Get the lut index of the colour
	float index = getLutIndex(rawColour, bitsR, bitsG, bitsB);
	// Convert the lut index into a 2D texture coordinate that ranges from [0-lutSize]
	vec2 coordinate = getCoordinate(index, lutSize) * lutSize;

	// Check if pixel colour is close to the reference colour
	// Converts values to the range [0-1] before comparing
	// Assumes alpha-blending is turned on for the material and uses:
	// Source factor: SrcAlpha,
	// Destination factor: OneMinusSrcAlpha
	// Also assumes the LUT has been rendered 1st
	if (distance(rawColour.xyz, colour / 255.0) / MAX_DISTANCE <= tolerance / MAX_TOLERANCE) {
		// classify the pixel by overwriting current value
		classificationColour = vec4(classification, classification, classification, 255.0) / 255.0;
		// Move the vertex to the given coordinate so that it may be classified
		gl_Position = projectionMatrix * modelViewMatrix * vec4(coordinate, 0.5, 1.0);
	} else {
		gl_Position = vec4(0, 0, 2, 1); // put the point behind the camera to discard it
	}
}
