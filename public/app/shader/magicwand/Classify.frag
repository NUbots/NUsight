/**
 * The classification value to use when classifying new colours
 */
uniform float classification;

void main() {
	gl_FragColor = vec4(classification, classification, classification, 255.0) / 255.0;
}
