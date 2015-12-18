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

vec3 sample(float x, float y) {
	return sampleRawImage(rawImage, imageWidth, imageHeight, imageFormat, center + vec2(x, y)).rgb;
}

vec3 diff(vec4 self, float x, float y) {
	return abs(sample(x, y) - self.rgb);
}

void main() {
	vec3 difference = vec3(0.0, 0.0, 0.0);
	vec4 self = sampleRawImage(rawImage, imageWidth, imageHeight, imageFormat, center);

	for (float y = -1.0; y <= 1.0; y++) {
		for (float x = -1.0; x <= 1.0; x++) {
			difference += diff(self, x / float(imageWidth), y / float(imageHeight));
		}
	}
	// convert into RGBA colour
//	gl_FragColor = vec4(vec3(1.0, 0.0, 0.0) * length(difference), 1.0);
	gl_FragColor = vec4(difference, length(difference));
//	gl_FragColor = diff(self, -1.0 / float(imageWidth), -1.0 / float(imageHeight));
}

