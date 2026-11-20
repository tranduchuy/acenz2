import type { LoginUser } from "./user-repository";

/**
 * STUB. Token design (format, lifetime, storage, refresh) is decided in a separate ticket.
 * Until then login returns this fixed placeholder so the contract `{ token: string }` holds.
 */
export function issueToken(_user: LoginUser): string {
  return "placeholder-token";
}
