#version 300 es

precision highp float;

uniform float canvasWidth;
uniform float canvasHeight;

in vec2 position;
in vec2 center;
in vec3 color;

out vec4 vColor;
out vec2 vCenter;

void main() {
    gl_Position = vec4(position*2.0/vec2(canvasWidth, canvasHeight)-1.0, 0.0, 1.0);

    vCenter = center;
    vColor = vec4(color, 1.0);
}
