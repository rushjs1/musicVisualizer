import "./styles.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Vector3 } from "three";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import song from "../static/bensound-energy2.mp3";
//import SimplexNoise from "simplex-noise";

////AUDIO //////
/* var noise = new SimplexNoise();
const audioElement = document.getElementById("source");
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 512;
const source = audioContext.createMediaElementSource(audioElement);
source.connect(analyser);
///connect music back to default output which is the speakers/////
source.connect(audioContext.destination);

var bufferLength = analyser.frequencyBinCount;
var dataArr = new Uint8Array(bufferLength);

//analyser.getByteFrequencyData(dataArr);
//analyser.getByteTimeFreData(dataArr);

 */

//canvas and scene and sizes
const canvas = document.querySelector("canvas.webGL");
const scene = new THREE.Scene();
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

////lights
const hemisphericLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.3);
scene.add(hemisphericLight);
const pointLight = new THREE.PointLight(0xff9000, 1, 4.5);
pointLight.position.set(-1, -0.5, 1);
scene.add(pointLight);
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1);
rectAreaLight.position.set(-1.5, 0, 1.5);
scene.add(rectAreaLight);
rectAreaLight.lookAt(new Vector3());

//light helpers - frames

const spotLight = new THREE.SpotLight(0x78ff00, 3, 5, Math.PI * 0.1, 0.25, 1);
spotLight.position.set(0, 2, 3);
scene.add(spotLight);

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
scene.add(pointLightHelper);
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);
window.requestAnimationFrame(() => {
  spotLightHelper.update();
});
const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
scene.add(rectAreaLightHelper);

//helpers
const hemisphereHelper = new THREE.HemisphereLightHelper(hemisphericLight, 0.2);
scene.add(hemisphereHelper);
/* var ambientLight = new THREE.AmbientLight(0xaaaaaa);
scene.add(ambientLight); */

////objects and lights//

const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;

// Objects

///ball start

/* var group = new THREE.Group();

var icosahedronGeometry = new THREE.IcosahedronGeometry(10, 4);
var lambertMaterial = new THREE.MeshLambertMaterial({
  color: 0xff00ee,
  wireframe: true
});

var ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
ball.position.set(-1, 0, 0);
group.add(ball); */
///ball end ////

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
sphere.position.x = -1.5;

const cube1 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), material);

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.2, 32, 64),
  material
);

torus.position.x = 1.5;

const plane = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), material);
plane.rotation.x = -Math.PI * 0.5;
plane.position.y = -0.65;

scene.add(sphere, cube1, torus, plane);

///resize
window.addEventListener("resize", () => {
  //update size
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  //update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

////camera///
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 1;
camera.position.y = 1;
camera.position.z = 15;
scene.add(camera);

//controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//renderer///
const renderer = new THREE.WebGL1Renderer({
  canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//////threejs audio loader//////
const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load("/bensound-energy2.mp3", function(buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);
  console.log(buffer);
});
const analyser = new THREE.AudioAnalyser(sound, 32);

window.addEventListener("keypress", event => {
  if (!sound.isPlaying) {
    sound.play();
  } else {
    sound.pause();
  }
});

///animations///
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  ///Audio ///

  const soundData = analyser.getAverageFrequency();
  //console.log(soundData);

  updateTorus(soundData, 60, 30);

  //update controls
  controls.update();

  //update objects

  cube1.rotation.y = 0.4 * elapsedTime;
  cube1.rotation.x = 0.4 * elapsedTime;
  //torus.rotation.y = 0.2 * soundData;

  //render
  renderer.render(scene, camera);

  //analyser.getByteFrequencyData(dataArr);
  //console.log(dataArr);

  window.requestAnimationFrame(tick);
};

tick();

function updateTorus(data, max, min) {
  console.log((data - min) / (max - min));

  const newVal = (data - min) / (max - min);
  torus.rotation.y = 2 * newVal;
  spotLight.intensity = 1 * newVal;
  pointLight.intensity = 0.4 * newVal;
  //console.log(Math.max(0, Math.min(1, data-min / max-min)))
  // console.log(Math.max(0, Math.min(1, data - min / max - min)));
  //(data - min) / (max - min);
  //torus.geometry.attributes.position.array.forEach(val => {});
}

console.log(spotLight);

///help
