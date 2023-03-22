const nacl = require("tweetnacl");

// Generate an Ed25519 key pair
const keyPair = nacl.sign.keyPair();

console.log("Ed25519 key pair generated:");
console.log(`Public key: ${Buffer.from(keyPair.publicKey).toString("hex")}`);
console.log(`Private key: ${Buffer.from(keyPair.secretKey).toString("hex")}`);
