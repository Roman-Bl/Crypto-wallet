const bip39 = require("bip39");

class MnemonicGenerator {
  generateMnemonic() {
    return bip39.generateMnemonic();
  }
}
// Here we could apgrade the logic of generator to make it more secure

module.exports = MnemonicGenerator;
