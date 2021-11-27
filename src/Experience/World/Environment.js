import Experience from "../Experience.js";

export default class Environment {
  constructor() {
    this.experience = new Experience();
    console.log("environment", this.experience);
  }
}
