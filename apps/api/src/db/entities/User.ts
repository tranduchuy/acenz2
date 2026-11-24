import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * The legacy `users` table (created by the InitialSchema migration). Only the columns login
 * needs are mapped; add more as features need them. Read-only for now.
 */
@Entity("users")
export class User {
  /** bigint identity; the pg driver returns it as a string. */
  @PrimaryColumn({ type: "bigint" })
  id: string;

  @Column({ type: "text", nullable: true })
  email: string | null;

  /** bcrypt hash (`$2y$10$...`, 60 chars) or null/empty for accounts without a password. */
  @Column({ name: "password_hash", type: "text", nullable: true })
  passwordHash: string | null;

  @Column({ name: "is_locked", type: "boolean", default: false })
  isLocked: boolean;

  @Column({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt: Date | null;
}
