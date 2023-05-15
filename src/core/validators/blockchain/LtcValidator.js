const WalletAddressValidator = require("wallet-address-validator");
const LTC = "BTC";
const AbstractCurrencyValidator = require("./AbstractCurrencyValidator");

class LtcValidator extends AbstractCurrencyValidator {
  validateAddress(address) {
    this.validateString(address, "LTC Address");
    WalletAddressValidator.validate(address, LTC);
  }
}

module.exports = LtcValidator;
