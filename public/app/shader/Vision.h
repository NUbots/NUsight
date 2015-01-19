const float T_UNCLASSIFIED = 117.0;
const float T_WHITE = 119.0; // line
const float T_GREEN = 103.0; // field
const float T_YELLOW = 121.0; // goal
const float T_ORANGE = 111.0; // ball
const float T_CYAN = 99.0;
const float T_MAGENTA = 109.0;

// The maximum tolerance value i.e. the euclidean distance from (0,0,0) to (255,255,255)
const float MAX_TOLERANCE = 441.6730; // sqrt(255.0 * 255.0 * 3.0);
// The maximum distance value i.e. the euclidean distance from (0,0,0) to (1,1,1)
const float MAX_DISTANCE = 1.7321; // sqrt(1.0 * 3.0);

float round(float value) {
	return floor(value + 0.5);
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
	index = index + floor(colour.r / exp2(bitsRemovedR));
	index = index * exp2(bitsG);
	index = index + floor(colour.g / exp2(bitsRemovedG));
	index = index * exp2(bitsB);
	index = index + floor(colour.b / exp2(bitsRemovedB));

	return round(index);
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

vec2 getCoordinate(float index, float size) {
	// Calculates the x and y coordinates of the 2D texture given the 1D index.
	// Adds 0.5 as we want the coordinates to go through the center of the pixel.
	// e.g. Go go through the center of pixel (0, 0) you need to sample at (0.5, 0.5).
	float x = (mod(index, size) + 0.5);
	float y = (floor(index / size) + 0.5);
	return vec2(x, y);
}

float classify(sampler2D lut, vec2 coordinate) {
	// Flip the y lookup using (1 - x) as the LUT has been flipped with UNPACK_FLIP_Y_WEBGL.
	// Texture has only one channel, so only one component (texel.r) is needed.
	// Normalize to 0 - 255 range.
	// Round result to remove any precision errors.
	coordinate.y = 1.0 - coordinate.y;
	return round(texture2D(lut, coordinate).r * 255.0);
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
	float index = getLutIndex(colour * 255.0, bitsR, bitsG, bitsB);
	// Get the texture coordinate given the 1D lut index
	vec2 coordinate = getCoordinate(index, size) / size;
	// Get classification colour with the coordinate
	return classify(lut, coordinate);
}

/**
 * A function for converting a YCbCr colour to RGBA
 * Based from http://en.wikipedia.org/wiki/YCbCr#JPEG_conversion
 *
 * @param {vec4} ycbcr A 4-component YCbCr array (includes alpha for convenience)
 * @returns {vec4} A converted RGBA colour (alpha untouched)
 */
vec4 YCbCrToRGB(vec4 ycbcr) {
	// conversion numbers have been modified to account for the colour being in the 0-1 range instead of 0-255
	return clamp(vec4(
		ycbcr.r + 1.402 * (ycbcr.b - 128.0 / 255.0),
		ycbcr.r - 0.34414 * (ycbcr.g - 128.0 / 255.0) - 0.71414 * (ycbcr.b - 128.0 / 255.0),
		ycbcr.r + 1.772 * (ycbcr.g - 128.0 / 255.0),
		ycbcr.a
	), 0.0, 1.0);
}
