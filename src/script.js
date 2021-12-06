import "./styles.css";
import Experience from "./Experience/Experience.js";
import * as THREE from "three";
import * as dat from "dat.gui";
import { gsap } from "gsap";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
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
//const experience = new Experience(document.querySelector("canvas.webGL"));

//
const gui = new dat.GUI({ width: 340 });
gui.closed = true;
const debugObject = {};
const perlinDebugObject = {};
const sphereColorObject = {};
let cameraObject = {};
let hemisphericLightObject = {};

//canvas and scene and sizes
const canvas = document.querySelector("canvas.webGL");
const scene = new THREE.Scene();
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

////textures////
const textureLoader = new THREE.TextureLoader();
const soicTexture = textureLoader.load("/shaderTextures/soicMask1.jpeg");
const particleTexture = textureLoader.load("/particles/1.png");

//tiles
const tileColorTexture = textureLoader.load("/textures/tiles/color.jpg");
const tileHeightTexture = textureLoader.load("/textures/tiles/height.png");
const tileNormalTexture = textureLoader.load("/textures/tiles/normal.jpg");
const tileRoughTexture = textureLoader.load("/textures/tiles/rough.jpg");
const tileOccTexture = textureLoader.load("/textures/tiles/occ.jpg");

////SCI-FI1
const scifi1ColorTexture = textureLoader.load(
  "/textures/sci-fi1/basecolor.jpg"
);
const scifi1HeightTexture = textureLoader.load("/textures/sci-fi1/height.png");
const scifi1NormalTexture = textureLoader.load("/textures/sci-fi1/normal.jpg");
const scifi1RoughTexture = textureLoader.load(
  "/textures/sci-fi1/roughness.jpg"
);
const scifi1OccTexture = textureLoader.load("/textures/sci-fi1/AO.jpg");
const scifi1MetalTexture = textureLoader.load("/textures/sci-fi1/metallic.jpg");

//model loader
const gltfLoader = new GLTFLoader();
let stage;
gltfLoader.load("/models/concert_stage/scene.gltf", gltf => {
  stage = gltf;
  stage.scene.scale.set(0.3, 0.3, 0.3);
  stage.scene.position.set(0, -0.6, -5);

  scene.add(stage.scene);
});
let piano;
gltfLoader.load("/models/grand_piano/scene.gltf", gltf => {
  piano = gltf;
  piano.scene.scale.set(0.5, 0.5, 0.5);
  piano.scene.position.set(0, 0.3, -5);
  piano.scene.rotation.y = Math.PI * 0.25;
  scene.add(piano.scene);
});

let plane4, plane5;

////lights

hemisphericLightObject = {
  value: 0.2
};
const hemisphericLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.2);
scene.add(hemisphericLight);

/* const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 2, 1, 1);
rectAreaLight.position.set(-1.5, 0, 1.5);
scene.add(rectAreaLight); */

const pointLight = new THREE.PointLight(0xff9000, 1, 4.5);
pointLight.position.set(-1, -0.5, 1);
const spotLight = new THREE.SpotLight(0x689fe3, 5, 18, Math.PI * 0.13);
spotLight.target.position.x = 4;
spotLight.target.position.z = 4;
const spotLight2 = new THREE.SpotLight(0xffffff, 2, 30, Math.PI * 0.15, 0.25);
spotLight2.target.position.z = -4;

const spotLight3 = new THREE.SpotLight(0xf2e0b9, 2, 30, Math.PI * 0.15);
spotLight3.target.position.z = -4;
spotLight3.target.position.x = 6;

const spotLight4 = new THREE.SpotLight(0x687bcd, 2, 10, Math.PI * 0.15);
const spotLight5 = new THREE.SpotLight(0x689fe3, 2, 30, Math.PI * 0.15);
spotLight5.target.position.z = -10;
spotLight5.target.position.x = -6;
const spotLight6 = new THREE.SpotLight(0x7368e3, 5, 18, Math.PI * 0.13);
spotLight6.target.position.x = -4;
spotLight6.target.position.z = 4;

scene.add(
  spotLight5.target,
  spotLight3.target,
  spotLight2.target,
  spotLight.target,
  spotLight6.target
);

//light helpers - frames

