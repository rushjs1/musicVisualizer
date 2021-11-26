import Experience from "../Experience.js";

export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    console.log(this.scene);
  }
}
