// Imports
// import Renderer from "./Renderer.js";
const Renderer = require("./Renderer");
// import ListenerSetter from "./ListenerSetter.js";
// const ListenerSetter = require("./ListenerSetter");

class WalletUI {
  constructor(app) {
    this.renderer = new Renderer(app);
    // this.listenerSetter = new ListenerSetter(app);
  }
  prepareInterface() {
    this.renderer.renderUI();
    // this.listenerSetter.setEventListeners();
  }
}

module.exports = WalletUI;
// export default WalletUI;
