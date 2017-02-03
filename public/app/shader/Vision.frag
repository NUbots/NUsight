/**
 * @author Brendan Annable
 */

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
uniform vec2 resolution;
uniform vec2 firstRed;


/**
 * The coordinate of the current pixel, usually just maps to the current UV coordinate
 */
varying vec2 center;

void main() {
	vec4 rawColour = sampleRawImage(rawImage, imageWidth, imageHeight, imageFormat, center);

    // convert into RGBA colour
    if (imageFormat == FORMAT_YUYV) {
	    gl_FragColor = YCbCrToRGB(rawColour);
	} else if (imageFormat == FORMAT_YM24) {
        gl_FragColor = YCbCrToRGB(rawColour);
	} else if(imageFormat == FORMAT_JPEG) {
        gl_FragColor = YCbCrToRGB(rawColour);
	} else if(imageFormat == FORMAT_UYVY) {
        gl_FragColor = YCbCrToRGB(rawColour);
	} else if(imageFormat == FORMAT_GRBG || imageFormat == FORMAT_RGGB || imageFormat == FORMAT_GBRG || imageFormat == FORMAT_BGGR) {
        gl_FragColor = bayerToRGB(rawImage, rawColour, center, resolution, firstRed);
	} else if(imageFormat == FORMAT_RGB3) {
		gl_FragColor = rawColour;
	} else {
		gl_FragColor = rawColour;
	}
}
