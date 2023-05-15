const BtcLib = require("../btc/BtcLib");
const LtcBlockcypherProvider = require("/src/core/blockchain/ltc/LtcBlockcypherProvider");
const LtcValidator = require("/src/core/validators/blockchain/LtcValidator");
// const LtcConverter = require("/src/core/helpers/LtcConverter");
const NETWORK = require("../../blockchain/ltc/LtcNetworks")["main"];
DECIMALS = 8;

class LtcLib extends BtcLib {
  constructor(app) {
    super(app);
    this.validator = new LtcValidator();
    // this.converter = new LtcConverter();
    this.provider = new LtcBlockcypherProvider(
      app,
      this.validator
      //   this.converter
    );
  }

  toDecimals(amount) {
    const amountFromWei = amount / 10 ** DECIMALS;
    this.validator.validateNumber(amountFromWei);
    console.log("BTC toDecimals() - ,", amountFromWei);
    return amountFromWei;
  }

  fromDecimals(amount) {
    const amountToWei = amount * 10 ** DECIMALS;
    this.validator.validateNumber(amountToWei);
    console.log("BTC FromDecimals() - ,", amountToWei);
    return amountToWei;
  }
  _getNetwork() {
    return NETWORK;
  }
}

module.exports = LtcLib;
