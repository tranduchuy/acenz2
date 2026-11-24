import bcrypt from "bcryptjs";

const BCRYPT_HASH_LENGTH = 60;

/**
 * A valid bcrypt hash of a random value nobody knows. Compared against when the email is unknown,
 * so that path costs the same time as a wrong password.
 */
export const DUMMY_HASH = "$2b$10$JodWC0RCUDvpfcQfC9ASQ.m5AEhjJBJQuBs9YEVnb49cEDQ9qRCO6";

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
