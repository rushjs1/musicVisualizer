import * as THREE from "three";
import * as dat from "dat.gui";
import gsap from "gsap";
import flagVertexShader from "../../shaders/flag/vertex.glsl";
import flagFragmentShader from "../../shaders/flag/fragment.glsl";
import floorVertexShader from "../../shaders/floor/vertex.glsl";
import floorFragmentShader from "../../shaders/floor/fragment.glsl";
import perlinColorVertexShader from "../../shaders/perlinColor/vertex.glsl";
import perlinColorFragmentShader from "../../shaders/perlinColor/fragment.glsl";
import Experience from "../Experience.js";
import Environment from "./Environment.js";
import { io } from "socket.io-client";

export default class World {
  constructor(camera, renderer) {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.camera = camera.cameraInstance;
    this.renderer = renderer;
    this.gui = new dat.GUI({ width: 340 });
    this.gui.closed = true;
    //texture Loader
    this.textureLoader = new THREE.TextureLoader();
    //toggle world
    this.changeWorldBtn = document.querySelector(".clear-scene-btn");
    this.worldBool = true;
    this.worldOne();
    this.toggleInit();
    //environment
    this.environment = new Environment();

    //world bools
    this.isWorldOneInit = false;
    this.isWorldTwoInit = false;
    this.currentScene = 0;

    //world one Objects
    this.testMesh1;
    this.outsideSphere;
    this.flag;
    this.flagShaderMaterial;
    this.flagPole;
    this.floorShaderMaterial;
    this.floor;
    this.perlinColorShaderMaterial;
    this.plane2;
    this.plane3;
    this.plane4;
    this.plane5;
    this.tileFloor;
    this.ball;
    this.debugObject = {};
    this.perlinDebugObject = {};
    this.soundData = 0.0;
    this.abletonMusicData = null;
    this.socket;

    //world Two Objects
    this.testMesh2;
    this.particles;

    //group of spheres for viz
    this.sphereGroup = new THREE.Object3D();
    this.sphereColorObject = {};
    this.sphereColorObject.color1 = "#340c7d";
    this.sMaterial;
    this.spheres = [];
    this.sWidth = 64;
    //get song info
    this.selectedSongDV = document.getElementById("song-select");
    this.selectedSong;
    this.getSelectedSong();
    //threeAudio
    this.soundDataArray;
    this.bufferLength;
    this.analyser;
    this.listener;
    this.audioLoader;
    this.sound;
    this.buffer;
  }

  toggleInit() {
    this.changeWorldBtn.addEventListener("click", () => {
      this.toggleWorlds();
    });
  }

  toggleWorlds() {
    this.worldBool = !this.worldBool;
    if (this.worldBool) {
      this.scene.remove(this.particles, this.testMesh2);
      this.sphereGroup.visible = false;
      this.worldOne();
    } else {
      this.scene.remove(this.testMesh1, this.flagPole, this.flag, this.floor);
      this.worldTwo();
    }
  }

