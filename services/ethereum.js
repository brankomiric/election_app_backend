const { Contract, providers, Wallet } = require("ethers");

class Ethereum {
  async connect(pk) {
    this._provider = new providers.JsonRpcProvider(process.env.PROVIDER);
    this._wallet = new Wallet(pk, this._provider);
  }

  getContractInstance(address, abi) {
    return new Contract(address, abi, this._wallet);
  }
}

module.exports = {
  Ethereum,
};
