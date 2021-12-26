const SHA256 = require('crypto-js/sha256');

class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;                 //  Nonce is a number that is used to make the hash more difficult to guess.
    }


    calculateHash() { return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString(); }

    //  Mine a block means to find a hash that satisfies the proof of work requirement.
    mineBlock(difficulty) {
        //  In Bitcoin, the difficulty is the number of leading zeros in the hash.
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
    }

    //  This method checks if the block contains only valid transactions.
    hasValidTransactions() {
        for (const tx of this.transactions) {
            if (!tx.isValid()) return false;
        } return true;
    }
}

module.exports = Block;