#define T_UNCLASSIFIED 117.0
#define T_WHITE 119.0 // line
#define T_GREEN 103.0 // field
#define T_YELLOW 121.0 // goal
#define T_ORANGE 111.0 // ball
#define T_CYAN 99.0
#define T_MAGENTA 109.0

uniform sampler2D lut;
uniform sampler2D image;
uniform sampler2D rawImage;
uniform float rawUnderlayOpacity;
uniform int bitsR;
uniform int bitsG;
uniform int bitsB;

varying vec2 center;

float getLutIndex(vec4 colour) {
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
	index = index + floor(255.0 * colour.r / exp2(bitsRemovedR));
	index = index * exp2(bitsG);
	index = index + floor(255.0 * colour.g / exp2(bitsRemovedG));
	index = index * exp2(bitsB);
	index = index + floor(255.0 * colour.b / exp2(bitsRemovedB));

	return index;
}

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

float classify(vec4 colour, sampler2D lut, float size) {
	// Find the appropriate 1D lookup index given a colour
	float index = getLutIndex(colour);
	// Calculates the x and y coordinates of the 2D texture given the 1D index.
	// Adds 0.5 as we want the coordinates to go through the center of the pixel
	// e.g. Go go through the center of pixel (0, 0) you need to sample at (0.5, 0.5)
	float x = (mod(index, size) + 0.5) / size;
	float y = (floor(index / size) + 0.5) / size;
	// Flip the y lookup using (1 - x) as the LUT has been flipped with UNPACK_FLIP_Y_WEBGL
	// Texture has only one channel, so only one component (tex.r) is needed.
	// Normalize to 0 - 255 range
	// Round result using floor(x + 0.5) to remove any precision errors
	return floor(texture2D(lut, vec2(x, 1.0 - y)).r * 255.0 + 0.5);
}

void main() {
	vec4 rawColour = texture2D(rawImage, vec2(1.0 - center.x, 1.0 - center.y));
	vec4 colour = texture2D(image, center);
	float classification = classify(rawColour, lut, 512.0);
	if (classification == T_UNCLASSIFIED) {
		gl_FragColor = colour * rawUnderlayOpacity;
	} else {
		gl_FragColor = getColour(classification);
	}
//	gl_FragColor = mix(gl_FragColor, colour, rawUnderlayOpacity);
}
