import "./styles.css";

import * as THREE from "three";
import * as dat from "dat.gui";
import { TweenMax } from "gsap";
import { gsap } from "gsap";

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
scene.background = new THREE.Color(0x6e6e6e);

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

///group of spheres for viz
const sphereGroup = new THREE.Object3D();
const spheres = [];

function createSphere(geo, mat) {
  const newSphere = new THREE.Mesh(geo, mat);
  newSphere.position.y = 0.5;
  return newSphere;
}
function positionSpheres() {
  const sWidth = 8;
  const sGeometry = new THREE.SphereGeometry(0.3, 32, 32);
  const sMaterial = new THREE.MeshPhongMaterial({
    color: 0x4b12b3,
    specular: 0xffffff,
    shininess: 100,
    emissive: 0x0,
    flatShading: THREE.SmoothShading,
    side: THREE.DoubleSide
  });
  for (let i = 0; i < sWidth; i++) {
    for (let j = 0; j < sWidth; j++) {
      let sSphere = createSphere(sGeometry, sMaterial);
      sphereGroup.add(sSphere);
      sSphere.position.x = j;
      sSphere.position.y = i;

      spheres.push(sSphere);
    }
  }
  sphereGroup.position.set(-3, 0, 0);
}
//positionSpheres();

//infinity practice

var iMesh = null;
var iGroup = new THREE.Object3D();
var sectionWidth = 8;
var loopSectionPosition = 0;
var iBoxGeo = new THREE.BoxGeometry(0.75, 0.75, 0.75);

const iMat = new THREE.MeshNormalMaterial({});
const iMat2 = new THREE.MeshBasicMaterial({
  color: 0x00ff00
});
function addInstancedMesh() {
  iMesh = new THREE.InstancedMesh(iBoxGeo, iMat, 4);
  scene.add(iMesh);
  iPositions(iMesh, 0);
}

