const ListenerSetter = require("./ListenerSetter");

class Renderer {
  constructor(app) {
    this.app = app;
    this.listenerSetter = new ListenerSetter(app);
    // this.listenerSetter.setEventListeners();
  }
  //   rendering

  renderUI() {
    this.renderCurrency();
    console.log("renderUI -> renderCurrency end");
    this.renderBalance();
    console.log("renderUI -> renderBalance end");
    this.renderAddress();
  }
  renderCurrency() {
    let elements = document.querySelectorAll(".currency-symbol");
    elements.forEach((el) => (el.textContent = this.app.getCurrency()));
    // console.log(elements);
  }
  renderBalance() {
    let element = document.querySelector(".currency-balance");
    this.app
      .getCurrentBalance()
      .then((balance) => (element.innerHTML = balance));
  }
  renderAddress() {
    let receiveAddress = document.querySelector("#wallet-address");
    this.app
      .getCurrentAddress()
      .then((address) => (receiveAddress.innerHTML = address));
    let headerAddress = document.querySelector("#account-address");
    this.app
      .getCurrentAddress()
      .then((address) => (headerAddress.innerHTML = address));
    // headerAddress.innerHTML = this.app.getAddress();
  }
}

// export default Renderer;
module.exports = Renderer;
