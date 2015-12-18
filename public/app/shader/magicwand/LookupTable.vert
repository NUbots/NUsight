varying vec2 center;

void main() {
	center = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
