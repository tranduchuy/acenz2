import jwt from "jsonwebtoken";
import type { LoginUser } from "../repositories/user.repository";

export interface TokenConfig {
  /** HS256 signing secret. */
  secret: string;
  /** Token lifetime in seconds. */
  expiresInSeconds: number;
}

export type IssueToken = (user: LoginUser) => string;
export type VerifyToken = (token: string) => { sub: string; email: string | null } | null;

/** Signs an HS256 JWT: `sub` is the user id, `email` is informational, `exp` comes from the config. */
export function createTokenIssuer(config: TokenConfig): IssueToken {
  return (user) =>
    jwt.sign({ email: user.email }, config.secret, {
      algorithm: "HS256",
      subject: user.id,
      expiresIn: config.expiresInSeconds,
    });
}

/** Returns the claims of a valid, unexpired token signed with `secret`, otherwise null. */
export function createTokenVerifier(secret: string): VerifyToken {
  return (token) => {
    try {
      const payload = jwt.verify(token, secret, { algorithms: ["HS256"] });
      if (typeof payload === "string" || typeof payload.sub !== "string") return null;
      return { sub: payload.sub, email: typeof payload.email === "string" ? payload.email : null };
    } catch {
      return null;
    }
  };
}
