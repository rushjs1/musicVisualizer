import Experience from "../Experience.js";
import Environment from "./Environment.js";
export default class World {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.environment = new Environment();
  }
}
