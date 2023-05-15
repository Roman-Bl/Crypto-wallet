const Web3 = require("web3");
// import Transactions from 'ethereumjs-tx';
const Transaction = require("ethereumjs-tx");
const Validator = require("../../validators/blockchain/EthValidator");
const AbstractCurrencyLib = require("../AbstractCurrencyLibrary");

const PROVIDER_URL = process.env.ETH_PROVIDER_API;
const CurrentPK = process.env.PRIVATE_KEY;
const address = process.env.WALLET_ADDRESS;
// console.log("ETH data - ", address, CurrentPK);

// console.log(address);
// console.log(CurrentPK);

const GWEI = 10 ** 9; // we hardcode it but better to get live from API (gas station)
const GAS_PRICE = 70 * GWEI;
const GAS_LIMIT = 21000;

class EthLib extends AbstractCurrencyLib {
  constructor(app) {
    const web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL));
    const validator = new Validator();
    super(app, web3, validator);
  }
  //now this two methods implemented in parent class
  // getCurrentAddress() {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       return resolve(address);
  //     } catch (e) {
  //       return reject(e);
  //     }
  //   });
  // }
  // getPrivateKey() {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       return resolve(CurrentPK);
  //     } catch (e) {
  //       return reject(e);
  //     }
  //   });
  // }

  getBalance(address) {
    return new Promise(async (resolve, reject) => {
      try {
        let balance = await this.provider.eth.getBalance(address);
        balance = Number(this.provider.utils.fromWei(balance)).toFixed(5);
        // console.log(balance);
        return resolve(balance);
      } catch (e) {
        return reject(e);
      }
    });
  }

  getNextNonce() {
    return new Promise(async (resolve, reject) => {
      try {
        let address = await this.getCurrentAddress();
        let nonce = await this.provider.eth.getTransactionCount(address);
        console.log("nonce - " + nonce);
        return resolve(nonce);
      } catch (e) {
        return reject(e);
      }
    });
  }

  sendCurrency(to, amount) {
    return new Promise(async (resolve, reject) => {
      try {
        this.validator.validateAddress(to, "sendCurrncy receiver");
        this.validator.validateNumber(amount, "sendCurrncy ammount");
        let txData = await this._formatTransactionParams(to, amount);
        let hash = await this._makeTransaction(txData);
        return resolve(hash);
      } catch (e) {
        return reject(e);
      }
    });
  }
  _getChainID() {
    return 11155111;
  }

  _formatTransactionParams(to, amount, data = "") {
    return new Promise(async (resolve, reject) => {
      try {
        this.validator.validateAddress(to);
        this.validator.validateNumber(amount);
        this.validator.validateString(data);
        let privateKey = await this.getPrivateKey();
        console.log("EthLib priv key- ", privateKey);
        this.validator.validateString(privateKey);
        let privateKeyBuffer = Buffer.from(privateKey, "hex"); // щоб закинути в бібліотеку і подписати - потрібно перетворити в набів байтів
        let from = await this.getCurrentAddress();
        let nonce = await this.getNextNonce();
        this.validator.validateAddress(from);
        this.validator.validateNumber(nonce);
        let gasLimit = this.getGasLimit();
        let gasPrice = this.getGasPrice();
        let chainId = this._getChainID();
        // amount = this.toDecimals(amount); max implement // 34:45 value/amount
        amount = await this.fromDecimals(amount);
        console.log("EthLib _formatTransactionParams -- amount - ", amount);

        let txParams = {
          from,
          to,
          privateKey: privateKeyBuffer,
          value: this.provider.utils.numberToHex(amount),
          gasPrice: this.provider.utils.numberToHex(gasPrice),
          gasLimit,
          nonce,
          data,
          chainId,
        };
        console.log("_formatTransactionParams - txParams", txParams);

        return resolve(txParams);
      } catch (e) {
        return reject(e);
      }
    });
  }

  toDecimals(amount) {
    return this.provider.utils.fromWei(amount);
  }

  fromDecimals(amount) {
    return this.provider.utils.toWei(amount);
  }

  getGasPrice() {
    return GAS_PRICE;
  }

  getGasLimit() {
    return GAS_LIMIT;
  }

  // getProvider() {
  //   return PROVIDER_URL;
  // }

  // setProvider() {
  //   let provider = this.getProvider();
  //   console.log(provider);
  //   return provider;
  // }

  _makeTransaction(txParams) {
    return new Promise(async (resolve, reject) => {
      try {
        let tx = new Transaction(txParams);
        console.log("_makeTransaction: tx - ", tx);
        console.log("_makeTransaction: txParams - ", txParams);
        tx.sign(txParams.privateKey);

        const raw = `0x${tx.serialize().toString("hex")}`;
        this.provider.eth
          .sendSignedTransaction(raw)
          .on("receipt", (data) => {
            console.log(data);
            let transactionHash = data["transactionHash"];
            return resolve(transactionHash);
          })
          .on("error", (e) => {
            console.error(e);
            return reject(e);
          });
      } catch (e) {
        return reject(e);
      }
    });
  }
}

module.exports = EthLib;