const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
const spotLightHelper2 = new THREE.SpotLightHelper(spotLight2);
const spotLightHelper3 = new THREE.SpotLightHelper(spotLight3);
const spotLightHelper4 = new THREE.SpotLightHelper(spotLight4);
const spotLightHelper5 = new THREE.SpotLightHelper(spotLight5);
const spotLightHelper6 = new THREE.SpotLightHelper(spotLight6);

/* scene.add(
  pointLightHelper,
  spotLightHelper,
  spotLightHelper2,
  spotLightHelper3,
  spotLightHelper4,
  spotLightHelper5,
  spotLightHelper6
); */
window.requestAnimationFrame(() => {
  spotLightHelper.update();
  spotLightHelper2.update();
  spotLightHelper3.update();
  spotLightHelper4.update();
  spotLightHelper5.update();
  spotLightHelper6.update();
});

let debugSpotLightObject = {
  switch: false
};
console.log(debugSpotLightObject.switch);
gui
  .add(debugSpotLightObject, "switch")
  .name("Light Helpers Active")
  .onChange(() => {
    console.log(debugSpotLightObject.switch);
    if (!debugSpotLightObject.switch) {
      scene.remove(
        pointLightHelper,
        spotLightHelper,
        spotLightHelper2,
        spotLightHelper3,
        spotLightHelper4,
        spotLightHelper5,
        spotLightHelper6
      );
    } else {
      scene.add(
        pointLightHelper,
        spotLightHelper,
        spotLightHelper2,
        spotLightHelper3,
        spotLightHelper4,
        spotLightHelper5,
        spotLightHelper6
      );
    }
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

var debugColorOffset = {
  value: 0.25
};
var debugElevation = {
  value: 0.2
};
const floorMaterial = new THREE.ShaderMaterial({
  vertexShader: floorVertexShader,
  fragmentShader: floorFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uBigWavesElevation: { value: debugElevation.value },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
    uBigWavesSpeed: { value: 0.75 },
    //color
    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: { value: debugColorOffset.value },
    uColorMulti: { value: 2 },
    uSoundData: { value: soundData }
  }
});

const plane2geo = new THREE.PlaneGeometry(20, 11.1, 128, 128);
const plane3geo = new THREE.PlaneGeometry(20, 30, 128, 128);
const planeStageGeo = new THREE.PlaneGeometry(6, 4.6, 128, 128);
const planeStageGeo2 = new THREE.PlaneGeometry(4, 2.3, 128, 128);

/* spiked floor */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 30, 128, 128),
  floorMaterial
);

/* non spiked */
//const floor = new THREE.Mesh(floorGeo, floorMaterial);

floor.rotation.x = -Math.PI * 0.5;
floor.position.y = -0.65;

//WALLS
const concreteMaterial = new THREE.MeshStandardMaterial({
  map: scifi1ColorTexture,
  aoMap: scifi1OccTexture,
  normalMap: scifi1NormalTexture,
  displacementMap: scifi1HeightTexture,
  displacementScale: 0.6,
  roughnessMap: scifi1RoughTexture,
  metalnessMap: scifi1MetalTexture
});
scifi1ColorTexture.repeat.set(8, 1);
scifi1OccTexture.repeat.set(8, 1);
scifi1RoughTexture.repeat.set(8, 1);
scifi1HeightTexture.repeat.set(8, 1);
scifi1NormalTexture.repeat.set(8, 1);

//S Wrapping
scifi1ColorTexture.wrapS = THREE.RepeatWrapping;
scifi1OccTexture.wrapS = THREE.RepeatWrapping;
scifi1RoughTexture.wrapS = THREE.RepeatWrapping;
scifi1HeightTexture.wrapS = THREE.RepeatWrapping;
scifi1NormalTexture.wrapS = THREE.RepeatWrapping;
scifi1MetalTexture.wrapS = THREE.RepeatWrapping;
//t wrapping
scifi1ColorTexture.wrapT = THREE.RepeatWrapping;
scifi1OccTexture.wrapT = THREE.RepeatWrapping;
scifi1RoughTexture.wrapT = THREE.RepeatWrapping;
scifi1HeightTexture.wrapT = THREE.RepeatWrapping;
scifi1NormalTexture.wrapT = THREE.RepeatWrapping;
scifi1MetalTexture.wrapT = THREE.RepeatWrapping;

