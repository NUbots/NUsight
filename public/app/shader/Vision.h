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

vec2 getCoordinate(float index, float size) {
	// Calculates the x and y coordinates of the 2D texture given the 1D index.
	// Adds 0.5 as we want the coordinates to go through the center of the pixel.
	// e.g. Go go through the center of pixel (0, 0) you need to sample at (0.5, 0.5).
	float x = (mod(index, size) + 0.5) / size;
	float y = (floor(index / size) + 0.5) / size;
	return vec2(x, y);
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
	// Get the texture coordinate given the 1D lut index
	vec2 coordinate = getCoordinate(index, size);
	// Flip the y lookup using (1 - x) as the LUT has been flipped with UNPACK_FLIP_Y_WEBGL.
	// Texture has only one channel, so only one component (texel.r) is needed.
	// Normalize to 0 - 255 range.
	// Round result using floor(x + 0.5) to remove any precision errors.
	coordinate.y = 1.0 - coordinate.y;
	return floor(texture2D(lut, coordinate).r * 255.0 + 0.5);
}
