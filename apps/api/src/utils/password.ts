import bcrypt from "bcryptjs";
import { BCRYPT_COST, BCRYPT_HASH_LENGTH, DUMMY_HASH } from "../constants/auth.constants";

/** Hashes a plain password exactly as given (no trimming) with bcrypt cost `BCRYPT_COST`. */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

/**
 * Checks a plain password against a stored bcrypt hash (`$2y$`/`$2b$`/`$2a$`).
 * A stored value that is not a 60-char string (empty, null, corrupt) is a mismatch, never an error.
 * It still pays one bcrypt compare (against DUMMY_HASH), so response time doesn't reveal that the
 * account exists but has no usable hash.
 */
export async function verifyPassword(plain: string, stored: unknown): Promise<boolean> {
  if (typeof stored !== "string" || stored.length !== BCRYPT_HASH_LENGTH) {
    await bcrypt.compare(plain, DUMMY_HASH);
    return false;
  }
  return bcrypt.compare(plain, stored);
}
