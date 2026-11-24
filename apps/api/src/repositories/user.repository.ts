import { IsNull, type DataSource } from "typeorm";
import { User } from "../db/entities/User";

export type LoginUser = Pick<User, "id" | "email" | "passwordHash" | "isLocked">;
export type FindUserByEmail = (email: string) => Promise<LoginUser | null>;

/** Exact-match lookup of a non-deleted user. Initialises the DataSource first if needed. */
export function createFindUserByEmail(
  dataSource: Pick<DataSource, "getRepository">,
  ensureInitialized: () => Promise<void>,
): FindUserByEmail {
  return async (email) => {
    await ensureInitialized();
    return dataSource.getRepository(User).findOne({
      where: { email, deletedAt: IsNull() },
      select: { id: true, email: true, passwordHash: true, isLocked: true },
    });
  };
}

export type NewUser = { email: string; passwordHash: string; firstName: string; phone: string };
export type CreateUserResult = { ok: true; user: LoginUser } | { ok: false; reason: "email-exists" };
export type CreateUser = (input: NewUser) => Promise<CreateUserResult>;

/** The unique index on `lower(email)`; it also counts soft-deleted users. */
const EMAIL_UNIQUE_INDEX = "users_email_lower_key";

const isEmailTaken = (err: unknown): boolean => {
  const driverError = (err as { driverError?: { code?: string; constraint?: string } } | null)?.driverError;
  return driverError?.code === "23505" && driverError.constraint === EMAIL_UNIQUE_INDEX;
};

/**
 * Inserts a student account (`role = 'student'`, not locked). The database generates the id.
 * A violation of the email unique index becomes `{ ok: false, reason: "email-exists" }`, which is
 * what makes two simultaneous registrations with one email safe; any other failure is rethrown.
 */
export function createCreateUser(
  dataSource: Pick<DataSource, "getRepository">,
  ensureInitialized: () => Promise<void>,
): CreateUser {
  return async ({ email, passwordHash, firstName, phone }) => {
    await ensureInitialized();
    try {
      const result = await dataSource
        .getRepository(User)
        .insert({ email, passwordHash, firstName, phone, role: "student", isLocked: false });
      const id = String((result.identifiers[0] as { id: string | number }).id);
      return { ok: true, user: { id, email, passwordHash, isLocked: false } };
    } catch (err) {
      if (isEmailTaken(err)) return { ok: false, reason: "email-exists" };
      throw err;
    }
  };
}
