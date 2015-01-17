/**
 * @author Brendan Annable
 */

#include "Vision.h"

uniform float imageWidth;
uniform float imageHeight;
/**
 * The raw (e.g. YCbCr) image
 */
uniform sampler2D rawImage;
/**
 * The coordinate of the current pixel, usually just maps to the current UV coordinate
 */
varying vec2 center;

vec3 sample(float x, float y) {
	return texture2D(rawImage, center + vec2(x, y)).rgb;
}

vec3 diff(vec4 self, float x, float y) {
	return abs(sample(x, y) - self.rgb);
}

void main() {
	vec3 difference = vec3(0.0, 0.0, 0.0);
	vec4 self = texture2D(rawImage, center);

	for (float y = -1.0; y <= 1.0; y++) {
		for (float x = -1.0; x <= 1.0; x++) {
			difference += diff(self, x / imageWidth, y / imageHeight);
		}
	}
	// convert into RGBA colour
//	gl_FragColor = vec4(vec3(1.0, 0.0, 0.0) * length(difference), 1.0);
	gl_FragColor = vec4(difference, length(difference));
}

