const BlocksypherProvider = require("../btc/BlocksypherProvider");
const PROVIDER_URL = "https://api.blockcypher.com/v1/ltc";
const NETWORK = "main";

class LtcBlockcypherProvider extends BlocksypherProvider {
  _getProviderUrl() {
    return PROVIDER_URL;
  }
  _getProviderNetwork() {
    return NETWORK;
  }
}

module.exports = LtcBlockcypherProvider;
