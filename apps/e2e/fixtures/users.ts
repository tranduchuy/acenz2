/** All fixture users share this password. */
export const FIXTURE_PASSWORD = "Passw0rd!";
/** `$2y$10$` bcrypt hash of FIXTURE_PASSWORD (same literal as apps/api/src/auth/test-fixtures.ts). */
export const FIXTURE_HASH_2Y = "$2y$10$AEJx23ZjEJDfbRzko1QDg.som1R9Eof71xSysj52fRDXvPMzV1cpu";
export const FIXTURE_DOMAIN = "e2e.acenz.test";

export type FixtureUser = { email: string; passwordHash: string | null; isLocked: boolean; deleted: boolean };

const at = (local: string) => `${local}@${FIXTURE_DOMAIN}`;

export const USERS = {
  ok: { email: at("ok"), passwordHash: FIXTURE_HASH_2Y, isLocked: false, deleted: false },
  locked: { email: at("locked"), passwordHash: FIXTURE_HASH_2Y, isLocked: true, deleted: false },
  nohash: { email: at("nohash"), passwordHash: null, isLocked: false, deleted: false },
  emptyhash: { email: at("emptyhash"), passwordHash: "", isLocked: false, deleted: false },
  deleted: { email: at("deleted"), passwordHash: FIXTURE_HASH_2Y, isLocked: false, deleted: true },
} satisfies Record<string, FixtureUser>;
