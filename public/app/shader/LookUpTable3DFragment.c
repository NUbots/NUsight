varying vec4 colour;

#define M_PI 3.1415926535897932384626433832795

void main() {
	gl_FragColor = colour * (sin(M_PI * gl_PointCoord.y) * 0.5 + 0.5) * (sin(M_PI * gl_PointCoord.x) * 0.5 + 0.5);// * (gl_PointCoord.x * gl_PointCoord.y) * 0.2;
	if (abs(distance(vec2(0.5, 0.5), gl_PointCoord)) > 0.5) {
		discard;
	}
//	gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
}
