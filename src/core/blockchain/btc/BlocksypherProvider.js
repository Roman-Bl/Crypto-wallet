const BTC_API_PROVIDER = "https://api.blockcypher.com/v1/btc";
const NETWORK = "test3";
const API_TOKEN = process.env.BLOCKSYPHER_API_TOKEN;
const SEND = "SEND";
const BALANCE = "BALANCE";
const FEE = "FEE";
const GET_UTXO = "GET_UTXO";
const PROBLEM_WITH_NODE = "PROBLEM_WITH_NODE";
const WRONG_FEE = "WRONG FEE";
const TXSIZE = 0.512; //512 bytes
const BTC_ADDRESS = process.env.BTC_ADDRESS;
const DECIMALS = 8;

class BlocksypherProvider {
  constructor(app, validator) {
    this.httpService = app.httpService; // need to try optimise using just app.httpS belo in the code
    this.validator = validator;
  }
  getBalance(address) {
    return new Promise(async (resolve, reject) => {
      try {
        // let url = https://api.blockcypher.com/v1/btc/test3/addrs/mfmQxZiGrkG2CCfbVw9VNnVFYgLzxPUFyV/balance
        // let url = `https://api.blockcypher.com/v1/btc/test3/addrs/${BTC_ADDRESS}/balance`;
        let url = this.urlCompose(BALANCE, { address: address });
        console.log("getBalance url - ", url);
        // let data = null;
        // let method = "GET";
        let result = await this.getRequest(url);
        console.log("getBalance result -", result);
        let balance = result.final_balance;
        console.log("getBalance balance -", balance);
        return resolve(balance);
      } catch (e) {
        return reject(e);
      }
    });
  }

  _getProviderUrl() {
    return BTC_API_PROVIDER;
  }
  _getProviderNetwork() {
    return NETWORK;
  }

  urlCompose(action, parameters) {
    let base = `${this._getProviderUrl()}/${this._getProviderNetwork()}`;
    let relativeUrl = "";
    let address = "";
    switch (action) {
      case BALANCE:
        this.validator.validateObject(parameters, "urlCompose.parameters");
        address = parameters["address"];
        this.validator.validateAddress(address);
        relativeUrl = `/addrs/${address}/balance?1`;
        break;
      case SEND:
        relativeUrl = `/txs/push?1`;
        break;
      case FEE:
        relativeUrl = `?1`;
        break;
      case GET_UTXO:
        this.validator.validateObject(parameters, "urlCompose.parameters");
        address = parameters["address"];
        this.validator.validateAddress(address);
        relativeUrl = `/addrs/${address}?unspentOnly=true`;
        break;
    }
    let url = `${base}${relativeUrl}&token=${API_TOKEN}`;
    console.log(action, url);
    return url;
  }

  getFee() {
    return new Promise(async (resolve, reject) => {
      try {
        let url = this.urlCompose(FEE);
        console.log("getFee url", url);
        let result = await this.getRequest(url);
        console.log("getFee getResult result", result);
        //let slow = TXSIZE*this.converter.toDecimals(result.low_fee_per_kb);
        let medium = TXSIZE * this.toDecimals(result.medium_fee_per_kb);
        console.log("getFee medium", medium);
        return resolve(medium);
      } catch (e) {
        return reject(e);
      }
    });
  }

  toDecimals(amount) {
    const amountFromWei = amount / 10 ** DECIMALS;
    this.validator.validateNumber(amountFromWei);
    // console.log("BTC toDecimals() - ,", amountFromWei);
    return amountFromWei;
  }

