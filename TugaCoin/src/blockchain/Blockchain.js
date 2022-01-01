const Block = require('./Block.js');
const Transaction = require('./Transaction.js');

class Blockchain {

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 5;
    }

    //  Create the genesis block, which is the first block in the chain.
    createGenesisBlock() { return new Block(Date.parse("01/01/2017"), [], "0"); }

    getLatestBlock() { return this.chain[this.chain.length - 1]; }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    //  The miner (miner_address) has to do a proof of work in all pending transactions.
    minePendingTransactions(miner_address, availableWallets) {
        if (this.pendingTransactions.length === 0) return;
        const finalminingReward = this.pendingTransactions.length*this.difficulty*this.miningReward;

        this.pendingTransactions.unshift(new Transaction(null, miner_address, finalminingReward))
        let newblock = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        availableWallets= this.resetWalletsBalance(availableWallets, newblock);

        newblock.mineBlock(this.difficulty);
        
        this.chain.push(newblock);
        this.pendingTransactions = [];
        return availableWallets;
    }

    //  Someone has to do a proof of work yet
    addTransaction(transaction) { 
        if (!transaction || !transaction.fromAddress || !transaction.toAddress)
            throw new Error('Transaction must include from and to address');
        if (!transaction.isValid())
            throw new Error('Cannot add invalid transaction to chain');
        this.pendingTransactions.push(transaction);
    }

    //  This method is used to reset the balance of all wallets.
    resetWalletsBalance(availableWallets, newblock) {
        for (const transaction of newblock.transactions) {
            const fromWallet = this.getWalletByAddress(availableWallets, transaction.fromAddress);
            const toWallet = this.getWalletByAddress(availableWallets, transaction.toAddress);
            if (fromWallet && transaction.amount > fromWallet.balance) transaction.amountValidated= false;
            else {    
                if (fromWallet) fromWallet.balance -= transaction.amount;
                toWallet.balance += transaction.amount;
                transaction.amountValidated= true;
            }
        } return availableWallets;
    }

    getWalletByAddress(availableWallets, address) {
        for (const wallet of availableWallets) {
            if (wallet.myaddress === address) return wallet;
        } return undefined;
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
