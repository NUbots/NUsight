const float T_UNCLASSIFIED = 117.0;
const float T_WHITE = 119.0; // line
const float T_GREEN = 103.0; // field
const float T_YELLOW = 121.0; // goal
const float T_ORANGE = 111.0; // ball
const float T_CYAN = 99.0;
const float T_MAGENTA = 109.0;

const int FORMAT_GREY = 0x59455247;
const int FORMAT_Y12  = 0x20323159;
const int FORMAT_Y16  = 0x20363159;
const int FORMAT_Y411 = 0x31313459;
const int FORMAT_UYVY = 0x59565955;
const int FORMAT_YUYV = 0x56595559;
const int FORMAT_YM24 = 0x34324d59;
const int FORMAT_RGB3 = 0x33424752;
const int FORMAT_JPEG = 0x4745504a;

//bayer formats
const int FORMAT_GRBG = 0x47425247;
const int FORMAT_RGGB = 0x42474752;
const int FORMAT_GBRG = 0x47524247;
const int FORMAT_BGGR = 0x52474742;
const int FORMAT_GR12 = 0x32315247;
const int FORMAT_RG12 = 0x32314752;
const int FORMAT_GB12 = 0x32314247;
const int FORMAT_BG12 = 0x32314742;
const int FORMAT_GR16 = 0x36315247;
const int FORMAT_RG16 = 0x36314752;
const int FORMAT_GB16 = 0x36314247;
const int FORMAT_BG16 = 0x36314742;

const int COLOUR_SPACE_YCBCR = 1;
const int COLOUR_SPACE_RGB = 2;

float round(float value) {
	return floor(value + 0.5);
}

/**
 * Get the lookup table index given an RGBA colour
 * @param {vec4} The RGBA colour
 * @return The lookup table index;
 */
