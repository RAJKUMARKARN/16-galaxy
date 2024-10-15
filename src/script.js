import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

const guiChange = {};
guiChange.count = 100000;
guiChange.size = 0.05; // Increased for visibility
guiChange.radius = 5;
guiChange.branch = 4;
guiChange.spin = 1;
guiChange.randomness = 0.2;
guiChange.randomnessPower = 3; // Added to control randomness falloff

let particleGeometry = null;
let particleMaterial = null;
let particles = null;

const galaxy = () => {
  if (particles !== null) {
    particleGeometry.dispose();
    particleMaterial.dispose();
    scene.remove(particles);
  }

  particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(guiChange.count * 3);
  const colors = new Float32Array(guiChange.count * 3);

  const colorInside = new THREE.Color(0xff6030); // Inner color
  const colorOutside = new THREE.Color(0x1b3984); // Outer color

  for (let i = 0; i < guiChange.count; i++) {
    const i3 = i * 3;
    const radius = Math.random() * guiChange.radius;
    const branchAngle = ((i % guiChange.branch) / guiChange.branch) * Math.PI * 2;
    const spinAngle = radius * guiChange.spin;

    // Randomness power creates a falloff effect on how randomness behaves
    const randomX =
      Math.pow(Math.random(), guiChange.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * guiChange.randomness;
    const randomY =
      Math.pow(Math.random(), guiChange.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * guiChange.randomness;
    const randomZ =
      Math.pow(Math.random(), guiChange.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * guiChange.randomness;

    // Position calculations
    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    // Color interpolation between inside and outside
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / guiChange.radius);

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  particleMaterial = new THREE.PointsMaterial({
    size: guiChange.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true, // Enable vertex colors
  });

  particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
};

galaxy();

gui.add(guiChange, "count").min(100).max(1000000).step(100).onFinishChange(galaxy);
gui.add(guiChange, "size").min(0.0001).max(1).step(0.001).onFinishChange(galaxy);
gui.add(guiChange, "radius").min(0.1).max(20).step(0.1).onFinishChange(galaxy);
gui.add(guiChange, "branch").min(2).max(12).step(1).onFinishChange(galaxy);
gui.add(guiChange, "spin").min(-5).max(5).step(0.001).onFinishChange(galaxy);
gui.add(guiChange, "randomness").min(1.002).max(2).step(0.001).onFinishChange(galaxy);
gui.add(guiChange, "randomnessPower").min(2).max(12).step(1).onFinishChange(galaxy);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Star field
const starGeometry = new THREE.BufferGeometry();
const startPos = new Float32Array(guiChange.count * 3);
for (let i = 0; i < guiChange.count * 3; i++) {
  startPos[i] = (Math.random() - 0.5) * camera.position.distanceTo(particles.position) * 50;
}
starGeometry.setAttribute("position", new THREE.BufferAttribute(startPos, 3));
const points = new THREE.Points(
  starGeometry,
  new THREE.PointsMaterial({ size: 0.001, sizeAttenuation: true })
);
scene.add(points);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  
  // Rotate points and particles
  points.rotation.y = elapsedTime / 8;
  particles.rotation.y = elapsedTime / 8;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
document.getElementById("getStartedBtn").addEventListener("click", () => {
  window.location.href = "loginSignup.html";
});