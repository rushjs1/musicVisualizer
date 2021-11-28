import "./styles.css";
import Experience from "./Experience/Experience.js";
import * as THREE from "three";
import * as dat from "dat.gui";
import { gsap } from "gsap";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Vector3 } from "three";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import planeVertexShader from "./shaders/flag/vertex.glsl";
import planeFragmentShader from "./shaders/flag/fragment.glsl";
import floorVertexShader from "./shaders/floor/vertex.glsl";
import floorFragmentShader from "./shaders/floor/fragment.glsl";
import perlinColorVertexShader from "./shaders/perlinColor/vertex.glsl";
import perlinColorFragmentShader from "./shaders/perlinColor/fragment.glsl";
import { io } from "socket.io-client";

//exp test
const experience = new Experience(document.querySelector("canvas.webGL"));

//
const gui = new dat.GUI({ width: 340 });
gui.closed = true;
const debugObject = {};
const perlinDebugObject = {};
const sphereColorObject = {};
let cameraObject = {};

//import SimplexNoise from "simplex-noise";

//canvas and scene and sizes
const canvas = document.querySelector("canvas.webGL");
const scene = new THREE.Scene();
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};
//scene.background = new THREE.Color(0x6e6e6e);
//scene.background = new THREE.Color(0x00ffa4);
////textures////
const textureLoader = new THREE.TextureLoader();
const soicTexture = textureLoader.load("/shaderTextures/soicMask1.jpeg");
const particleTexture = textureLoader.load("/particles/1.png");
///marble
const marbleColorTexture = textureLoader.load("/textures/marble/color.jpg");
const marbleDispTexture = textureLoader.load("textures/marble/disp.jpg");
const marbleNormalTexture = textureLoader.load("/textures/marble/normal.jpg");
const marbleSpecTexture = textureLoader.load("/textures/marble/spec.jpg");
const marbleOccTexture = textureLoader.load("/textures/marble/occ.jpg");
//tiles
const tileColorTexture = textureLoader.load("/textures/tiles/color.jpg");
const tileHeightTexture = textureLoader.load("/textures/tiles/height.png");
const tileNormalTexture = textureLoader.load("/textures/tiles/normal.jpg");
const tileRoughTexture = textureLoader.load("/textures/tiles/rough.jpg");
const tileOccTexture = textureLoader.load("/textures/tiles/occ.jpg");
//model loader

let plane4, plane5;

////lights
let spotLightx = 4;
const hemisphericLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9);
scene.add(hemisphericLight);
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1);
rectAreaLight.position.set(-1.5, 0, 1.5);
scene.add(rectAreaLight);
rectAreaLight.lookAt(new Vector3());
const pointLight = new THREE.PointLight(0xff9000, 1, 4.5);
pointLight.position.set(-1, -0.5, 1);
const spotLight = new THREE.SpotLight(0x78ff00, 3, 5, Math.PI * 0.1, 0.25, 1);
spotLight.position.set(0, 2, 3);
const spotLight2 = new THREE.SpotLight(0xffffff, 2, 10, Math.PI * 0.25);
spotLight2.position.set(spotLightx, 6, 5);
const spotLight3 = new THREE.SpotLight(0xf2e0b9, 2, 10, Math.PI * 0.15);
spotLight3.position.set(4, 2, 4);
scene.add(spotLight, pointLight, spotLight2);

//light helpers - frames

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
const spotLightHelper2 = new THREE.SpotLightHelper(spotLight2);
const spotLightHelper3 = new THREE.SpotLightHelper(spotLight3);

scene.add(
  pointLightHelper,
  spotLightHelper,
  spotLightHelper2,
  spotLightHelper3
);
window.requestAnimationFrame(() => {
  spotLightHelper.update();
  spotLightHelper2.update();
  spotLightHelper3.update();
});

