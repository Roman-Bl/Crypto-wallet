const AbstractCurrencyWallet = require("./AbstractCurrencyWallet");
const { payments, networks } = require("bitcoinjs-lib");
const bip39 = require("bip39");
const bip32 = require("bip32");
// const isProduction = require("/src/isProduction");

class BtcWallet extends AbstractCurrencyWallet {
  _getDirevationPath() {
    // return isProduction ? `m/44'/0'/0'/0/0` : `m/44'/1'/0'/0/0`;
    return `m/44'/1'/0'/0/0`;
  }
  _getNetwork() {
    // return isProduction ? networks.bitcoin : networks.testnet;
    return networks.testnet;
  }
  provideAddress(mnemonic) {
    return new Promise(async (resolve, reject) => {
      try {
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const root = bip32.fromSeed(seed, this._getNetwork());
        const child = root.derivePath(this._getDirevationPath());
        const { address } = payments.p2pkh({
          pubkey: child.publicKey,
          network: this._getNetwork(),
        });
        return resolve(address);
      } catch (e) {
        return reject(e);
      }
    });
  }
  providePrivateKey(mnemonic) {
    return new Promise(async (resolve, reject) => {
      try {
        const seed = await bip39.mnemonicToSeed(mnemonic);
        const root = bip32.fromSeed(seed, this._getNetwork());
        const child = root.derivePath(this._getDirevationPath());
        const privateKey = child.toWIF();
        // so we return WIF not private key actually. Better return priv and then transform to WIF but for time optimization I will leave it for now
        return resolve(privateKey);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

module.exports = BtcWallet;
