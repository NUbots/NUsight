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

/**
 * The coordinate of the current pixel, usually just maps to the current UV coordinate
 */
varying vec2 center;

void main() {
	vec4 rawColour = sampleRawImage(rawImage, imageWidth, imageHeight, imageFormat, center);

    // convert into RGBA colour
    if (imageFormat == FORMAT_YCBCR422) {
	    gl_FragColor = YCbCrToRGB(rawColour);
	} else if (imageFormat == FORMAT_YCBCR444) {
        gl_FragColor = YCbCrToRGB(rawColour);
	} else if(imageFormat == FORMAT_JPEG) {
        gl_FragColor = YCbCrToRGB(rawColour);
	} else if(imageFormat == FORMAT_Y422) {
        gl_FragColor = YCbCrToRGB(rawColour);
	}
}
