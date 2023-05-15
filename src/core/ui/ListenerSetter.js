// selectors
const btnSend = document.querySelector(".btn--send");

const protocolsContainer = document.querySelector(".protocols__container");
const protocols = document.querySelectorAll(".protocol");
const btnGenerateMnemonic = document.getElementById("generate-mnemonic");
const inputMnemonic = document.getElementById("import-mnemonic");
console.log(protocols);
// console.log(btnGenerateMnemonic);
// console.log(inputMnemonic);

class ListenerSetter {
  constructor(app) {
    this.app = app;
    this.setEventListeners();
  }
  //   initializing eventListeners
  setEventListeners() {
    this.setSendListener();
    this.setProtocolListener();
    this.setMnemonicListeners();
  }

  setMnemonicListeners() {
    this.setGenerateMnemonicListener();
    this.setImportMnemonicInputListener();
  }

  setSendListener() {
    btnSend.addEventListener("click", (event) => {
      event.preventDefault();
      const to = document.querySelector("#to").value;
      const amount = document.querySelector("#ammount").value;
      console.log("click");
      console.log(amount, typeof amount);
      this.app.sendCurrency(to, amount).then((result) => console.log(result));
    });
  }

  setProtocolListener() {
    protocolsContainer.addEventListener("click", (e) => {
      e.preventDefault();
      const item = e.target.closest(".protocol");
      console.log(item);
      let selectedProtocol = item.getAttribute("data-value");
      console.log(selectedProtocol);
      this.app.changeCurrency(selectedProtocol);
      // console.log("test");
      protocols.forEach((p) => p.classList.remove("protocol--active"));
      item.classList.toggle("protocol--active");
    });
  }
  setGenerateMnemonicListener() {
    btnGenerateMnemonic.addEventListener("click", async (e) => {
      let mnemonic = await this.app.generateMnemonic();
      // alert("Generating mnemonic");
      alert(mnemonic);
    });
  }

  setImportMnemonicInputListener() {
    inputMnemonic.addEventListener("input", (e) => {
      let element = e.target || e.srcElement;
      let mnemonic = element.value;
      console.log(mnemonic);
      this.app.importMnemonic(mnemonic);
    });
  }
}

// export default ListenerSetter;
module.exports = ListenerSetter;
