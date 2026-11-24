import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * The legacy `users` table (created by the InitialSchema migration). Only the columns login and
 * register need are mapped; add more as features need them.
 */
@Entity("users")
export class User {
  /** bigint `GENERATED ALWAYS AS IDENTITY`; the pg driver returns it as a string. Never set on insert. */
  @PrimaryGeneratedColumn("identity", { type: "bigint", generatedIdentity: "ALWAYS" })
  id: string;

  @Column({ type: "text", nullable: true })
  email: string | null;

  /** bcrypt hash (`$2y$10$...`, 60 chars) or null/empty for accounts without a password. */
  @Column({ name: "password_hash", type: "text", nullable: true })
  passwordHash: string | null;

  /** `teacher` | `student` | `admin` | `moderator` (CHECK constraint in the database). */
  @Column({ type: "text" })
  role: string;

  /** Register stores the whole full name here; `middle_name`/`last_name` stay null (not mapped yet). */
  @Column({ name: "first_name", type: "text", nullable: true })
  firstName: string | null;

  @Column({ type: "text", nullable: true })
  phone: string | null;

  @Column({ name: "is_locked", type: "boolean", default: false })
  isLocked: boolean;

  @Column({ name: "deleted_at", type: "timestamptz", nullable: true })
  deletedAt: Date | null;
}