float getLutIndex(vec3 colour, float bitsR, float bitsG, float bitsB) {
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

float getLutIndex(vec4 colour, float bitsR, float bitsG, float bitsB) {
	return getLutIndex(colour.rgb * 255.0, bitsR, bitsG, bitsG);
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
	float x = mod(index, size) + 0.5;
	float y = floor(index / size) + 0.5;
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
 * @param {vec4} colour The RGB colour to classify.
 * @param {sampler2D} lut The square lookup table texture to be used for classification.
 * @param {float} size The size of the square lookup table texture.
 * @return {float} The classification of the given colour, ranging between 0-255.
 */
float classify(vec3 colour, sampler2D lut, float size, float bitsR, float bitsG, float bitsB) {
	// Find the appropriate 1D lookup index given a colour
	float index = getLutIndex(colour, bitsR, bitsG, bitsB);
	// Get the texture coordinate given the 1D lut index
	vec2 coordinate = getCoordinate(index, size) / size;
	// Get classification colour with the coordinate
	return classify(lut, coordinate);
}

float classify(vec4 colour, sampler2D lut, float size, float bitsR, float bitsG, float bitsB) {
	return classify(colour.rgb * 255.0, lut, size, bitsR, bitsG, bitsB);
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

vec4 sampleRawImage(sampler2D rawImage, int imageWidth, int imageHeight, int imageFormat, vec2 center) {
	vec4 rawColour;

	if (imageFormat == FORMAT_YUYV) {
		float bytesPerPixel = 2.0;
		float rawImageWidth = bytesPerPixel * float(imageWidth);
		float startOffset = 0.5 / rawImageWidth;
		float texelSize = 1.0 / rawImageWidth;
		vec2 coord = center * vec2(float(imageWidth), float(imageHeight));

		float origin = 2.0 * texelSize * floor(coord.x) + startOffset;
		float shift  = 2.0 * mod(floor(coord.x), 2.0);

		vec2 yCoord  = vec2(origin, center.y);
		vec2 cbCoord = vec2(origin + texelSize * (1.0 - shift), yCoord.y);
		vec2 crCoord = vec2(origin + texelSize * (3.0 - shift), yCoord.y);

		float y  = texture2D(rawImage, yCoord).r;
		float cb = texture2D(rawImage, cbCoord).r;
		float cr = texture2D(rawImage, crCoord).r;

		rawColour = vec4(y, cb, cr, 1.0);
	} else if (imageFormat == FORMAT_UYVY) {
        float bytesPerPixel = 2.0;
        float rawImageWidth = bytesPerPixel * float(imageWidth);
        float startOffset = 0.5 / rawImageWidth;
        float texelSize = 1.0 / rawImageWidth;
        vec2 coord = center * vec2(float(imageWidth), float(imageHeight));

		float origin = 2.0 * texelSize * floor(coord.x) + startOffset;
		float shift  = 2.0 * mod(floor(coord.x), 2.0);

		vec2 yCoord  = vec2(origin + texelSize, center.y);
		vec2 cbCoord = vec2(origin - texelSize * shift, yCoord.y);
		vec2 crCoord = vec2(origin + texelSize * (2.0 - shift), yCoord.y);

        float y  = texture2D(rawImage, yCoord).r;
        float cb = texture2D(rawImage, cbCoord).r;
        float cr = texture2D(rawImage, crCoord).r;

        rawColour = vec4(y, cb, cr, 1.0);
    } else {
		// sample from the raw (e.g. YCbCr) image
		rawColour = texture2D(rawImage, center);
	}

	return rawColour;
}

vec4 rgbToYCbCr(vec4 rgba) {
    mat3 mat = mat3(vec3(0.257, -0.148, 0.439), vec3(0.504, -0.291, -0.368), vec3(0.098, 0.439, -0.071));
    return vec4(vec3(16, 128, 128) * mat * rgba.rgb, 1.0);
}

// http://graphics.cs.williams.edu/papers/BayerJGT09/
vec4 bayerToRGB(sampler2D rawImage, vec4 colour, vec2 center2, vec2 resolution, vec2 firstRed) {
    #define fetch(x, y) texture2D(rawImage, vec2(x, y)).r

	firstRed.y = 1.0 - firstRed.y;
	vec4 center = vec4(0.0);
	center.xy = center2;
	center.zw = center2 * resolution + firstRed;
	vec2 invSize = vec2(1.0 / resolution.x, 1.0 / resolution.y);

	vec4 xCoord = vec4(0.0);
	vec4 yCoord = vec4(0.0);
	xCoord = center.x + vec4(-2.0 * invSize.x, -invSize.x, invSize.x, 2.0 * invSize.x);
    yCoord = center.y + vec4(-2.0 * invSize.y, -invSize.y, invSize.y, 2.0 * invSize.y);

	float C = texture2D(rawImage, center.xy).r; // ( 0, 0)
    const vec4 kC = vec4( 4.0,  6.0,  5.0,  5.0) / 8.0;

    // Determine which of four types of pixels we are on.
    vec2 alternate = mod(floor(center.zw), 2.0);

    vec4 Dvec = vec4(
        fetch(xCoord[1], yCoord[1]),  // (-1,-1)
        fetch(xCoord[1], yCoord[2]),  // (-1, 1)
        fetch(xCoord[2], yCoord[1]),  // ( 1,-1)
        fetch(xCoord[2], yCoord[2])); // ( 1, 1)       

    vec4 PATTERN = (kC.xyz * C).xyzz;

    // Can also be a dot product with (1,1,1,1) on hardware where that is
    // specially optimized.
    // Equivalent to: D = Dvec[0] + Dvec[1] + Dvec[2] + Dvec[3];
    Dvec.xy += Dvec.zw;
    Dvec.x  += Dvec.y;
        
    vec4 value = vec4(  
        fetch(center.x, yCoord[0]),   // ( 0,-2)
        fetch(center.x, yCoord[1]),   // ( 0,-1)
        fetch(xCoord[0], center.y),   // (-1, 0)
        fetch(xCoord[1], center.y));  // (-2, 0)
             
    vec4 temp = vec4(
        fetch(center.x, yCoord[3]),   // ( 0, 2)
        fetch(center.x, yCoord[2]),   // ( 0, 1)
        fetch(xCoord[3], center.y),   // ( 2, 0)
        fetch(xCoord[2], center.y));  // ( 1, 0)

    // Even the simplest compilers should be able to constant-fold these to avoid the division.
    // Note that on scalar processors these constants force computation of some identical products twice.
    const vec4 kA = vec4(-1.0, -1.5,  0.5, -1.0) / 8.0;
    const vec4 kB = vec4( 2.0,  0.0,  0.0,  4.0) / 8.0;
    const vec4 kD = vec4( 0.0,  2.0, -1.0, -1.0) / 8.0;        
            
    // Conserve constant registers and take advantage of free swizzle on load
    #define kE (kA.xywz)
    #define kF (kB.xywz)
    
    value += temp;
    
    // There are five filter patterns (identity, cross, checker,
    // theta, phi).  Precompute the terms from all of them and then
    // use swizzles to assign to color channels. 
    //
    // Channel   Matches
    //   x       cross   (e.g., EE G)
    //   y       checker (e.g., EE B)
    //   z       theta   (e.g., EO R)
    //   w       phi     (e.g., EO R)
    
    #define A (value[0])
    #define B (value[1])
    #define D (Dvec.x)
    #define E (value[2])
    #define F (value[3])
    
    // Avoid zero elements. On a scalar processor this saves two MADDs and it has no
    // effect on a vector processor.
    PATTERN.yzw += (kD.yz * D).xyy;

    PATTERN += (kA.xyz * A).xyzx + (kE.xyw * E).xyxz;
    PATTERN.xw  += kB.xw * B;
    PATTERN.xz  += kF.xz * F;
    
    
    return vec4((alternate.y == 0.0) ?
        ((alternate.x == 0.0) ?
            vec3(C, PATTERN.xy) :
            vec3(PATTERN.z, C, PATTERN.w)) :
        ((alternate.x == 0.0) ?
            vec3(PATTERN.w, C, PATTERN.z) :
            vec3(PATTERN.yx, C)), 1.0);
}
