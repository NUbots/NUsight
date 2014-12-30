/**
 * @author Brendan Annable
 *
 * This shader has been designed to be a fast alternative to rendering a real-time image classification display instead
 * of using the previously used canvas 2D.
 *
 * Possible extension: Extend the shader to be able to add classifications by rendering to an off-screen texture, which
 * will then be used as the new lookup table.
 */

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
 * The RGBA image
 */
uniform sampler2D image;
/**
 * The raw (e.g. YCbCr) image
 */
uniform sampler2D rawImage;
/**
 * The raw underlay opacity percentage ranging between 0-1
 */
uniform float rawUnderlayOpacity;
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
 * The coordinate of the current pixel, usually just maps to the current UV coordinate
 */
varying vec2 center;

void main() {
	// sample from the raw (e.g. YCbCr) image
	vec4 rawColour = texture2D(rawImage, vec2(1.0 - center.x, 1.0 - center.y));
	// classify using the raw image
	float classification = classify(rawColour, lut, lutSize, bitsR, bitsG, bitsB);

	if (classification == T_UNCLASSIFIED) {
		// if fragment is not classified, sample from the displayable RGBA image
		vec4 colour = texture2D(image, center);
		gl_FragColor = colour * rawUnderlayOpacity;
	} else {
		// convert classification into RGBA colour
		gl_FragColor = getColour(classification);
	}
}

