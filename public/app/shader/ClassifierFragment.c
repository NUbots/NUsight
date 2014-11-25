/**
 * @author Brendan Annable
 *
 * This shader has been designed to be a fast alternative to rendering a real-time image classification display instead
 * of using the previously used canvas 2D.
 *
 * Possible extension: Extend the shader to be able to add classifications by rendering to an off-screen texture, which
 * will then be used as the new lookup table.
 */

const float T_UNCLASSIFIED = 117.0;
const float T_WHITE = 119.0; // line
const float T_GREEN = 103.0; // field
const float T_YELLOW = 121.0; // goal
const float T_ORANGE = 111.0; // ball
const float T_CYAN = 99.0;
const float T_MAGENTA = 109.0;

uniform float lutSize;
uniform sampler2D lut;
uniform sampler2D image;
uniform sampler2D rawImage;
uniform float rawUnderlayOpacity;
uniform float bitsR;
uniform float bitsG;
uniform float bitsB;

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

/**
 * Get the lookup table index given an RGBA colour
 * @param {vec4} The RGBA colour
 * @return The lookup table index;
 */
float getLutIndex(vec4 colour, float bitsR, float bitsG, float bitsB) {
	float bitsRemovedR = 8.0 - bitsR;
	float bitsRemovedG = 8.0 - bitsG;
	float bitsRemovedB = 8.0 - bitsB;

	float index = 0.0;
	// bitwise operators not available in GLSL
	// shift x left by N is equivalent to x = x * 2^N
	// shift x right by N is equivalent to x = floor(x / 2^N)
	// also normalizes to from 0 - 1 to 0 - 255 range
	index = index + floor(255.0 * colour.r / exp2(bitsRemovedR));
	index = index * exp2(bitsG);
	index = index + floor(255.0 * colour.g / exp2(bitsRemovedG));
	index = index * exp2(bitsB);
	index = index + floor(255.0 * colour.b / exp2(bitsRemovedB));

	return index;
}

/**
 * Convert a classification into a RGBA colour
 *
 * @param {float} classification The classification to convert, ranging from 0-255
 * @return {vec4} The RGBA colour
 */
vec4 getColour(float classification) {
	vec4 colour = vec4(0, 0, 0, 1);
	if (classification == T_UNCLASSIFIED) {
		colour = vec4(0, 0, 0, 1);
	} else if (classification == T_WHITE) {
		colour = vec4(1, 1, 1, 1);
	} else if (classification == T_GREEN) {
		colour = vec4(0, 1, 0, 1);
	} else if (classification == T_YELLOW) {
		colour = vec4(1, 1, 0, 1);
	} else if (classification == T_ORANGE) {
		colour = vec4(1, 0.565, 0, 1);
	} else if (classification == T_CYAN) {
		colour = vec4(0, 1, 1, 1);
	} else if (classification == T_MAGENTA) {
		colour = vec4(1, 0, 1, 1);
	}
	return colour;
}

/**
 * Classify a given colour with a given lookup table.
 *
 * @param {vec4} colour The RGBA colour to classify.
 * @param {sampler2D} lut The square lookup table texture to be used for classification.
 * @param {float} size The size of the square lookup table texture.
 * @return {float} The classification of the given colour, ranging between 0-255.
 */
float classify(vec4 colour, sampler2D lut, float size, float bitsR, float bitsG, float bitsB) {
	// Find the appropriate 1D lookup index given a colour
	float index = getLutIndex(colour, bitsR, bitsG, bitsB);
	// Calculates the x and y coordinates of the 2D texture given the 1D index.
	// Adds 0.5 as we want the coordinates to go through the center of the pixel.
	// e.g. Go go through the center of pixel (0, 0) you need to sample at (0.5, 0.5).
	float x = (mod(index, size) + 0.5) / size;
	float y = (floor(index / size) + 0.5) / size;
	// Flip the y lookup using (1 - x) as the LUT has been flipped with UNPACK_FLIP_Y_WEBGL.
	// Texture has only one channel, so only one component (texel.r) is needed.
	// Normalize to 0 - 255 range.
	// Round result using floor(x + 0.5) to remove any precision errors.
	return floor(texture2D(lut, vec2(x, 1.0 - y)).r * 255.0 + 0.5);
}
