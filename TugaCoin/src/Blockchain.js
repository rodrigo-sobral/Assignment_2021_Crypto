const Block = require('./Block.js');
const Transaction = require('./Transaction.js');

class Blockchain {

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.miningReward = 100;
        this.pendingTransactions = [];
    }

    //  Create the genesis block, which is the first block in the chain.
    createGenesisBlock() { return new Block("01/01/2017", [], "0"); }

    getLatestBlock() { return this.chain[this.chain.length - 1]; }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    //  The miner (miningRewardAddress) has to do a proof of work in all pending transactions.
    minePendingTransactions(miningRewardAddress) {
        if (this.pendingTransactions.length === 0) return;
        this.pendingTransactions.push(new Transaction(null, miningRewardAddress, this.miningReward));
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        this.chain.push(block);
        this.pendingTransactions = [];
    }

    //  Someone has to do a proof of work yet
    addTransaction(transaction) { 
        if (!transaction || !transaction.fromAddress || !transaction.toAddress)
            throw new Error('Transaction must include from and to address');
        if (!transaction.isValid())
            throw new Error('Cannot add invalid transaction to chain');
        this.pendingTransactions.push(transaction);
    }

    //  We have to run all the blocks and all the transactions in the blockchain to get the balance of each address.
    getBalanceOfAddress(address) {
        let balance = 0;
        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                if (transaction.fromAddress === address) balance -= transaction.amount;
                if (transaction.toAddress   === address) balance += transaction.amount;
            }
        }
        return balance;
    }

    
    //  Check if:
    //  1. The block only contains valid transactions.
    //  2. The currentBlock's hash is well generated, according to all its data.
    //  3. The previousHash is the same as the hash of the previous block.
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i], previousBlock = this.chain[i - 1];
            if (!currentBlock.hasValidTransactions()) return false;
            if (currentBlock.hash !== currentBlock.calculateHash() || currentBlock.previousHash !== previousBlock.hash) return false;
        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