const plane2 = new THREE.Mesh(plane2geo, concreteMaterial);
plane2.position.set(0, 5, -12);
plane4 = new THREE.Mesh(plane2geo, concreteMaterial);
plane4.position.set(10, 5, 0);
plane4.rotation.y = -Math.PI * 0.5;
plane5 = new THREE.Mesh(plane2geo, concreteMaterial);
plane5.position.set(-10, 5, 0);
plane5.rotation.y = Math.PI * 0.5;

// CEILING
const plane3 = new THREE.Mesh(plane3geo, perlinColorShaderMaterial);
plane3.position.set(0, 10, 0);
plane3.rotation.x = Math.PI * 0.5;

//STAGE SCREENS
const stageScreen1 = new THREE.Mesh(planeStageGeo, perlinColorShaderMaterial);
stageScreen1.position.set(0, 3.8, -8.1);
const stageScreen2 = new THREE.Mesh(planeStageGeo2, floorMaterial);
stageScreen2.position.set(-5.3, 3.7, -5);
stageScreen2.rotation.y = Math.PI * 0.1;
const stageScreen3 = new THREE.Mesh(planeStageGeo2, floorMaterial);
stageScreen3.position.set(5.5, 3.7, -5.1);
stageScreen3.rotation.y = -Math.PI * 0.145;

plane2.add(spotLight, spotLight6);
plane3.add(spotLight3, spotLight5);
plane4.add(spotLight2);
plane5.add(spotLight4);
spotLight4.intensity = 2;
spotLight.position.set(2.7, 2.6, 4.2);
spotLight6.position.set(-2.7, 2.6, 4.2);

//TILE floor
const tileFloor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 30),
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

//lazers

const lazerMaterial = new THREE.MeshStandardMaterial({
  color: 0x4444aa,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true
});
const lazerMaterial2 = new THREE.MeshStandardMaterial({
  color: 0x4ce429,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true
});

const lazerMaterial3 = new THREE.MeshStandardMaterial({
  color: 0xff483f,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true
});
const lazerMaterial4 = new THREE.MeshStandardMaterial({
  color: 0xff33dc,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true
});
const lazerMaterial5 = new THREE.MeshStandardMaterial({
  color: 0xe35e12,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true
});
let lazerHeight = 20;

const lazerGeo = new THREE.CylinderGeometry(0.05, 0.05, lazerHeight, 32);
lazerGeo.applyMatrix(
  new THREE.Matrix4().makeTranslation(0, -lazerHeight / 2, 0)
);

let lazer = [];

for (var i = 0; i < 11; i++) {
  lazer[i] = new THREE.Mesh(lazerGeo, lazerMaterial);
  lazer[i].position.set(-i + 5, 8, -5.7);
  lazer[i].rotation.x = -Math.PI * 0.35;
  //lazer[i].rotation.z = (Math.PI * -0.5) / -i;
  //lazer[i].rotation.z = 0.26179938779 * -i;
  // if (i < 4) {
  //  lazer[i].rotation.z = (Math.PI * 0.35) / -i;
  //} else {
  //  //lazer[i].rotation.z = (Math.PI * -0.5) / -i;
  //  lazer[i].rotation.z = -0.26179938779;
  //}
  //lazer[i].rotation.z = -0.22439947525;
  scene.add(lazer[i]);
}

let lowLazer1 = [];
for (var i = 0; i < 11; i++) {
  lowLazer1[i] = new THREE.Mesh(lazerGeo, lazerMaterial2);
  lowLazer1[i].position.set(0, 0.5, -5.7);
  lowLazer1[i].rotation.x = -Math.PI * 0.5;
  lowLazer1[i].rotation.z = -i / 12 + 0.4;

  scene.add(lowLazer1[i]);
}

let lowLazer2 = [];
for (var i = 0; i < 11; i++) {
  lowLazer2[i] = new THREE.Mesh(lazerGeo, lazerMaterial5);
  lowLazer2[i].position.set(0, 0.5, -5.7);
  lowLazer2[i].rotation.x = -Math.PI * 0.5;
  lowLazer2[i].rotation.z = -i / 12 + 0.4;

  scene.add(lowLazer2[i]);
}

let topLeftLazer = [];

