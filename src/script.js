import "./styles.css";

import * as THREE from "three";
import * as dat from "dat.gui";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Vector3 } from "three";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import song from "../static/bensound-energy2.mp3";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";

import planeVertexShader from "./shaders/flag/vertex.glsl";
import planeFragmentShader from "./shaders/flag/fragment.glsl";
import floorVertexShader from "./shaders/floor/vertex.glsl";
import floorFragmentShader from "./shaders/floor/fragment.glsl";
import perlinColorVertexShader from "./shaders/perlinColor/vertex.glsl";
import perlinColorFragmentShader from "./shaders/perlinColor/fragment.glsl";
import { io } from "socket.io-client";

const gui = new dat.GUI({ width: 340 });

const debugObject = {};
const perlinDebugObject = {};

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

////textures////

const textureLoader = new THREE.TextureLoader();
const soicTexture = textureLoader.load("/soicMask1.jpeg");

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

////objects and lights//

const planeGeo = new THREE.PlaneGeometry(1, 1, 32, 32);

const planeCount = planeGeo.attributes.position.count;
const randomPlane = new Float32Array(planeCount);
for (let i = 0; i < planeCount; i++) {
  randomPlane[i] = Math.random();
}

planeGeo.setAttribute("aRandom", new THREE.BufferAttribute(randomPlane, 1));

const shaderOneMaterial = new THREE.RawShaderMaterial({
  vertexShader: planeVertexShader,
  fragmentShader: planeFragmentShader,
  uniforms: {
    uFrequency: { value: new THREE.Vector2(10, 5) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color("orange") },
    uTexture: { value: soicTexture }
  }
});

const material = new THREE.MeshStandardMaterial();
material.roughness = 0.4;
perlinDebugObject.surfaceColor = "#0087ff";
perlinDebugObject.depthColor = "#88949d";

const perlinColorShaderMaterial = new THREE.ShaderMaterial({
  fragmentShader: perlinColorFragmentShader,
  vertexShader: perlinColorVertexShader,

  uniforms: {
    uTime: { value: 0 },
    uBigWavesElevation: { value: 0.2 },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
    uBigWavesSpeed: { value: 0.75 },
    //color
    uDepthColor: { value: new THREE.Color(perlinDebugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(perlinDebugObject.surfaceColor) },
    uColorOffset: { value: 0.25 },
    uColorMulti: { value: 2 },
    uSoundData: { value: soundData }
  }
});

// Objects

///ball start

var icosahedronGeometry = new THREE.IcosahedronGeometry(40, 16);
var lambertMaterial = new THREE.MeshLambertMaterial({
  color: 0xff00ee,
  wireframe: true
});

var ball = new THREE.Mesh(icosahedronGeometry, perlinColorShaderMaterial);
ball.position.set(0, 0, 0);

///ball end ////
debugObject.depthColor = "#00ffa4";
debugObject.surfaceColor = "#8888ff";
var soundData = 0.0;

const floorMaterial = new THREE.ShaderMaterial({
  vertexShader: floorVertexShader,
  fragmentShader: floorFragmentShader,

  uniforms: {
    uTime: { value: 0 },
    uBigWavesElevation: { value: 0.2 },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
    uBigWavesSpeed: { value: 0.75 },
    //color
    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: { value: 0.25 },
    uColorMulti: { value: 2 },
    uSoundData: { value: soundData }
  }
});

const floorGeo = new THREE.PlaneGeometry(5, 5);
const plane2geo = new THREE.PlaneGeometry(6, 10, 128, 128);

/* spiked floor */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(6, 10, 128, 128),
  floorMaterial
);

/* non spiked */
//const floor = new THREE.Mesh(floorGeo, floorMaterial);

floor.rotation.x = -Math.PI * 0.5;
floor.position.y = -0.65;

const plane2 = new THREE.Mesh(plane2geo, perlinColorShaderMaterial);
plane2.position.z = -2;
plane2.position.y = 1;

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  perlinColorShaderMaterial
);
sphere.position.x = -1.5;
const sphere2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 32, 32),
  perlinColorShaderMaterial
);

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(0.75, 0.75, 0.75),
  perlinColorShaderMaterial
);

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(0.3, 0.2, 32, 64),
  perlinColorShaderMaterial
);

