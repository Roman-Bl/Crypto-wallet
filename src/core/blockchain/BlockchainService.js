const EthLib = require("./eth/EthLib");
const Erc20Lib = require("./erc20/Erc20Lib");
const BtcLib = require("./btc/BtcLib");
const LtcLib = require("./ltc/LtcLib");
const BscLib = require("./bsc/BscLib");
const CredentialService = require("./credentials/CredentialService");

class BlockchainService {
  constructor(app) {
    this.app = app;
    console.log("app constructor", app);
    this.credentials = new CredentialService(app);
    const eth = new EthLib(app);
    const erc20 = new Erc20Lib(app);
    const btc = new BtcLib(app);
    const ltc = new LtcLib(app);
    const bsc = new BscLib(app);

    this.libraries = {
      ETH: eth,
      ERC20: erc20,
      BTC: btc,
      LTC: ltc,
      BSC: bsc,
    }; // робимо асоціативний масив, тому фігурні дужки. В JS це об'єкт
  }

  getCurrentLibrary() {
    return this.libraries[this.app.getCurrency()];
  }

  getCurrentBalance() {
    return new Promise(async (resolve, reject) => {
      try {
        let balance = await this.getCurrentLibrary().getCurrentBalance();
        return resolve(balance);
      } catch (e) {
        return reject(e);
      }
    });
  }
  getCurrentAddress() {
    return new Promise(async (resolve, reject) => {
      try {
        let address = await this.getCurrentLibrary().getCurrentAddress();
        return resolve(address);
      } catch (e) {
        return reject(e);
      }
    });
  }
  sendCurrency(to, amount) {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.getCurrentLibrary().sendCurrency(to, amount);
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
  }

  generateMnemonic() {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.credentials.generateMnemonic();
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
  }
  importMnemonic(mnemonic) {
    return new Promise(async (resolve, reject) => {
      try {
        let result = await this.credentials.importMnemonic(mnemonic);
        // TODO update credentials
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
  }

  // setProvider() {
  //   this.getCurrentLibrary().setProvider();
  // }
}

module.exports = BlockchainService;
