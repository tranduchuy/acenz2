/** bcrypt hashes are always 60 characters; anything else stored in `password_hash` is unusable. */
export const BCRYPT_HASH_LENGTH = 60;

/**
 * A valid bcrypt hash of a random value nobody knows. Compared against when the email is unknown,
 * so that path costs the same time as a wrong password.
 */
export const DUMMY_HASH = "$2b$10$JodWC0RCUDvpfcQfC9ASQ.m5AEhjJBJQuBs9YEVnb49cEDQ9qRCO6";

/** bcrypt cost for new password hashes; `DUMMY_HASH` uses the same cost. */
export const BCRYPT_COST = 10;
