/**
 * @author Brendan Annable
 *
 * Vision/image related utility methods
 *
 * Known usages: The Vision and Classifier windows
 */
Ext.define('NU.util.Vision', {
	singleton: true,
	/**
	 * A method for converting an RGB array to YCbCr
	 * Based from http://en.wikipedia.org/wiki/YCbCr#JPEG_conversion
	 *
	 * @param {Array} rgb A 3-component RGB array
	 * @returns {Uint8ClampedArray} A converted YCbCr Uint8ClampedArray array
	 */
	RGBtoYCbCr: function (rgb) {
		// Using Uint8ClampedArray automatically clamps the values between 0-255 as expected
		return new Uint8ClampedArray([
			0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2],
			128 - 0.168736 * rgb[0] - 0.331264 * rgb[1] + 0.5 * rgb[2],
			128 + 0.5 * rgb[0] - 0.418688 * rgb[1] - 0.081312 * rgb[2]
		]);
	},
	/**
	 * A method for converting an YCbCr array to RGB
	 * Based from http://en.wikipedia.org/wiki/YCbCr#JPEG_conversion
	 *
	 * @param {Array} ycbcr A 3-component YCbCr array
	 * @returns {Uint8ClampedArray} A converted RGB Uint8ClampedArray array
	 */
	YCbCrtoRGB: function (ycbcr) {
		// Using Uint8ClampedArray automatically clamps the values between 0-255 as expected
		return new Uint8ClampedArray([
			ycbcr[0] + 1.402 * (ycbcr[2] - 128),
			ycbcr[0] - 0.34414 * (ycbcr[1] - 128) - 0.71414 * (ycbcr[2] - 128),
			ycbcr[0] + 1.772 * (ycbcr[1] - 128)
		]);
	},
	YCbCrtoRGB2: function (ycbcr) {
		// from http://en.wikipedia.org/wiki/YCbCr#ITU-R_BT.601_conversion
		return new Uint8ClampedArray([
			255 / 219 * (ycbcr[0] - 16) + 255 / 112 * 0.701 * (ycbcr[2] - 128),
			255 / 219 * (ycbcr[0] - 16) - 255 / 112 * 0.886 * 0.114 / 0.587 * (ycbcr[1] - 128) - 255 / 112 * 0.701 * 0.299 / 0.587 * (ycbcr[2] - 128),
			255 / 219 * (ycbcr[0] - 16) + 255 / 112 * 0.886 * (ycbcr[1] - 128)
		]);
	},
	/**
	 * Calculate the euclidean distance squared between two colours
	 *
	 * @param colourA The first colour
	 * @param colourB The second colour
	 * @returns {number} The euclidean distance squared
	 */
	distanceSquared: function (colourA, colourB) {
		var diffX = colourA[0] - colourB[0];
		var diffY = colourA[1] - colourB[1];
		var diffZ = colourA[2] - colourB[2];
		return diffX * diffX + diffY * diffY + diffZ * diffZ;
	},
	/**
	 * Calculate the euclidean distance between two colours
	 *
	 * @param colourA The first colour
	 * @param colourB The second colour
	 * @returns {number} The euclidean distance
	 */
	distance: function (colourA, colourB) {
		return Math.sqrt(this.distanceSquared(colourA, colourB));
	},
	/**
	 * Calculate whether a colour is within a given distance of another colour
	 *
	 * @param colourA The first colour
	 * @param colourB The second colour
	 * @param distance The euclidean distance (inclusive)
	 * @returns {boolean} True if the two colours are with the distance, false otherwise
	 */
	withinDistance: function (colourA, colourB, distance) {
		// avoid sqrt for speed
		return this.distanceSquared(colourA, colourB) <= distance * distance;
	}
});
