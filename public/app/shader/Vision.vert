varying vec4 center;
varying vec4 xCoord;
varying vec4 yCoord;

// Bayer related
uniform vec4 sourceSize;// = vec4(1, 1, 1, 1);
uniform vec2 firstRed;// = vec2(0, 0);

void main() {
	center.xy = uv;
	center.zw = uv * sourceSize.xy + firstRed;

	vec2 invSize = sourceSize.zw;
	xCoord = center.x + vec4(-2.0 * invSize.x, -invSize.x, invSize.x, 2.0 * invSize.x);
	yCoord = center.y + vec4(-2.0 * invSize.y, -invSize.y, invSize.y, 2.0 * invSize.y);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