  //WORLD 1
  worldOne() {
    this.currentScene = 0;
    this.scene.background = new THREE.Color(0x2e2e2e);
    if (!this.isWorldOneInit) {
      this.listenForAbleton();
      this.testMesh1 = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      this.testMesh1.position.set(2, 2, 2);

      //FLAG
      const soicTexture = this.textureLoader.load(
        "/shaderTextures/soicMask1.jpeg"
      );
      this.flagShaderMaterial = new THREE.RawShaderMaterial({
        vertexShader: flagVertexShader,
        fragmentShader: flagFragmentShader,
        uniforms: {
          uFrequency: { value: new THREE.Vector2(10, 5) },
          uTime: { value: 0 },
          uColor: { value: new THREE.Color("orange") },
          uTexture: { value: soicTexture }
        }
      });
      this.flagPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 9.5, 32),
        new THREE.MeshBasicMaterial({
          color: 0x000000
        })
      );
      this.flagPole.position.x = -3.9;
      this.flagPole.position.z = 2.5;
      this.flag = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2, 32, 32),
        this.flagShaderMaterial
      );
      this.flag.scale.y = 2 / 3;
      this.flag.position.z = 2;
      this.flag.position.y = 4;
      this.flag.position.x = -3;
      this.flag.rotation.y = 0.6;

      // SHADER FLOOR
      this.debugObject = {
        depthColor: "#00ffa4",
        surfaceColor: "#8888ff"
      };
      this.floorShaderMaterial = new THREE.ShaderMaterial({
        vertexShader: floorVertexShader,
        fragmentShader: floorFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uBigWavesElevation: { value: 0.2 },
          uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
          uBigWavesSpeed: { value: 0.75 },
          //color
          uDepthColor: { value: new THREE.Color(this.debugObject.depthColor) },
          uSurfaceColor: {
            value: new THREE.Color(this.debugObject.surfaceColor)
          },
          uColorOffset: { value: 0.25 },
          uColorMulti: { value: 2 },
          uSoundData: { value: this.soundData }
        }
      });
      this.floor = new THREE.Mesh(
        new THREE.PlaneGeometry(40, 40, 128, 128),
        this.floorShaderMaterial
      );

      this.floor.rotation.x = -Math.PI * 0.5;
      this.floor.position.y = -0.65;
      this.gui
        .addColor(this.debugObject, "depthColor")
        .name("depthColor")
        .onChange(() => {
          this.floorShaderMaterial.uniforms.uDepthColor.value.set(
            this.debugObject.depthColor
          );
        });
      this.gui
        .addColor(this.debugObject, "surfaceColor")
        .name("surfaceColor")
        .onChange(() => {
          this.floorShaderMaterial.uniforms.uSurfaceColor.value.set(
            this.debugObject.surfaceColor
          );
        });

      //PERLIN COLOR SHADER
      this.perlinDebugObject = {
        surfaceColor: "#0087ff",
        depthColor: "#88949d"
      };
      this.perlinColorShaderMaterial = new THREE.ShaderMaterial({
        fragmentShader: perlinColorFragmentShader,
        vertexShader: perlinColorVertexShader,
        uniforms: {
          uTime: { value: 0 },
          uBigWavesElevation: { value: 0.2 },
          uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
          uBigWavesSpeed: { value: 0.75 },
          //color
          uDepthColor: {
            value: new THREE.Color(this.perlinDebugObject.depthColor)
          },
          uSurfaceColor: {
            value: new THREE.Color(this.perlinDebugObject.surfaceColor)
          },
          uColorOffset: { value: 0.25 },
          uColorMulti: { value: 2 },
          uSoundData: { value: this.soundData }
        }
      });
      this.ball = new THREE.Mesh(
        new THREE.IcosahedronGeometry(40, 16),
        this.perlinColorShaderMaterial
      );
      this.ball.position.set(0, 0, 0);
      this.gui
        .addColor(this.perlinDebugObject, "depthColor")
        .name("depthColor")
        .onChange(() => {
          this.perlinColorShaderMaterial.uniforms.uDepthColor.value.set(
            this.perlinDebugObject.depthColor
          );
        });

      this.gui
        .addColor(this.perlinDebugObject, "surfaceColor")
        .name("surfaceColor")
        .onChange(() => {
          this.perlinColorShaderMaterial.uniforms.uSurfaceColor.value.set(
            this.perlinDebugObject.surfaceColor
          );
        });

      this.scene.add(
        this.testMesh1,
        this.flagPole,
        this.flag,
        this.floor,
        this.ball
      );
    } else {
      this.scene.add(
        this.testMesh1,
        this.flagPole,
        this.flag,
        this.floor,
        this.ball
      );
    }
    this.isWorldOneInit = true;
    console.log("Scene:" + this.currentScene);
  }
  worldTwo() {
    this.currentScene = 1;
    this.scene.background = new THREE.Color(0x6e6e6e);
    if (!this.isWorldTwoInit) {
      this.testMesh2 = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      );
      this.testMesh2.position.set(-2, 1, 1);

      //particles
      this.particleTexture = this.textureLoader.load("/particles/1.png");
      this.particlesGeo = new THREE.BufferGeometry();
      this.count = 1750;
      this.partPos = new Float32Array(this.count * 3);
      for (let i = 0; i < this.count * 3; i++) {
        this.partPos[i] = (Math.random() - 0.5) * 30;
      }
      this.particlesGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(this.partPos, 3)
      );
      this.partMat = new THREE.PointsMaterial({
        size: 0.2,
        sizeAttenuation: true,
        color: new THREE.Color(0xff3000),
        transparent: true,
        alphaMap: this.particleTexture,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      this.particles = new THREE.Points(this.particlesGeo, this.partMat);

      //viz
      this.positionSpheres();
      window.addEventListener("keypress", event => {
        if (this.sound && !this.sound.isPlaying) {
          this.sound.play();
        } else {
          this.sound.pause();
        }
      });
      window.addEventListener("touchend", event => {
        if (this.sound && !this.sound.isPlaying) {
          this.sound.play();
        } else {
          this.sound.pause();
        }
      });
      //add to scene
      this.scene.add(this.testMesh2, this.particles, this.sphereGroup);
    } else {
      this.scene.add(this.particles, this.testMesh2);
      this.sphereGroup.visible = true;
    }
    this.isWorldTwoInit = true;
    console.log("Scene:" + this.currentScene);
  }

  createSphere(geo, mat) {
    const newSphere = new THREE.Mesh(geo, mat);
    newSphere.position.y = 0.5;
    return newSphere;
  }
  positionSpheres() {
    const sGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    this.sMaterial = new THREE.MeshBasicMaterial({
      color: this.sphereColorObject.color1,
      specular: 0xffffff,
      shininess: 100,
      emissive: 0x0,
      flatShading: THREE.SmoothShading,
      side: THREE.DoubleSide
    });
    for (let i = 0; i < this.sWidth / 8; i++) {
      for (let j = 0; j < this.sWidth; j++) {
        let sSphere = this.createSphere(sGeometry, this.sMaterial);
        this.sphereGroup.add(sSphere);
        sSphere.position.x = j;
        sSphere.position.y = i;
        sSphere.position.z = i;

        this.spheres.push(sSphere);
      }
    }
    this.sphereGroup.position.set(-26, -6, 0);
  }

  getSelectedSong() {
    this.selectedSong = this.selectedSongDV.options[
      this.selectedSongDV.selectedIndex
    ].value;
    console.log(this.selectedSong);
    this.loadThreeAudio(this.selectedSong);
    this.selectedSongDV.addEventListener("change", () => {
      this.selectedSong = this.selectedSongDV.options[
        this.selectedSongDV.selectedIndex
      ].value;
      console.log(this.selectedSong);
      this.loadThreeAudio(this.selectedSong);
    });
  }

  loadThreeAudio(song) {
    if (this.sound && this.sound.isPlaying) {
      this.sound.pause();
    }

    let sound = this.sound;
    this.listener = new THREE.AudioListener();

    this.camera.add(this.listener);
    sound = new THREE.Audio(this.listener);
    this.audioLoader = new THREE.AudioLoader();
    this.audioLoader.load(`/songs/${song}.mp3`, function(buffer) {
      console.log(buffer);
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
    });
    //THREE ANALYSER
    this.sound = sound;
    this.analyser = new THREE.AudioAnalyser(this.sound, 1024);
    this.soundDataArray = this.analyser.data;
    this.bufferLength = this.analyser.analyser.frequencyBinCount;
  }

  moveSphereWave() {
    if (this.sound && this.sound.isPlaying) {
      this.analyser.getFrequencyData(this.soundDataArray);

      for (var i = 0; i < this.bufferLength; i++) {
        const p = this.soundDataArray[i];
        const s = this.spheres[i];
        const z = s.position;
        gsap.to(z, 0.2, {
          y: p / 20
        });
      }
    }
  }

  listenForAbleton() {
    this.socket = io();
    this.socket.on("musicEmit", msg => {
      this.abletonMusicData = msg;
    });
  }
}