torus.position.x = 1.5;

const plane = new THREE.Mesh(planeGeo, shaderOneMaterial);
//plane.rotation.x = -Math.PI * 0.5;
//plane.position.y = -0.65;
plane.scale.y = 2 / 3;
plane.position.z = 0;
plane.position.y = 1;
plane.position.x = -1;
plane.rotation.y = 0.9;
scene.add(sphere, cube1, torus, plane, floor, plane2, ball);

///gui
/* gui
  .add(floorMaterial.uniforms.uBigWavesElevation, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uBigWavesElevation");

gui
  .add(floorMaterial.uniforms.uBigWavesFrequency.value, "x")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uBigWavesFrequencyX");
gui
  .add(floorMaterial.uniforms.uBigWavesFrequency.value, "y")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uBigWavesFrequencyY");

gui
  .add(floorMaterial.uniforms.uBigWavesSpeed, "value")
  .min(0)
  .max(4)
  .step(0.001)
  .name("uBigWavesSpeed");
 */
gui
  .addColor(debugObject, "depthColor")
  .name("depthColor")
  .onChange(() => {
    floorMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor);
  });
gui
  .addColor(debugObject, "surfaceColor")
  .name("surfaceColor")
  .onChange(() => {
    floorMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor);
  });
gui
  .addColor(perlinDebugObject, "depthColor")
  .name("depthColor")
  .onChange(() => {
    perlinColorShaderMaterial.uniforms.uDepthColor.value.set(
      perlinDebugObject.depthColor
    );
  });

gui
  .addColor(perlinDebugObject, "surfaceColor")
  .name("surfaceColor")
  .onChange(() => {
    perlinColorShaderMaterial.uniforms.uSurfaceColor.value.set(
      perlinDebugObject.surfaceColor
    );
  });
/* gui
  .add(floorMaterial.uniforms.uColorOffset, "value")
  .min(0)
  .max(1)
  .step(0.001)
  .name("uColorOffset");
gui
  .add(floorMaterial.uniforms.uColorMulti, "value")
  .min(0)
  .max(10)
  .step(0.001)
  .name("uColorMulti"); */

const positionAttribute = torus.geometry.getAttribute("position");
const vertex = new THREE.Vector3();
for (
  let vertexIndex = 0;
  vertexIndex < positionAttribute.count;
  vertexIndex++
) {
  vertex.fromBufferAttribute(positionAttribute, vertexIndex);
  console.log(vertex);
}

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
camera.position.z = 1;
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
  //console.log(buffer);
});
const analyser = new THREE.AudioAnalyser(sound, 32);

window.addEventListener("keypress", event => {
  if (!sound.isPlaying) {
    sound.play();
  } else {
    sound.pause();
  }
});
window.addEventListener("touchend", event => {
  if (!sound.isPlaying) {
    sound.play();
  } else {
    sound.pause();
  }
});
let abletonMusicData = null;
//socket io && ableton
var socket = io();
socket.on("musicEmit", function(msg) {
  console.log(msg);
  abletonMusicData = msg;
});

///hex to rgb
console.log(perlinColorShaderMaterial.uniforms.uSurfaceColor.value.set());
console.log(Math.floor(Math.random() * 16777215).toString(16));

let randomThreeColor = new THREE.Color(0xffffff);
let randomThreeColor2 = new THREE.Color(0xffffff);

//postprocessing effects
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);

composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass();
bloomPass.strength = 0.4;
composer.addPass(bloomPass);
renderer.toneMappingExposure = 0.4;
///animations///
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  ///Audio ///

  soundData = analyser.getAverageFrequency();

  console.log(soundData);

  updateTorus(soundData, 60, 30);

  //update controls
  controls.update();

  //update objects

  cube1.rotation.y = 0.4 * elapsedTime;
  cube1.rotation.x = 0.4 * elapsedTime;
  //torus.rotation.y = 0.2 * soundData;

  if (abletonMusicData > 0.98) {
    /*   floorMaterial.uniforms.uBigWavesElevation.value = soundData * 0.005;
    perlinColorShaderMaterial.uniforms.uBigWavesElevation.value =
      soundData * 0.006; */
    floorMaterial.uniforms.uBigWavesElevation.value = abletonMusicData * 0.5;
    perlinColorShaderMaterial.uniforms.uBigWavesElevation.value = abletonMusicData;

    //postprocessing
    bloomPass.strength = 0.4;

    const randomColorHex = Math.floor(Math.random() * 16777215).toString(16);
    const randomColorHex2 = Math.floor(Math.random() * 16777215).toString(16);

    let newColor = `#${randomColorHex}`;
    let newColor2 = `#${randomColorHex2}`;

    console.log(newColor);

    randomThreeColor.set(newColor);
    randomThreeColor2.set(newColor2);

    perlinColorShaderMaterial.uniforms.uSurfaceColor.value.set(
      randomThreeColor
    );
    perlinColorShaderMaterial.uniforms.uDepthColor.value.set(randomThreeColor2);
  } else {
    /*  floorMaterial.uniforms.uBigWavesElevation.value = soundData * 0.003;
    perlinColorShaderMaterial.uniforms.uBigWavesElevation.value =
      soundData * 0.003; */
    floorMaterial.uniforms.uBigWavesElevation.value = abletonMusicData;
    perlinColorShaderMaterial.uniforms.uBigWavesElevation.value = abletonMusicData;
    //bloomPass.strength = abletonMusicData * 0.9;
    bloomPass.strength = 0.2;
  }

  //shaders
  shaderOneMaterial.uniforms.uTime.value = elapsedTime;

  floorMaterial.uniforms.uTime.value = elapsedTime;
  //floorMaterial.uniforms.uTime.value = soundData * 0.02;
  //shaders
  //floorMaterial.uniforms.uBigWavesElevation.value = soundData * 0.003;

  /* try with ableton */
  floorMaterial.uniforms.uColorMulti.value = abletonMusicData;

  floorMaterial.uniforms.uColorOffset.value = abletonMusicData;

  floorMaterial.uniforms.uBigWavesSpeed.value = abletonMusicData;

  perlinColorShaderMaterial.uniforms.uColorMulti.value = abletonMusicData;
  perlinColorShaderMaterial.uniforms.uColorOffset.value = abletonMusicData;
  perlinColorShaderMaterial.uniforms.uBigWavesSpeed.value = abletonMusicData;

  /* normal threejs loader sound data */
  /*   floorMaterial.uniforms.uColorMulti.value = soundData * 0.01;

  floorMaterial.uniforms.uColorOffset.value = soundData * 0.002;

  floorMaterial.uniforms.uBigWavesSpeed.value = soundData * 0.01; */

  /*   perlinColorShaderMaterial.uniforms.uColorMulti.value = soundData * 0.01;
  perlinColorShaderMaterial.uniforms.uColorOffset.value = soundData * 0.002;
  //perlinColorShaderMaterial.uniforms.uBigWavesElevation.value =
  //soundData * 0.003;
  perlinColorShaderMaterial.uniforms.uBigWavesSpeed.value = soundData * 0.01; */

  updateShader(abletonMusicData, 160, 130);
  //render
  //renderer.render(scene, camera);
  composer.render();

  //analyser.getByteFrequencyData(dataArr);
  //console.log(dataArr);

  window.requestAnimationFrame(tick);
};

tick();

function updateTorus(data, max, min) {
  //console.log((data - min) / (max - min));

  const newVal = (data - min) / (max - min);
  torus.rotation.y = 2 * newVal;
  spotLight.intensity = 1 * newVal;
  pointLight.intensity = 0.4 * newVal;
  //console.log(Math.max(0, Math.min(1, data-min / max-min)))
  // console.log(Math.max(0, Math.min(1, data - min / max - min)));
  //(data - min) / (max - min);
  //torus.geometry.attributes.position.array.forEach(val => {});
}
function updateShader(data, max, min) {
  const newVal = (data - min) / (max - min);
  shaderOneMaterial.uniforms.uColor[0] = newVal * 2;
  //shaderOneMaterial.uniforms.uColor = newVal;
}
console.log(shaderOneMaterial.uniforms.uColor[1]);
console.log(spotLight);

///hex to rgb
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  result = {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
  return result;
}
