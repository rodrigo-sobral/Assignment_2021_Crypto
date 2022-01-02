const { Blockchain, Transaction } = require('./Blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey= ec.keyFromPrivate('a4750a7f5c42b192a954aa6ed8ea5fb857b9032ae4a10d367faafd255047cf38');
const myWalletAddress = myKey.getPublic('hex');

let tugaCoin = new Blockchain();

const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
tugaCoin.addTransaction(tx1);
tugaCoin.minePendingTransactions(myWalletAddress);
console.log('\nBalance of tuga-address is', tugaCoin.getBalanceOfAddress(myWalletAddress));
console.log('\nIs chain valid?', tugaCoin.isChainValid());

console.log('Here is your wallet address:\t', myWalletAddress);
console.log('Here is your private key:\t', myKey.getPrivate('hex'));