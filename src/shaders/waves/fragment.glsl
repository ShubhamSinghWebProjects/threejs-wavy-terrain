precision mediump float;
uniform sampler2D pointTexture;
uniform float uTime;
uniform vec3 color;  // Add this line
varying vec2 vUv;
varying float vDist;  // Add this line

void main() {
    float distEffect = 1.0 - smoothstep(0.0, 0.5, vDist);  // Calculate effect based on distance
    vec3 finalColor = mix(vec3(vUv, sin(uTime)), color, distEffect);  // Mix the original color with the new color based on distance effect

    gl_FragColor = vec4(finalColor, 1.0);
    gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
}
