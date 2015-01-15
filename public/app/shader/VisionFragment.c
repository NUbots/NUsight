/**
 * @author Brendan Annable
 */

#include "Vision.h"

/**
 * The raw (e.g. YCbCr) image
 */
uniform sampler2D rawImage;
/**
 * The coordinate of the current pixel, usually just maps to the current UV coordinate
 */
varying vec2 center;

void main() {
	// sample from the raw (e.g. YCbCr) image
	vec4 rawColour = texture2D(rawImage, center);
	// convert into RGBA colour
	gl_FragColor = YCbCrToRGB(rawColour);
//	gl_FragColor = rawColour;
}