for (var i = 0; i < 11; i++) {
  topLeftLazer[i] = new THREE.Mesh(lazerGeo, lazerMaterial3);
  topLeftLazer[i].position.set(-8, 8, -5.7);
  topLeftLazer[i].rotation.x = -Math.PI * 0.3;
  topLeftLazer[i].rotation.z = i / 12;
  scene.add(topLeftLazer[i]);
}
let topRightLazer = [];

for (var i = 0; i < 11; i++) {
  topRightLazer[i] = new THREE.Mesh(lazerGeo, lazerMaterial4);
  topRightLazer[i].position.set(8, 8, -5.7);
  topRightLazer[i].rotation.x = -Math.PI * 0.3;
  topRightLazer[i].rotation.z = -i / 12;
  scene.add(topRightLazer[i]);
}

const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(2, 32, 32),
  perlinColorShaderMaterial
);
sphere.position.x = 1.5;

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
sphereColorObject.sphereColor = "#340c7d";
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
  sMaterial = new THREE.MeshBasicMaterial({
    color: sphereColorObject.sphereColor,
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

scene.add(
  sphere,
  plane,
  flagPole,
  // floor,
  plane2,
  plane3,
  plane4,
  plane5,
  stageScreen1,
  stageScreen2,
  stageScreen3,
  tileFloor,
  ball,
  sphereGroup
);

///gui

gui
  .add(hemisphericLight, "intensity")
  .min(0)
  .max(1)
  .step(0.001)
  .name("Hemispheric Light Intensity");

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
  .addColor(sphereColorObject, "sphereColor")
  .name("Sphere Group Color")
  .onChange(() => {
    sMaterial.color.set(sphereColorObject.color1);
  });

gui
  .add(debugElevation, "value")
  .min(0)
  .max(0.2)
  .step(0.1)
  .name("Floor Elevation");
gui
  .add(debugColorOffset, "value")
  .min(0)
  .max(0.35)
  .step(0.05)
  .name("Color Offset");

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
  switch: false
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

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
var maxLazerRotation = -0.1;

function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/* gui
  .add(lazer[0].rotation, "x")
  .min(-2)
  .max(2)
  .step(0.001)
  .name("x"); */

function moveLazers(averageFreq) {
  if (sound && sound.isPlaying) {
    analyser.getFrequencyData(soundDataArray);
    if (averageFreq > averageFrequencyForColorChange.value) {
      for (var j = 0; j < 11; j++) {
        // let p = clamp(averageFreq, -2, -0.94);
        let p = getRandomFloat(-2, -0.25);
        console.log(0 + p);
        topLeftLazer[j].rotation.x = 0 + p;
        topRightLazer[j].rotation.x = 0 + p;
        lowLazer1[j].rotation.x = 0 + p;
        lowLazer2[j].rotation.x = 0 + p;
      }
    } else {
      for (let j = 0; j < 11; j++) {
        lazer[j].rotation.z += 0.007;
        // lazer[j].rotation.x += 0.007;
        if (lazer[j].rotation.x >= maxLazerRotation) {
          // lazer[i].rotation.x = Math.sin(elapsedTime * lazerAngle);
          lazer[j].rotation.x = -1.4;
        }

        if (topLeftLazer[j].rotation.z >= 1.4) {
          topLeftLazer[j].rotation.z = 0;
        } else {
          topLeftLazer[j].visible = true;
          topLeftLazer[j].rotation.x = -0.94;
          topLeftLazer[j].rotation.z += 0.007;
        }

        if (topRightLazer[j].rotation.z <= -1.4) {
          topRightLazer[j].rotation.z = 0;
        } else {
          topRightLazer[j].visible = true;
          topRightLazer[j].rotation.x = -0.94;
          topRightLazer[j].rotation.z -= 0.007;
        }

        if (lowLazer1[j].rotation.z >= 1.4) {
          lowLazer1[j].rotation.z = 0;
          lowLazer2[j].rotation.z = 0;
        } else {
          lowLazer1[j].visible = true;
          lowLazer2[j].visible = true;
          lowLazer1[j].rotation.x = -1.57;
          lowLazer2[j].rotation.x = -1.57;
          lowLazer1[j].rotation.z += 0.007;
          lowLazer2[j].rotation.z -= 0.007;
        }
      }
    }
  } else {
    for (var i = 0; i < 11; i++) {
      lazer[i].rotation.x = 0;

      topLeftLazer[i].visible = false;
      topRightLazer[i].visible = false;
      lowLazer1[i].visible = false;
      lowLazer2[i].visible = false;
    }
  }
}

function moveCamera() {
  gsap.to(camera.position, { x: camera.position.x + 2 });
}

//socket io && ableton
let abletonMusicData = null;
var socket = io();
socket.on("musicEmit", function(msg) {
  abletonMusicData = msg;
});

let randomThreeColor = new THREE.Color(0xffffff);
let randomThreeColor2 = new THREE.Color(0xffffff);
let randomThreeColor3 = new THREE.Color(0xffffff);
let randomThreeColor4 = new THREE.Color(0xffffff);
//postprocessing effects
const composer = new EffectComposer(renderer);
let renderPass = new RenderPass(scene, camera);

composer.addPass(renderPass);
const bloomPass = new UnrealBloomPass();
bloomPass.strength = 0.8;
//composer.addPass(bloomPass);
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

gui.add(cameraObject, "switch").name("Orbit Camera");

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

  soundData = analyser.getAverageFrequency();
  moveSphereWave();
  moveLazers(soundData);

  logAf(soundData);
  if (soundData > averageFrequencyForColorChange.value) {
    const randomColorHex3 = Math.floor(Math.random() * 16777215).toString(16);
    const randomColorHex4 = Math.floor(Math.random() * 16777215).toString(16);
    let newColor3 = `#${randomColorHex3}`;
    let newColor4 = `#${randomColorHex4}`;
    randomThreeColor3.set(newColor3);
    randomThreeColor4.set(newColor4);
    sMaterial.color.set(randomThreeColor3);
    spotLight6.color.set(randomThreeColor3);
    spotLight.color.set(randomThreeColor4);
    //moveCamera();
  }
  /*   if (soundData) {
    //move lazers
    // hemisphericLight.intensity = soundData / 500;
    const lazerAngle = elapsedTime * 0.5;
    var maxLazerRotation = -0.1;
    for (i = 0; i < 11; i++) {
      lazer[i].rotation.x += 0.007;
      if (lazer[i].rotation.x >= maxLazerRotation) {
        // lazer[i].rotation.x = Math.sin(elapsedTime * lazerAngle);
        lazer[i].rotation.x = -1.4;
      }
    }
  } */

  //update controls
  controls.update();

  if (abletonMusicData > 0.9) {
    floorMaterial.uniforms.uBigWavesElevation.value = abletonMusicData * 0.5;

    perlinColorShaderMaterial.uniforms.uBigWavesElevation.value = abletonMusicData;

    //postprocessing
    //bloomPass.strength = 0.4;
    //bloomPass.strength = abletonMusicData;
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
  } else {
    floorMaterial.uniforms.uBigWavesElevation.value = abletonMusicData;
    perlinColorShaderMaterial.uniforms.uBigWavesElevation.value = abletonMusicData;
    // bloomPass.strength = abletonMusicData / 3;
    glitchPass.goWild = false;
    //bloomPass.strength = 0.2;
  }

  if (abletonMusicData) {
    spotLight.intensity = abletonMusicData * 15;
    spotLight6.intensity = abletonMusicData * 15;
  } else if (soundData) {
    spotLight.intensity = soundData * 0.05;
    spotLight6.intensity = soundData * 0.05;
  }

  //shaders
  shaderOneMaterial.uniforms.uTime.value = elapsedTime;

  //floorMaterial.uniforms.uTime.value = soundData * 0.02;
  //shaders
  //floorMaterial.uniforms.uBigWavesElevation.value = soundData * 0.003;

  /* try with ableton */
  //bloomPass.strength = abletonMusicData / 3;

  floorMaterial.uniforms.uTime.value = elapsedTime;
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
      // floor,
      plane2,
      plane3,
      plane4,
      plane5,
      ball,
      tileFloor,
      stage.scene,
      stageScreen1,
      stageScreen2,
      stageScreen3,
      piano.scene
    );
    for (var i = 0; i < 11; i++) {
      lazer[i].visible = false;
    }
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
      //  floor,
      plane2,
      plane3,
      plane4,
      plane5,
      ball,
      tileFloor,
      flagPole,
      stage.scene,
      stageScreen1,
      stageScreen2,
      stageScreen3,
      piano.scene
    );
    for (var i = 0; i < 11; i++) {
      lazer[i].visible = true;
    }
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
