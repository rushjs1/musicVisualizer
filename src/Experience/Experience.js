import * as THREE from "three";

import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";
import Camera from "./Camera.js";

export default class Experience {
  constructor(canvas) {
    window.experience = this;
    //options
    this.canvas = canvas;

    //setup
    this.sizes = new Sizes();
    this.time = new Time();
    this.scene = new THREE.Scene();
    this.camera = new Camera();

    ///sizes event
    this.sizes.on("resize", () => {
      this.resize();
    });

    //tick event
    this.time.on("tick", () => {
      this.update();
    });
  }

  resize() {}
  update() {}
}
