import { z } from "zod";
import { AUTH_ERROR } from "./login";

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Trimmed, non-empty string; anything else (missing, number, null, array) is `code`. */
const requiredTrimmed = (code: string) => z.string({ error: code }).trim().min(1, { error: code });

/**
 * `POST /api/auth/register` request body. Every issue message is an `AuthErrorCode`, so a failed parse
 * maps straight to the error response. Issues come out in the order of the error table (name, email,
 * phone, password, confirmation, then mismatch), so the first issue is the one the server returns and
 * the web form can show all of them at once. A missing or non-object body counts as a missing name.
 * Name, email and phone are trimmed; both passwords are left exactly as typed.
 */
export const RegisterRequestSchema = z
  .object(
    {
      name: requiredTrimmed(AUTH_ERROR.NAME_REQUIRED),
      email: requiredTrimmed(AUTH_ERROR.EMAIL_REQUIRED).pipe(z.email({ error: AUTH_ERROR.EMAIL_INVALID })),
      phone: requiredTrimmed(AUTH_ERROR.PHONE_REQUIRED).pipe(
        z.string().regex(/^\d{10,11}$/, { error: AUTH_ERROR.PHONE_INVALID }),
      ),
      password: z.string({ error: AUTH_ERROR.PASSWORD_REQUIRED }).min(1, { error: AUTH_ERROR.PASSWORD_REQUIRED }),
      confirmPassword: z
        .string({ error: AUTH_ERROR.CONFIRM_PASSWORD_REQUIRED })
        .min(1, { error: AUTH_ERROR.CONFIRM_PASSWORD_REQUIRED }),
    },
    { error: AUTH_ERROR.NAME_REQUIRED },
  )
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    error: AUTH_ERROR.PASSWORD_MISMATCH,
    // Object-level checks are skipped once a field has failed; this one must still run so the form
    // can report a mismatch next to other errors. Only when both passwords are present strings.
    when: ({ value }) =>
      isRecord(value) &&
      typeof value.password === "string" &&
      typeof value.confirmPassword === "string" &&
      value.confirmPassword !== "",
  });

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
/** 201 response body. */
export type RegisterSuccess = { token: string };
