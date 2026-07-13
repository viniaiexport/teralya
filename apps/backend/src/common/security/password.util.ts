import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync: (password: string, salt: Buffer, keylen: number, options: ScryptOptions) => Promise<Buffer> =
  promisify(scrypt);

const SALT_BYTES = 16;
const KEY_LENGTH = 64;
const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

/**
 * Hash de contraseña con scrypt (Node.js `crypto` nativo, sin dependencias externas).
 * Formato almacenado: scrypt$N$r$p$saltHex$hashHex
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });

  return `scrypt$${SCRYPT_N.toString()}$${SCRYPT_R.toString()}$${SCRYPT_P.toString()}$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') {
    return false;
  }

  const [, nRaw, rRaw, pRaw, saltHex, hashHex] = parts;
  const n = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  const salt = Buffer.from(saltHex as string, 'hex');
  const expected = Buffer.from(hashHex as string, 'hex');

  const derivedKey = await scryptAsync(password, salt, expected.length, { N: n, r, p });

  return derivedKey.length === expected.length && timingSafeEqual(derivedKey, expected);
}
