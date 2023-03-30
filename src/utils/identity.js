import { Ed25519KeyIdentity } from "@dfinity/identity";
import fs from "fs";
import Path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);

const parseIdentity = (keyPath) => {
  const identityPath = Path.join(__dirname, "../..", "identity", keyPath);
  const privateKeyHex = fs.readFileSync(identityPath).toString().trim();
  const privateKey = Uint8Array.from(Buffer.from(privateKeyHex, "hex"));

  // Initialize an identity from the secret key
  return Ed25519KeyIdentity.fromSecretKey(privateKey);
};

export const parseIdentityProd = (privateKeyHex) => {
  const privateKey = Uint8Array.from(Buffer.from(privateKeyHex, "hex"));

  // Initialize an identity from the secret key
  return Ed25519KeyIdentity.fromSecretKey(privateKey);
};

export const default_identity = parseIdentity("private_key.txt");
