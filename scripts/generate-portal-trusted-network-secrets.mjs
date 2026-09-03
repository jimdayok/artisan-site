import { randomBytes, scryptSync } from "node:crypto";

const masterPassword = randomBytes(24).toString("base64url");
const salt = randomBytes(16);
const derivedKey = scryptSync(masterPassword, salt, 32);
const passwordHash = [
  "scrypt-v1",
  salt.toString("base64url"),
  derivedKey.toString("base64url"),
].join("$");
const sessionSecret = randomBytes(48).toString("base64url");

console.log(
  "Generated Artisan trusted-network admin credentials. Store the master password in the approved password manager; it cannot be recovered from the hash.\n"
);
console.log(`Master password: ${masterPassword}`);
console.log(`PORTAL_TRUSTED_NETWORK_PASSWORD_HASH=${passwordHash}`);
console.log(`PORTAL_TRUSTED_NETWORK_SESSION_SECRET=${sessionSecret}`);
