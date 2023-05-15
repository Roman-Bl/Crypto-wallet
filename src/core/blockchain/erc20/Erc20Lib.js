const EthLib = require("../eth/EthLib");
const ERC20_ABI = require("./erc20_abi");
const contractAddress = process.env.TOKEN_CONTRACT;
const GAS_LIMIT = 300000;

class Erc20Lib extends EthLib {
  constructor(app) {
    super(app);
    this.setContract();
  }

  composeContract() {
    // console.log("composeContract start, ", ERC20_ABI);
    return new this.provider.eth.Contract(ERC20_ABI, this.getContractAddress());
  }

  setContract() {
    this.contract = this.composeContract();
  }

  getContractAddress() {
    return contractAddress;
  }

  getContract() {
    return this.contract;
  }

  getBalance(address) {
    return new Promise(async (resolve, reject) => {
      try {
        // let address = await this.getCurrentAddress();
        // console.log("erc20 address - ", address);
        this.validator.validateAddress(address);

        let balance = await this.getContract()
          .methods.balanceOf(address)
          .call();
        console.log("raw balance - ", balance);
        balance = await this.toDecimals(balance);
        console.log("balance after toDecimalsNew() - ", balance);
        return resolve(balance);
      } catch (e) {
        return reject(e);
      }
    });
  }

  getGasLimit() {
    return GAS_LIMIT;
  }

  sendCurrency(to, amount) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("erc20 amount", amount, typeof amount);
        amount = await this.fromDecimals(amount);
        console.log("erc20 amount after", amount, typeof amount);
        let data = this.getContract().methods.transfer(to, amount).encodeABI();
        let txData = await this._formatTransactionParams(
          // тут міняємо атрибути to, amount/value, data
          this.getContractAddress(),
          (value = 0),
          data
        );
        let hash = await this._makeTransaction(txData);
        return resolve(hash);
      } catch (e) {
        return reject(e);
      }
    });
  }

  //  rewriting existing parent methods
  fromDecimals(amount) {
    return new Promise(async (resolve, reject) => {
      try {
        let dec = await this.getContract().methods.decimals().call();
        console.log("decimals - ,", dec);
        let amountToWei = this.provider.utils.toBN(
          "0x" + (amount * 10 ** dec).toString(16)
        );
        // return web3.utils.toBN("0x" + (amount * 10 ** decimals).toString(16)).toString();
        // console.log("custom fromDec() - ", amountToWei);
        return resolve(amountToWei);
      } catch (e) {
        return reject(e);
      }
    });
  }

  toDecimals(amount) {
    return new Promise(async (resolve, reject) => {
      try {
        let dec = await this.getContract().methods.decimals().call();
        let amountFromWei = amount / 10 ** dec;
        this.validator.validateNumber(amountFromWei);
        // need to fix error first
        // let amountFromWei = this.web3.utils.toBN(
        //   "0x" + (amount / 10 ** dec).toString(16)
        // );
        // console.log("custom toDec() - ", amountFromWei);
        return resolve(amountFromWei);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

module.exports = Erc20Lib;
