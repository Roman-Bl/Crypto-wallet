const BtcWallet = require("./BtcWallet");
const NETWORK = require("./../../ltc/LtcNetworks")["main"];

class LtcWallet extends BtcWallet {
  _getDirevationPath() {
    return `m/44'/2'/0'/0/0`;
  }
  _getNetwork() {
    return NETWORK;
  }
}

module.exports = LtcWallet;
