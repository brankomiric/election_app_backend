const { Wallet } = require("ethers");
const { isValidMnemonic } = require("@ethersproject/hdnode");

class HDWallet {
  pathBIP = "m/44'/60'/0'/0/";

  restoreAddressFromPrivateKey(pk) {
    const wallet = new Wallet(pk);
    const keys = {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
    return { seedPhrase: undefined, keys: [keys] };
  }

  restoreAddressesFromMnemonic(mnemonic, limit) {
    if (!isValidMnemonic(mnemonic)) throw new Error("Invalid seed phrase");

    const keys = [...Array(limit).keys()].map((i) => {
      const wallet = Wallet.fromMnemonic(mnemonic, this.pathBIP + i);
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
      };
    });

    return { seedPhrase: mnemonic, keys };
  }

  generateAddress() {
    const {
      mnemonic: { phrase },
      address,
      privateKey,
    } = Wallet.createRandom();
    return {
      seedPhrase: phrase,
      keys: [{ address, privateKey }],
    };
  }

  
}

module.exports = {
  HDWallet,
};
