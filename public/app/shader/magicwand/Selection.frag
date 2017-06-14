#include "Vision.glsl"

/**
 * The raw (e.g. YCbCr) image
 */
uniform sampler2D rawImage;
/**
 * The format of the image, e.g. YCbCr444 or YCbCr422 etc
 */
uniform int imageFormat;
uniform int imageWidth;
uniform int imageHeight;
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

uniform vec2 resolution;
uniform vec2 firstRed;

void main() {
	vec4 rawColour = sampleRawImage(rawImage, imageWidth, imageHeight, imageFormat, center);

	if(imageFormat == FORMAT_GRBG || imageFormat == FORMAT_RGGB || imageFormat == FORMAT_GBRG || imageFormat == FORMAT_BGGR) {
        rawColour = bayerToRGB(rawImage, rawColour, center, resolution, firstRed);
    }

	// check euclidean distance between rawColour and colour
	if (distance(rawColour.rgb * 255.0, colour) <= tolerance) {
		gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
	} else {
		discard;
	}
}
