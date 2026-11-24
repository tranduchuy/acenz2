import type { LoginRequest } from "@acenz/shared";

/** `code: null` means no usable answer from the server (network failure, non-JSON or malformed body). */
export type LoginClientResult = { ok: true; token: string } | { ok: false; code: string | null };

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

/** Calls `POST /api/auth/login`. Never throws. */
export async function login(email: string, password: string, fetchImpl: typeof fetch = fetch): Promise<LoginClientResult> {
  const request: LoginRequest = { email, password };
  let body: unknown;
  try {
    const res = await fetchImpl("/api/auth/login", {
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
