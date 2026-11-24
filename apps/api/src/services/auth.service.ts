import { AUTH_ERROR, type AuthErrorCode } from "@acenz/shared";
import { DUMMY_HASH } from "../constants/auth.constants";
import { verifyPassword } from "../utils/password";
import type { IssueToken } from "./token.service";
import type { FindUserByEmail } from "../repositories/user.repository";

export type LoginResult = { ok: true; token: string } | { ok: false; code: AuthErrorCode };
export type LoginFn = (email: string, password: string) => Promise<LoginResult>;

export interface AuthServiceDeps {
  findUserByEmail: FindUserByEmail;
  verifyPassword: typeof verifyPassword;
  issueToken: IssueToken;
}

const INVALID: LoginResult = { ok: false, code: AUTH_ERROR.INVALID_CREDENTIALS };

export interface AuthService {
  login: LoginFn;
}

export function createAuthService(deps: AuthServiceDeps): AuthService {
  const login: LoginFn = async (email, password) => {
    const user = await deps.findUserByEmail(email.trim());
    if (!user) {
      // Same bcrypt cost as a real check, so response time doesn't reveal which emails exist.
      await deps.verifyPassword(password, DUMMY_HASH);
      return INVALID;
    }
    if (!(await deps.verifyPassword(password, user.passwordHash))) return INVALID;
    // Checked after the password so the lock is only revealed to someone who knows it.
    if (user.isLocked) return { ok: false, code: AUTH_ERROR.ACCOUNT_LOCKED };
    return { ok: true, token: deps.issueToken(user) };
  };
  return { login };
}
