#version 300 es

precision highp float;

uniform float maxRadius;
uniform float canvasWidth;
uniform float canvasHeight;

in vec4 vColor;
in vec2 vCenter;

out vec4 fColor;

void main() {

    float distToCenter = length(gl_FragCoord.xy - vCenter);

    gl_FragDepth = distToCenter / maxRadius;
    fColor = vColor;
}
