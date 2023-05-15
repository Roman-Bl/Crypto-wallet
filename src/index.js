"use strict";

// imports

// import Web3 from "web3";
// import WalletUI from "./core/ui/WalletUI.js";
const WalletUI = require("./core/ui/WalletUI");
const BlockchainService = require("./core/blockchain/BlockchainService");
const HttpService = require("./core/services/httpService");
// const HttpService = require("./core/services/HttpService");
// const AbstractCurrencyLibrary = require("./core/blockchain/AbstractCurrencyLibrary");

// 2nd way of import

// console.log(Web3);

// global variables
const CURRENCY = "ETH";

class App {
  constructor() {
    this.setCurrency(CURRENCY);
    this.httpService = new HttpService(this);
    this.walletUI = new WalletUI(this);
    // this.currencyLibrary = new AbstractCurrencyLibrary(this);
    this.blockchain = new BlockchainService(this);
  }

  // Interacting with external modules
  prepareInterface() {
    console.log("prepareInterface (app) start...");
    this.walletUI.prepareInterface();
    console.log("prepareInterface (app) end...");
  }

  setCurrency(currency) {
    this.currency = currency;
    console.log("setCurrency done (app)");
  }

  getCurrency() {
    return this.currency;
  }
  changeCurrency(currency) {
    this.setCurrency(currency);
    this.prepareInterface(); // оновлює UI при перемиканні протоколів в такій прогресії - 1/2/4/8/16/32/65 і тд
  }

  getCurrentBalance() {
    return new Promise(async (resolve, reject) => {
      try {
        let balance = await this.blockchain.getCurrentBalance();
        return resolve(balance);
      } catch (e) {
        return reject(e);
      }
    });
  }

  getCurrentAddress() {
    return new Promise(async (resolve, reject) => {
      try {
        let address = await this.blockchain.getCurrentAddress();
        return resolve(address);
      } catch (e) {
        return reject(e);
      }
    });
  }
  sendCurrency(to, amount) {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.blockchain.sendCurrency(to, amount);
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
  }

  generateMnemonic() {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.blockchain.generateMnemonic();
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
  }
  importMnemonic(mnemonic) {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.blockchain.importMnemonic(mnemonic);
        this.prepareInterface();
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
  }

  // setProvider() {
  //   this.blockchain.setProvider();
  // }
}

let app = new App();

// app.prepareInterface();
// const test = app.setProvider();
// console.log("test", test);
// console.log(app.walletUI);
// ----------------------------------------------
// app.setEventListeners();
// app.sendCurrency();
// btnSend.addEventListener("click", app.sendCurrency);

// btnSend.addEventListener("click", function (event) {
//   event.preventDefault();
//   console.log("click");
//   app.sendCurrency();
// });
