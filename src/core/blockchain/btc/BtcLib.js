const AbstractCurrencyLib = require("../AbstractCurrencyLibrary");
const BtcValidator = require("../../validators/blockchain/BtcValidator");
const BlocksypherProvider = require("./BlocksypherProvider");
const { ECPair, TransactionBuilder, networks } = require("bitcoinjs-lib");
const BTC_NETWORK = networks.testnet;
console.log("BTC networks: ", networks);
// const BTC_ADDRESS = process.env.BTC_ADDRESS;
// we don`t need WIF from enviroment after mnemonic impl on web-app
// const BTC_WIF = process.env.BTC_WIF;
const DECIMALS = 8;

// console.log("BTC data - ", BTC_ADDRESS, BTC_WIF);

class BtcLib extends AbstractCurrencyLib {
  constructor(app) {
    let validator = new BtcValidator();
    let provider = new BlocksypherProvider(app, validator);
    super(app, provider, validator);
  }

  // getCurrentAddress() {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       return resolve(BTC_ADDRESS);
  //     } catch (e) {
  //       return reject(e);
  //     }
  //   });
  // }

  getBalance(address) {
    return new Promise(async (resolve, reject) => {
      try {
        this.validator.validateAddress(address);
        console.log("Address validated!");
        const balance = await this.provider.getBalance(address);
        // here shold be converting to Decimals
        const result = this.toDecimals(balance);
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
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

  sendCurrency(to, amount) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("BtcLib sendCurrency start");
        const txData = await this._formatTransactionParams(to, amount);
        const txRaw = await this._createSignRawTx(txData);
        const hash = await this.provider.sendTx(txRaw); // potential bugs!
        console.log("BtcLib sendCurrency txHash -", hash);
        return resolve(hash);
      } catch (e) {
        return reject(e);
      }
    });
  }

  _formatTransactionParams(to, amount) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("btcLib _fromatParams start");
        const from = await this.getCurrentAddress();
        // const privKey = await this.getPrivateKey();
        let fee = await this.provider.getFee();
        console.log("btcLib _fromatParams fee gotten");
        amount = parseFloat(amount);
        this.validator.validateAddress(to, "sendCurrency receiver");
        this.validator.validateNumber(amount, "sendCurrency ammount");
        this.validator.validateNumber(fee, "fee");
        amount = this.fromDecimals(amount);
        fee = this.fromDecimals(fee);
        console.log("_formatTxParams BTC after fromDec - ", fee);
        amount = Math.round(amount);
        fee = Math.round(fee);
        console.log("_formatTxParams BTC before txData", amount);
        let txData = {
          from,
          to,
          amount,
          fee,
        };
        console.log("_formatTxParams BTC, txData", txData);
        return resolve(txData);
      } catch (e) {
        return reject(e);
      }
    });
  }

  _createSignRawTx(txData) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("-----BtcLib _createSignRawTx start-----");
        // геренує об'єкт з WIF для конкретної мережі
        const privKey = await this.getPrivateKey();
        let keyring = await ECPair.fromWIF(privKey, this._getNetwork());
        console.log("keyring - ", keyring);
        let txBuilder = new TransactionBuilder(this._getNetwork());
        console.log("BtcLib addSignedUtxos");
        txBuilder = await this.provider.addSignedUtxos(
          keyring,
          txBuilder,
          txData // here Max add 4 properties separatelly. potential bugs !! 1:15
        );
        let txHash = txBuilder.build().toHex();
        this.validator.validateString("txHah ", txHash);
        console.log("_createSignRawTx, after txHash built - ", txHash);
        return resolve(txHash);
      } catch (e) {
        return reject(e);
      }
    });
  }
  _getNetwork() {
    return BTC_NETWORK;
  }
}

module.exports = BtcLib;
