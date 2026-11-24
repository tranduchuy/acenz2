import type { LoginRequest, RegisterRequest } from "@acenz/shared";

/** `code: null` means no usable answer from the server (network failure, non-JSON or malformed body). */
export type LoginClientResult = { ok: true; token: string } | { ok: false; code: string | null };
export type RegisterClientResult = LoginClientResult;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

/** POSTs JSON to an auth endpoint and reads `{ token }` or `{ code }`. Never throws. */
async function postAuth(path: string, request: LoginRequest | RegisterRequest, fetchImpl: typeof fetch): Promise<LoginClientResult> {
  let body: unknown;
  try {
    const res = await fetchImpl(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    body = await res.json();
  } catch {
    return { ok: false, code: null };
  }

  if (isRecord(body) && typeof body.token === "string" && body.token !== "") return { ok: true, token: body.token };
  if (isRecord(body) && typeof body.code === "string") return { ok: false, code: body.code };
  return { ok: false, code: null };
}

/** Calls `POST /api/auth/login`. Never throws. */
export function login(email: string, password: string, fetchImpl: typeof fetch = fetch): Promise<LoginClientResult> {
  return postAuth("/api/auth/login", { email, password }, fetchImpl);
}

/** Calls `POST /api/auth/register`. Never throws. */
export function register(input: RegisterRequest, fetchImpl: typeof fetch = fetch): Promise<RegisterClientResult> {
  return postAuth("/api/auth/register", input, fetchImpl);
}