//particles
const particlesGeo = new THREE.BufferGeometry();
const count = 1750;
const partPos = new Float32Array(count * 3);
for (let i = 0; i < count * 3; i++) {
  partPos[i] = (Math.random() - 0.5) * 30;
}
particlesGeo.setAttribute("position", new THREE.BufferAttribute(partPos, 3));
const partMat = new THREE.PointsMaterial({
  size: 0.2,
  sizeAttenuation: true,
  color: new THREE.Color(0xff3000),
  transparent: true,
  alphaMap: particleTexture,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

const particles = new THREE.Points(particlesGeo, partMat);

const planeGeo = new THREE.PlaneGeometry(2, 2, 32, 32);

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
//perlinDebugObject.depthColor = "#000000";

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

const plane2geo = new THREE.PlaneGeometry(40, 7, 128, 128);
const plane3geo = new THREE.PlaneGeometry(40, 40, 128, 128);

/* spiked floor */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40, 128, 128),
  floorMaterial
);

/* non spiked */
//const floor = new THREE.Mesh(floorGeo, floorMaterial);

floor.rotation.x = -Math.PI * 0.5;
floor.position.y = -0.65;

//walls
const plane2 = new THREE.Mesh(plane2geo, perlinColorShaderMaterial);

plane2.position.set(0, 2.5, -20);
plane4 = new THREE.Mesh(plane2geo, perlinColorShaderMaterial);
plane4.position.set(20, 2.5, 0);
plane4.rotation.y = -Math.PI * 0.5;
plane5 = new THREE.Mesh(plane2geo, perlinColorShaderMaterial);
plane5.position.set(-20, 2.5, 0);
plane5.rotation.y = Math.PI * 0.5;

//const celing
const plane3 = new THREE.Mesh(plane3geo, perlinColorShaderMaterial);
plane3.position.set(0, 6, 0);
plane3.rotation.x = Math.PI * 0.5;

//marble floor
const tileFloor = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 40),
  new THREE.MeshStandardMaterial({
    map: tileColorTexture,
    aoMap: tileOccTexture,
    normalMap: tileNormalTexture,
    displacementMap: tileHeightTexture,
    displacementScale: 0.6,
    roughnessMap: tileRoughTexture
  })
);
tileFloor.position.y = -0.8;
tileFloor.rotation.x = -Math.PI * 0.5;
tileColorTexture.repeat.set(8, 8);
tileOccTexture.repeat.set(8, 8);
tileRoughTexture.repeat.set(8, 8);
tileHeightTexture.repeat.set(8, 8);
tileNormalTexture.repeat.set(8, 8);

//S Wrapping
tileColorTexture.wrapS = THREE.RepeatWrapping;
tileOccTexture.wrapS = THREE.RepeatWrapping;
tileRoughTexture.wrapS = THREE.RepeatWrapping;
tileHeightTexture.wrapS = THREE.RepeatWrapping;
tileNormalTexture.wrapS = THREE.RepeatWrapping;
//t wrapping
tileColorTexture.wrapT = THREE.RepeatWrapping;
tileOccTexture.wrapT = THREE.RepeatWrapping;
tileRoughTexture.wrapT = THREE.RepeatWrapping;
tileHeightTexture.wrapT = THREE.RepeatWrapping;
tileNormalTexture.wrapT = THREE.RepeatWrapping;

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(2, 32, 32),
  perlinColorShaderMaterial
);
sphere.position.x = 1.5;
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

const flagPole = new THREE.Mesh(
  new THREE.CylinderGeometry(0.1, 0.1, 9.5, 32),
  new THREE.MeshBasicMaterial({
    color: 0x000000
  })
);
flagPole.position.x = -3.9;
flagPole.position.z = 2.5;

const plane = new THREE.Mesh(planeGeo, shaderOneMaterial);
plane.scale.y = 2 / 3;
plane.position.z = 2;
plane.position.y = 4;
plane.position.x = -3;
plane.rotation.y = 0.6;

//get selected song
const selectSongDV = document.getElementById("song-select");
let selectedSong;
selectedSong = selectSongDV.options[selectSongDV.selectedIndex].value;
console.log(selectedSong);

selectSongDV.addEventListener("change", () => {
  selectedSong = selectSongDV.options[selectSongDV.selectedIndex].value;
  console.log(selectedSong);
  loadThreeAudio(selectedSong);
});

///group of spheres for viz
const sphereGroup = new THREE.Object3D();
sphereColorObject.color1 = "#340c7d";
let sMaterial;
const spheres = [];
let sWidth = 64;
function createSphere(geo, mat) {
  const newSphere = new THREE.Mesh(geo, mat);
  newSphere.position.y = 0.5;
  return newSphere;
}

