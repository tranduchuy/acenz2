import jwt from "jsonwebtoken";
import { describe, expect, it } from "vitest";
import { createTokenIssuer, createTokenVerifier } from "./token";

const SECRET = "a-test-secret-that-is-at-least-32-chars";
const user = { id: "42", email: "a@x.com", passwordHash: "h", isLocked: false };

describe("token", () => {
  it("issues a signed HS256 JWT with sub, email and exp", () => {
    const token = createTokenIssuer({ secret: SECRET, expiresInSeconds: 3600 })(user);
    expect(token).not.toBe("placeholder-token");
    expect(token.split(".")).toHaveLength(3);
    const payload = jwt.verify(token, SECRET, { algorithms: ["HS256"] }) as jwt.JwtPayload;
    expect(payload.sub).toBe("42");
    expect(payload.email).toBe("a@x.com");
    expect(payload.exp! - payload.iat!).toBe(3600);
  });

  it("never puts the password hash in the token", () => {
    const token = createTokenIssuer({ secret: SECRET, expiresInSeconds: 60 })(user);
    expect(Buffer.from(token.split(".")[1]!, "base64url").toString()).not.toContain("passwordHash");
  });

  it("verifier accepts its own tokens", () => {
    const token = createTokenIssuer({ secret: SECRET, expiresInSeconds: 60 })(user);
    expect(createTokenVerifier(SECRET)(token)).toEqual({ sub: "42", email: "a@x.com" });
  });

  it("verifier rejects a wrong secret, an expired token, alg none and garbage", () => {
    const issue = createTokenIssuer({ secret: SECRET, expiresInSeconds: 60 });
    const verify = createTokenVerifier(SECRET);
    expect(verify(issue(user).replace(/.$/, (c) => (c === "A" ? "B" : "A")))).toBeNull();
    expect(createTokenVerifier("another-secret-another-secret-12345")(issue(user))).toBeNull();
    expect(verify(jwt.sign({}, SECRET, { subject: "1", expiresIn: -10 }))).toBeNull();
    const none = `${Buffer.from('{"alg":"none"}').toString("base64url")}.${Buffer.from('{"sub":"1"}').toString("base64url")}.`;
    expect(verify(none)).toBeNull();
    expect(verify("placeholder-token")).toBeNull();
  });
});
