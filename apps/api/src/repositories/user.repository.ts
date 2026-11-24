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
