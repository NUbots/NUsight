uniform sampler2D lut;
uniform sampler2D image;

varying vec2 center;

float getLutIndex(vec4 color) {
	float bitsR = 6.0;
	float bitsG = 6.0;
	float bitsB = 6.0;
	float bitsRemovedR = 8.0 - bitsR;
	float bitsRemovedG = 8.0 - bitsG;
	float bitsRemovedB = 8.0 - bitsB;

	float index = 0.0;
	// bitwise operators not available in GLSL
	// shift x left by N is equivalent to x = x * 2^N
	// shift x right by N is equivalent to x = floor(x / 2^N)
	index = index + floor(255.0 * color.r / exp2(bitsRemovedR));
	index = index * exp2(bitsG);
	index = index + floor(255.0 * color.g / exp2(bitsRemovedG));
	index = index * exp2(bitsB);
	index = index + floor(255.0 * color.b / exp2(bitsRemovedB));

	return index;
}

vec4 getColor(float classification) {
	vec4 color = vec4(0, 0, 0, 1);
	if (classification == 117.0) { // unclassified / black
		color = vec4(0, 0, 0, 1);
	} else if (classification == 119.0) { // line / white
		color = vec4(1, 1, 1, 1);
	} else if (classification == 103.0) { // field / green
		color = vec4(0, 1, 0, 1);
	} else if (classification == 121.0) { // goal / yellow
		color = vec4(1, 1, 0, 1);
	} else if (classification == 111.0) { // ball / orange
		color = vec4(1, 0.565, 0, 1);
	} else if (classification == 99.0) { // cyan
		color = vec4(0, 1, 1, 1);
	} else if (classification == 109.0) { // magenta
		color = vec4(1, 0, 1, 1);
	}
	return color;
}

float classify(vec4 color, sampler2D lut, float size) {
	// Find the appropriate 1D lookup index given a color
	float index = getLutIndex(color);
	// Calculates the x and y coordinates of the 2D texture given the 1D index.
	// Adds 0.5 as we want the coordinates to go through the center of the pixel
	// e.g. Go go through the center of pixel (0, 0) you need to sample at (0.5, 0.5)
	float x = (mod(index, size) + 0.5) / size;
	float y = (floor(index / size) + 0.5) / size;
	// Flip the y lookup using (1 - x) as the LUT has been flipped with UNPACK_FLIP_Y_WEBGL
	// Texture is 1 channel, so only one component is needed.
	// Normalize to 0 - 255 range
	// Round result using floor(x + 0.5) to remove any precision errors
	return floor(texture2D(lut, vec2(x, 1.0 - y)).r * 255.0 + 0.5);
}

void main() {
	vec4 color = texture2D(image, center);
	gl_FragColor = getColor(classify(color, lut, 512.0));
}