  addSignedUtxos(keyring, txBuilder, { from, to, amount, fee }) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(
          "addSignedUtxos",
          keyring,
          txBuilder,
          from,
          to,
          amount,
          fee
        );
        this.validator.validateObject(keyring, "keyring");
        this.validator.validateObject(txBuilder, "txBuilder");
        let utxoData = await this.getUtxos(from, amount, fee);
        console.log("addSignedUtxos after utxoData", utxoData);
        if (utxoData !== WRONG_FEE) {
          let utxos = utxoData.outputs;
          let change = utxoData.change;
          console.log("addSignedUtxos before loop");
          for (let key in utxos) {
            console.log(
              "addSignedUtxos adding input ",
              utxos[key].txid,
              utxos[key].vout
            );
            txBuilder.addInput(utxos[key].txid, utxos[key].vout);
          }
          console.log("addSignedUtxos after loop", txBuilder);
          console.log("addSignedUtxos before adding to", to, amount);
          txBuilder.addOutput(to, amount); // order for sending amount
          console.log("addSignedUtxos before adding from", from, change);
          txBuilder.addOutput(from, change); // order for sending change back to me
          let i = 0;
          console.log("addSignedUtxos before signing to");
          for (let key in utxos) {
            txBuilder.sign(i, keyring);
            i++;
          }
          console.log("addSignedUtxos end txBuilder", txBuilder);
          return resolve(txBuilder);
        }
      } catch (e) {
        return reject(e);
      }
    });
  }

  getUtxos(address, amount, fee) {
    return new Promise(async (resolve, reject) => {
      try {
        this.validator.validateAddress(address);
        this.validator.validateNumber(amount);
        this.validator.validateNumber(fee);

        let balance = await this.getBalance(address);
        if (balance >= amount + fee) {
          console.log("BCPHProvider before listUnspent", address);
          let allUtxo = await this.listUnspent(address);
          console.log("BCPHProvider after listUnspent", allUtxo);
          let tmpSum = 0;
          let requiredUtxo = [];
          for (let key in allUtxo) {
            if (tmpSum <= amount + fee) {
              tmpSum += allUtxo[key].value;
              requiredUtxo.push({
                txid: allUtxo[key].tx_hash,
                vout: allUtxo[key].tx_output_n,
              });
            } else {
              break;
            }
          }
          let change = tmpSum - amount - fee; // we need to return the change to our acc back
          this.validator.validateNumber(change);
          let utxos = {
            change: change,
            outputs: requiredUtxo,
          };
          console.log("getUtxo calculated", utxos);
          return resolve(utxos);
        } else {
          amount = this.toDecimals(amount);
          fee = this.toDecimals(fee);
          balance = this.toDecimals(balance);
          console.log(
            "Insufficient balance: trying to send " +
              amount +
              " BTC + " +
              fee +
              " BTC fee when having " +
              balance +
              " BTC"
          );
          return resolve(WRONG_FEE);
        }
      } catch (e) {
        return reject(e);
      }
    });
  }

  listUnspent(address) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("BlockcypherProvider listUnspent start", address);
        this.validator.validateAddress(address);
        console.log(
          "BlockcypherProvider listUnspent before urlCompose",
          address
        );
        let url = this.urlCompose(GET_UTXO, { address: address });
        console.log("BlockcypherProvider listUnspent url", url);
        let data = await this.getRequest(url);
        console.log("BlockcypherProvider listUnspent data", data);
        let unspents = data.txrefs;
        console.log("BlockcypherProvider listUnspent after", unspents);
        return resolve(unspents);
      } catch (e) {
        return reject(e);
      }
    });
  }

  sendTx(rawTx) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("sendTx", rawTx);
        this.validator.validateString(rawTx, "rawTx");
        let url = this.urlCompose(SEND);
        let body = JSON.stringify({ tx: rawTx });
        let result = await this.postRequest(url, body);
        console.log("sendTx result", result);
        return resolve(result.tx.hash);
      } catch (e) {
        return reject(e);
      }
    });
  }

  // getRequest(url, data, method, headers) {
  //   return new Promise(async (resolve, reject) => {
  //     try {
  //       if (!headers) {
  //         headers = { "content-type": "application/json" };
  //       }
  //       const options = {
  //         body: data,
  //         method,
  //         headers,
  //       };
  //       // fetch(url, options).then((res) => {
  //       //   res.json().then((res_json) => {
  //       //     return resolve(res_json); // check in case of bug, maybe need to move return
  //       //   });
  //       // });
  //       this.httpService.getRequest(url, method, headers).then((res) => {
  //         res.json().then((res_json) => {
  //           return resolve(res_json); // check in case of bug, maybe need to move return
  //         });
  //       });
  //     } catch (e) {
  //       return reject(e);
  //     }
  //   });
  // }
  getRequest(url) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("getRequest start");
        let response = null;
        try {
          response = await this.httpService.getRequest(url);
          console.log("getRequest after response", response);
        } catch (e) {
          console.log("getRequest after response", response);
          throw PROBLEM_WITH_NODE;
        }
        console.log("getRequest response", response);
        let result = await response.json();
        console.log("getRequest result", result);
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
  }

  postRequest(url, body) {
    return new Promise(async (resolve, reject) => {
      try {
        let response = null;
        try {
          response = await this.httpService.postRequest(url, body);
        } catch (e) {
          return resolve(PROBLEM_WITH_NODE);
        }

        let result = await response.json();
        return resolve(result);
      } catch (e) {
        return reject(e);
      }
    });
  }
}

module.exports = BlocksypherProvider;
