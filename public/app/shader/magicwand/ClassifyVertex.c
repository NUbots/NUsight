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
 * The original raw (e.g. YCbCr) colour from the image that is being classified
 */
varying vec4 rawColour;

void main() {
	// Render a single pixel
	gl_PointSize = 1.0;
	// The geometry is assumed to be the raw (e.g. YCbCr) colours of the image
	// Normalize them to the range [0-1]
	rawColour = vec4(position, 255.0) / 255.0;
	// Get the lut index of the colour
	float index = getLutIndex(rawColour, bitsR, bitsG, bitsB);
	// Convert the lut index into a 2D texture coordinate that ranges from [0-lutSize]
	vec2 coordinate = getCoordinate(index, lutSize) * lutSize;
	// Move the vertex to the given coordinate so that it may be classified
    gl_Position = projectionMatrix * modelViewMatrix * vec4(coordinate, 0.5, 1.0);
}
