const Validator = require("../validators/Validator");
const staticValidator = new Validator();

class AbstractCurrencyLibrary {
  constructor(app, provider, validator) {
    this.app = app;
    staticValidator.validateObject(provider, "provider");
    staticValidator.validateObject(validator, "validator");
    this.provider = provider;
    this.validator = validator;
  }
  getCredentials() {
    return this.app.blockchain.credentials;
  }
  getCurrentAddress() {
    return new Promise(async (resolve, reject) => {
      try {
        let address = await this.getCredentials().getAddress();
        // throw "getCurrentAddress() not implemented in Abstract Parent Class";
        console.log("AbstractCurrencyLibrary getCurrentAddress", address);
        return resolve(address);
      } catch (e) {
        return reject(e);
      }
    });
  }
  getPrivateKey() {
    return new Promise(async (resolve, reject) => {
      try {
        let privKey = await this.getCredentials().getPrivateKey();
        // throw "getPrivateKey() not implemented in Abstract Parent Class";
        console.log("AbstractCurrencyLibrary getPrivateKey", privKey);
        return resolve(privKey);
      } catch (e) {
        return reject(e);
      }
    });
  }

  getCurrentBalance() {
    return new Promise(async (resolve, reject) => {
      try {
        let address = await this.getCurrentAddress();
        let balance = await this.getBalance(address);
        // balance = Number(this.web3.utils.fromWei(balance)).toFixed(5);
        // console.log(balance);
        return resolve(balance);
      } catch (e) {
        return reject(e);
      }
    });
  }
  getBalance(address) {
    return new Promise(async (resolve, reject) => {
      try {
        throw "getBalance() not implemented in Abstract Parent Class";
      } catch (e) {
        return reject(e);
      }
    });
  }

  sendCurrency(to, amount) {
    return new Promise(async (resolve, reject) => {
      try {
        throw "sendCurrency() not implemented in Abstract Parent Class";
      } catch (e) {
        return reject(e);
      }
    });
  }
}
module.exports = AbstractCurrencyLibrary;

// my old implementation that I understand wrong
// const Blockchain = require("./BlockchainService");
// class AbstractCurrencyLibrary {
//   constructor(app) {
//     this.blockchain = new Blockchain(app);
//   }
//   getCurrentAddress() {
//     return new Promise(async (resolve, reject) => {
//       try {
//         let address = await this.blockchain.getCurrentAddress();
//         return resolve(address);
//       } catch (e) {
//         return reject(e);
//       }
//     });
//   }

//   getCurrentBalance() {
//     return new Promise(async (resolve, reject) => {
//       try {
//         let balance = await this.blockchain.getCurrentBalance();
//         return resolve(balance);
//       } catch (e) {
//         return reject(e);
//       }
//     });
//   }

//   sendCurrency(to, amount) {
//     return new Promise(async (resolve, reject) => {
//       try {
//         let result = await this.blockchain.sendCurrency(to, amount);
//         return resolve(result);
//       } catch (e) {
//         return reject(e);
//       }
//     });
//   }

//   setProvider() {
//     this.blockchain.setProvider();
//   }
// }
