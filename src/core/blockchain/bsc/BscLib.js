const Web3 = require("web3");
const EthLib = require("../eth/EthLib");
const BscValidator = require("../../validators/blockchain/BscValidator");

const PROVIDER_URL = process.env.BSC_PROVIDER_API;

class BscLib extends EthLib {
  constructor(app) {
    super(app);
    this.provider = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL));
    this.validator = new BscValidator();
  }
  _getChainID() {
    return 97;
  }
}

module.exports = BscLib;
