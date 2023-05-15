const Validator = require("../../validators/Validator");
const EthWallet = require("./protocols/EthWallet");
const ERC20Wallet = require("./protocols/ERC20Wallet");
const BTCWallet = require("./protocols/BtcWallet");
const MnemonicGenerator = require("./MnemonicGenerator");
const LtcWallet = require("./protocols/LtcWallet");
const BscWallet = require("./protocols/BscWallet");

const ETH = "ETH";
const ERC20 = "ERC20";
const BTC = "BTC";

class CredentialService {
  constructor(app) {
    this.app = app;
    this.validator = new Validator();
    this.generator = new MnemonicGenerator();
    let eth = new EthWallet();
    let erc20 = new ERC20Wallet();
    let btc = new BTCWallet();
    let ltc = new LtcWallet();
    let bsc = new BscWallet();
    this.mnemonic = "";
    this.protocols = {
      ETH: eth,
      ERC20: erc20,
      BTC: btc,
      LTC: ltc,
      BSC: bsc,
    };
  }
  _getActiveProtocol() {
    return this.protocols[this.app.getCurrency()];
  }
  generateMnemonic() {
    return this.generator.generateMnemonic();
  }

  _setMnemonic(mnemonic) {
    this.validator.validateString(mnemonic);
    this.mnemonic = mnemonic;
  }
  _getMnemonic() {
    return this.mnemonic;
  }
  importMnemonic(mnemonic) {
    this._setMnemonic(mnemonic);
  }

  getAddress() {
    return new Promise(async (resolve, reject) => {
      try {
        return resolve(
          this._getActiveProtocol().provideAddress(this._getMnemonic())
        );
      } catch (e) {
        return reject(e);
      }
    });
  }

  getPrivateKey() {
    return new Promise(async (resolve, reject) => {
      try {
        return resolve(
          this._getActiveProtocol().providePrivateKey(this._getMnemonic())
        );
      } catch (e) {
        return reject(e);
      }
    });
  }
}

module.exports = CredentialService;
