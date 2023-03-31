import { Ed25519KeyIdentity } from "@dfinity/identity";

export const parseIdentity = (privateKeyHex) => {
  const privateKey = Uint8Array.from(Buffer.from(privateKeyHex, "hex"));

  // Initialize an identity from the secret key
  return Ed25519KeyIdentity.fromSecretKey(privateKey);
};
