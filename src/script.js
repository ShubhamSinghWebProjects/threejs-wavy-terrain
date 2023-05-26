import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import vertexShader from './shaders/waves/vertex.glsl'
import fragmentShader from './shaders/waves/fragment.glsl'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import { gsap } from 'gsap';

const BASE_PATH = '/threejs-wavy-terrain'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const pointTexture = textureLoader.load(`${BASE_PATH}/textures/particles/7.png`)


/**
 * Wavy Terrain: Custom Shader
 */


// Geometries
const geometry = new THREE.PlaneGeometry(1, 1, 64, 64)

// Adding a custom attribute to the geometry
const perlin = new ImprovedNoise();
const count = geometry.attributes.position.count
const randoms = new Float32Array(count)
const pSize = new Float32Array(count) // Sizes for points

for (let i = 0; i < count; i++) {
  const x = i % geometry.parameters.widthSegments / geometry.parameters.widthSegments * 10;
  const y = Math.floor(i / geometry.parameters.heightSegments) / geometry.parameters.heightSegments * 10;
  randoms[i] = perlin.noise(x, y, 0);
  pSize[i] = 1.0; // Adjust this value to change the size of the points
}
geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1));
geometry.setAttribute('size', new THREE.BufferAttribute(pSize, 1));


// Material
const material = new THREE.RawShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    pointTexture: { value: pointTexture },
    mousePos: { value: new THREE.Vector3(0, 0, 0) }, // Define mousePos uniform
    color: { value: new THREE.Color('white') }
  },
  vertexShader,
  fragmentShader,
  blending: THREE.AdditiveBlending,
  depthTest: false,
  transparent: true,
  vertexColors: true
});



// Mesh
const points = new THREE.Points(geometry, material)
scene.add(points)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0.25, - 0.25, 1)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/** Adding Mouse Movement */

const mouse = new THREE.Vector2();
const mouse3D = new THREE.Vector3();
let targetMouse3D = new THREE.Vector3();
const raycaster = new THREE.Raycaster();

// Update the mouse position
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Calculate the intersection point
  let intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    targetMouse3D = intersects[0].point;
    
    // Create a GSAP tween to smoothly transition the mouse position
    gsap.to(mouse3D, {
      duration: 0.5,
      x: targetMouse3D.x,
      y: targetMouse3D.y,
      z: targetMouse3D.z,
      onUpdate: function() {
        material.uniforms.mousePos.value = mouse3D;
      }
    });
  }
}, false);


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update material
    material.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()