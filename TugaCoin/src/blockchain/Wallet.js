const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Wallet {
    INITIAL_BALANCE = 5;
    constructor() {
        this.balance = this.INITIAL_BALANCE;
        const keyPair = ec.genKeyPair();
        this.mysignature = ec.keyFromPrivate(keyPair.getPrivate('hex'));
        this.myaddress = this.mysignature.getPublic('hex');
    }

    getBalance() { return this.balance; }
}

module.exports = Wallet;