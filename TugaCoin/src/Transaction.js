const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash() { return SHA256(this.fromAddress + this.toAddress + this.amount).toString(); }

    //  This method makes the transaction be done only by the address owner.
    signTransaction(signingKey) {
        if (signingKey.getPublic('hex') !== this.fromAddress) throw new Error('You cannot sign transactions for other wallets!');

        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx, 'base64');
        this.signature = sig.toDER('hex');
    }

    //  This method checks if the transaction is valid, comparing the signature with the hash of the transaction.
    isValid() {
        if (this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0) throw new Error('No signature in this transaction');

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);
    }
}

module.exports = Transaction;