function iPositions(mesh, section) {
  for (var i = 0; i < mesh.count; i++) {
    var zStaticPosition = -sectionWidth * (i + 1);
    var zSectionPosition = sectionWidth * section;
    var z = zStaticPosition + zSectionPosition;

    iGroup.position.set(0, 0, z);
    iGroup.updateMatrix();
    mesh.setMatrixAt(i, iGroup.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
}

function runInfinity() {
  var distance = Math.round(camera.position.z / sectionWidth);
  if (distance !== loopSectionPosition) {
    loopSectionPosition = distance;
    iPositions(iMesh, loopSectionPosition);
  }
}

scene.add(sphere, cube1, torus, plane, floor, plane2, ball, sphereGroup);

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

/* const positionAttribute = torus.geometry.getAttribute("position");
const vertex = new THREE.Vector3();
for (
  let vertexIndex = 0;
  vertexIndex < positionAttribute.count;
  vertexIndex++
) {
  vertex.fromBufferAttribute(positionAttribute, vertexIndex);
  console.log(vertex);
} */

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
let controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//renderer///
let renderer = new THREE.WebGL1Renderer({
  canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/* function render() {
  camera.position.z -= 0.4;
  runInfinity();
  composer.render();
} */

//////threejs audio loader//////
const listener = new THREE.AudioListener();
camera.add(listener);
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load("/rezz.mp3", function(buffer) {
  sound.setBuffer(buffer);
  sound.setLoop(true);
  sound.setVolume(0.5);
  //console.log(buffer);
});
console.log(sound);
//THREE ANALYSER
const analyser = new THREE.AudioAnalyser(sound, 128);
const soundDataArray = analyser.data;
const bufferLength = analyser.analyser.frequencyBinCount;

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

function moveSphereWave() {
  if (sound.isPlaying) {
    analyser.getFrequencyData(soundDataArray);

    for (var i = 0; i < bufferLength; i++) {
      const p = soundDataArray[i];
      const s = spheres[i];
      const z = s.position;
      gsap.to(z, 0.2, {
        y: p / 40
      });
    }
  }
}

function moveAbletonSphereWave() {
  if (abletonMusicData > 0) {
    aAnalyser.getFrequencyData(abletonSoundDataArray);

    for (var i = 0; i < abletonBufferLength; i++) {
      const p = abletonSoundDataArray[i];
      const s = spheres[i];
      const z = s.position;
      gsap.to(z, 0.2, {
        y: p / 80
      });
    }
  }
}

let abletonMusicData = null;
//socket io && ableton
var socket = io();
socket.on("musicEmit", function(msg) {
  // console.log(msg);
  abletonMusicData = msg;
});

/* let abletonSourceData, abletonAnalyser;

let abletonContext = new AudioContext();
abletonSourceData = abletonContext.createBuffer(abletonMusicData);
abletonAnalyser = abletonContext.createAnalyser();
abletonSourceData.connect(analyser);
abletonAnalyser.connect(abletonContext.destination);
abletonAnalyser.fftSize = 128;
console.log(abletonAnalyser); */

/* const abletonAnalyser = new THREE.AudioAnalyser(abletonMusicData, 128);
const abletonSoundDataArray = abletonAnalyser.data;
const abletonBufferLength = abletonAnalyser.analyser.frequencyBinCount; */

const abletonListener = new THREE.AudioListener();
camera.add(abletonListener);
const abletonSound = new THREE.Audio(abletonListener);
const abletonAudioLoader = new THREE.AudioLoader();
abletonAudioLoader.load(abletonMusicData, function(buffer) {
  abletonSound.setBuffer(buffer);
  abletonSound.setLoop(false);
  abletonSound.setVolume(0.5);
  abletonSound.play();
});
const aAnalyser = new THREE.AudioAnalyser(abletonSound, 128);
const abletonSoundDataArray = aAnalyser.data;
const abletonBufferLength = aAnalyser.analyser.frequencyBinCount;

///hex to rgb
console.log(perlinColorShaderMaterial.uniforms.uSurfaceColor.value.set());
console.log(Math.floor(Math.random() * 16777215).toString(16));

let randomThreeColor = new THREE.Color(0xffffff);
let randomThreeColor2 = new THREE.Color(0xffffff);

//postprocessing effects
const composer = new EffectComposer(renderer);
let renderPass = new RenderPass(scene, camera);

composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass();
bloomPass.strength = 0.8;
composer.addPass(bloomPass);
renderer.toneMappingExposure = 0.4;

gui
  .add(renderer, "toneMappingExposure")
  .min(0)
  .max(1)
  .step(0.001)
  .name("toneMappingExposure");

gui
  .add(bloomPass, "strength")
  .min(0)
  .max(1)
  .step(0.001)
  .name("bloomStrength");

console.log(bloomPass);

///animations///
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  ///Audio ///
  const aData = aAnalyser.getAverageFrequency();
  // console.log(aData);

  moveSphereWave();
  moveAbletonSphereWave();

  soundData = analyser.getAverageFrequency();

  //console.log(soundData);

  //update controls
  controls.update();

  //update objects

  cube1.rotation.y = 0.4 * elapsedTime;
  cube1.rotation.x = 0.4 * elapsedTime;
  //torus.rotation.y = 0.2 * soundData;

  if (abletonMusicData > 0.9) {
    /*   floorMaterial.uniforms.uBigWavesElevation.value = soundData * 0.005;
    perlinColorShaderMaterial.uniforms.uBigWavesElevation.value =
      soundData * 0.006; */
    floorMaterial.uniforms.uBigWavesElevation.value = abletonMusicData * 0.5;
    perlinColorShaderMaterial.uniforms.uBigWavesElevation.value = abletonMusicData;

    //postprocessing
    //bloomPass.strength = 0.4;
    bloomPass.strength = abletonMusicData;
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
    bloomPass.strength = abletonMusicData / 3;
    //bloomPass.strength = 0.2;
  }

  //shaders
  shaderOneMaterial.uniforms.uTime.value = elapsedTime;

  floorMaterial.uniforms.uTime.value = elapsedTime;
  //floorMaterial.uniforms.uTime.value = soundData * 0.02;
  //shaders
  //floorMaterial.uniforms.uBigWavesElevation.value = soundData * 0.003;

  /* try with ableton */
  //bloomPass.strength = abletonMusicData / 3;
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

  updateTorus(soundData, 60, 30);
  updateShader(abletonMusicData, 160, 130);
  addInstancedMesh();

  //render
  //renderer.render(scene, camera);
  composer.render();
  //for INFINITY LOOP
  //render();

  window.requestAnimationFrame(tick);
};

tick();

//helpers
function updateTorus(data, max, min) {
  const newVal = (data - min) / (max - min);
  torus.rotation.y = 2 * newVal;
  spotLight.intensity = 1 * newVal;
  pointLight.intensity = 0.4 * newVal;
}
function updateShader(data, max, min) {
  const newVal = (data - min) / (max - min);
  shaderOneMaterial.uniforms.uColor[0] = newVal * 2;
}

//remove scene attempt
function clearScene() {
  renderer.dispose();
  //scene.clear();
  scene.remove(sphere, cube1, torus, plane, floor, plane2, ball);
  positionSpheres();
}

var clearBtn = document.querySelector(".clear-scene-btn");

clearBtn.addEventListener("click", () => {
  console.log("clear");
  clearScene();
});

console.log("push to both remote origins test");