function positionSpheres() {
  const sGeometry = new THREE.SphereGeometry(0.3, 32, 32);
  /*  sMaterial = new THREE.MeshPhongMaterial({
    color: sphereColorObject.color1,
    specular: 0xffffff,
    shininess: 100,
    emissive: 0x0,
    flatShading: THREE.SmoothShading,
    side: THREE.DoubleSide
  }); */
  sMaterial = new THREE.MeshBasicMaterial({
    color: sphereColorObject.color1,
    specular: 0xffffff,
    shininess: 100,
    emissive: 0x0,
    flatShading: THREE.SmoothShading,
    side: THREE.DoubleSide
  });
  for (let i = 0; i < sWidth / 8; i++) {
    for (let j = 0; j < sWidth; j++) {
      let sSphere = createSphere(sGeometry, sMaterial);
      sphereGroup.add(sSphere);
      sSphere.position.x = j;
      sSphere.position.y = i;
      sSphere.position.z = i;

      spheres.push(sSphere);
    }
  }

  sphereGroup.position.set(-26, -6, 0);
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
const iAmount = parseInt(window.location.search.substr(1)) || 10;
const iCount = Math.pow(iAmount, 3);

function addInstancedMesh() {
  iMesh = new THREE.InstancedMesh(iBoxGeo, iMat, 4);
  iMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

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

//scene.add(sphere, cube1, torus, plane, floor, plane2, ball, sphereGroup);
//spotLight3.target = plane3;

scene.add(
  sphere,
  plane,
  flagPole,
  floor,
  plane2,
  plane3,
  plane4,
  plane5,
  tileFloor,
  ball,
  sphereGroup,
  spotLight3
);

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
gui
  .addColor(sphereColorObject, "color1")
  .name("color1")
  .onChange(() => {
    sMaterial.color.set(sphereColorObject.color1);
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
camera.position.z = 8;
cameraObject = {
  switch: true
};

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

let soundDataArray, bufferLength, analyser, sound;

function loadThreeAudio(song) {
  let listener = null;
  let audioLoader = null;
  if (sound && sound.isPlaying) {
    sound.pause();
  }

  listener = new THREE.AudioListener();
  camera.add(listener);
  sound = new THREE.Audio(listener);
  audioLoader = new THREE.AudioLoader();
  audioLoader.load(`/songs/${song}.mp3`, function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
    //console.log(buffer);
  });
  console.log(sound);
  //THREE ANALYSER
  analyser = new THREE.AudioAnalyser(sound, 1024);
  soundDataArray = analyser.data;
  bufferLength = analyser.analyser.frequencyBinCount;
}
loadThreeAudio(selectedSong);

const afDV = document.getElementById("average-frequency");
let averageFrequencyForColorChange = {
  value: 100
};
function moveSphereWave() {
  if (sound && sound.isPlaying) {
    analyser.getFrequencyData(soundDataArray);

    for (var i = 0; i < bufferLength; i++) {
      const p = soundDataArray[i];
      const s = spheres[i];
      const z = s.position;
      gsap.to(z, 0.2, {
        y: p / 20
      });
    }
  }
}

function moveCamera() {
  gsap.to(camera.position, { x: camera.position.x + 2 });
}

let abletonMusicData = null;
//socket io && ableton
var socket = io();
socket.on("musicEmit", function(msg) {
  // console.log(msg);
  abletonMusicData = msg;
});

///hex to rgb
console.log(perlinColorShaderMaterial.uniforms.uSurfaceColor.value.set());
console.log(Math.floor(Math.random() * 16777215).toString(16));

let randomThreeColor = new THREE.Color(0xffffff);
let randomThreeColor2 = new THREE.Color(0xffffff);
let randomThreeColor3 = new THREE.Color(0xffffff);

//postprocessing effects
const composer = new EffectComposer(renderer);
let renderPass = new RenderPass(scene, camera);

composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass();
bloomPass.strength = 0.8;
composer.addPass(bloomPass);
renderer.toneMappingExposure = 0.4;
const glitchPass = new GlitchPass();
//composer.addPass(glitchPass);

/* gui
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
  .name("bloomStrength"); */

gui.add(cameraObject, "switch").name("Rotate Camera");

gui
  .add(averageFrequencyForColorChange, "value")
  .min(70)
  .max(120)
  .step(1)
  .name("ColorChangeValue");

afDV.textContent = "Average Frequency: ";
const item = document.createElement("p");
function logAf(data) {
  item.textContent = data;
  afDV.appendChild(item);
}

///animations///
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  ///Audio ///

  moveSphereWave();

  soundData = analyser.getAverageFrequency();
  logAf(soundData);
  if (soundData > averageFrequencyForColorChange.value) {
    const randomColorHex3 = Math.floor(Math.random() * 16777215).toString(16);
    let newColor3 = `#${randomColorHex3}`;
    randomThreeColor3.set(newColor3);
    console.log(randomThreeColor3);
    sMaterial.color.set(randomThreeColor3);
    //moveCamera();
  }
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
    glitchPass.goWild = true;
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
    spotLightx = -abletonMusicData * 0.2;
  } else {
    /*  floorMaterial.uniforms.uBigWavesElevation.value = soundData * 0.003;
    perlinColorShaderMaterial.uniforms.uBigWavesElevation.value =
      soundData * 0.003; */
    floorMaterial.uniforms.uBigWavesElevation.value = abletonMusicData;
    perlinColorShaderMaterial.uniforms.uBigWavesElevation.value = abletonMusicData;
    bloomPass.strength = abletonMusicData / 3;
    glitchPass.goWild = false;
    //bloomPass.strength = 0.2;
    spotLight.intensity = 3 * abletonMusicData;
    pointLight.intensity = 3 * abletonMusicData;
    spotLightx = abletonMusicData * 0.2;
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

  ///camera
  const cameraAngle = elapsedTime * 0.5;
  if (cameraObject.switch) {
    camera.position.x = Math.cos(cameraAngle) * 22;
    camera.position.z = Math.sin(cameraAngle) * 22;
  } else {
    camera.position.x = camera.position.x;
    camera.position.z = camera.position.z;
  }

  //updateTorus(soundData, 60, 30);
  //updateShader(abletonMusicData, 160, 130);

  //render
  //renderer.render(scene, camera);
  composer.render();
  //for INFINITY LOOP
  // addInstancedMesh();
  //render();

  window.requestAnimationFrame(tick);
};

tick();

//helpers
//remove scene attempt

selectSongDV.style.display = "none";

var sceneBool = true;

function clearScene() {
  renderer.dispose();
  sceneBool = !sceneBool;
  console.log(sceneBool);
  if (!sceneBool) {
    scene.remove(
      sphere,
      plane,
      flagPole,
      floor,
      plane2,
      plane3,
      plane4,
      plane5,
      ball,
      tileFloor,
      spotLightHelper,
      spotLightHelper2,
      pointLightHelper,
      spotLightHelper3
    );
    if (!sphereGroup.visible) {
      scene.add(particles);
      sphereGroup.visible = true;
      scene.background = new THREE.Color(0x6e6e6e);
      selectSongDV.style.display = "block";
    } else {
      scene.add(particles);
      scene.background = new THREE.Color(0x6e6e6e);
      selectSongDV.style.display = "block";
      positionSpheres();

      window.addEventListener("keypress", event => {
        if (sound && !sound.isPlaying) {
          sound.play();
        } else {
          sound.pause();
        }
      });
      window.addEventListener("touchend", event => {
        if (sound && !sound.isPlaying) {
          sound.play();
        } else {
          sound.pause();
        }
      });
    }
  } else if (sceneBool) {
    scene.add(
      sphere,

      plane,
      floor,
      plane2,
      plane3,
      plane4,
      plane5,
      ball,
      tileFloor,
      flagPole,
      spotLightHelper,
      spotLightHelper2,
      spotLightHelper3,
      pointLightHelper
    );
    scene.remove(particles);
    sphereGroup.visible = false;
    selectSongDV.style.display = "none";
    scene.background = new THREE.Color(0x000000);
  }
}

var clearBtn = document.querySelector(".clear-scene-btn");

clearBtn.addEventListener("click", () => {
  console.log("clear");
  clearScene();
});

console.log("push to both remote origins test");
