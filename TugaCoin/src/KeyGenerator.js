const EC = require('elliptic').ec;
const ec= new EC('secp256k1'); //  secp256k1 is the name of the elliptic curve used in Bitcoin.

const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');


console.log('\nYour private key is', privateKey);
console.log('\nYour public key is', publicKey);
