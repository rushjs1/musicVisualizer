import Sizes from "./Utils/Sizes.js";
import Time from "./Utils/Time.js";

export default class Experience {
  constructor(canvas) {
    window.experience = this;
    //options
    this.canvas = canvas;

    //setup
    this.sizes = new Sizes();
    this.time = new Time();

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
