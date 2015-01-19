varying vec4 colour;

#define M_PI 3.1415926535897932384626433832795

void main() {
	float distFromCenter = abs(distance(vec2(0.5, 0.5), gl_PointCoord));
	if (distFromCenter > 0.5) {
		discard;
	}

	float alpha = max(-exp(50.0 * distFromCenter - 24.0) + 1.0, 0.0);
	gl_FragColor.rgb = colour.rgb * (sin(M_PI * gl_PointCoord.y) * 0.5 + 0.5) * (sin(M_PI * gl_PointCoord.x) * 0.5 + 0.5);
	gl_FragColor.a = 1.0;//alpha;
}
