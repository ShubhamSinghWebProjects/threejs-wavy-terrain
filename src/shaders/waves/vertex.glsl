precision mediump float;

uniform float uTime;
uniform vec3 mousePos;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
attribute vec3 position;
attribute vec2 uv;
attribute float aRandom;
attribute float size;
varying vec2 vUv;
varying float vDist;  

void main() {   
    vUv = uv;
    vec3 pos = position;
    float distance = length(pos.xy - mousePos.xy);
    float effect = smoothstep(0.0, 0.3, distance)*3.0;
    pos.z += aRandom * 0.3 * sin(uTime * 0.5) * effect;

    vDist = distance;

    vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_PointSize = size * (300.0 / -viewPosition.z)*0.05;
    gl_Position = projectedPosition;
}
