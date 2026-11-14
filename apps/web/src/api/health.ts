import { HealthResponseSchema, parseOrThrow, type HealthResponse } from "@acenz/shared";

// 200 (ok) and 503 (degraded) both carry a valid HealthResponse body, so status is not checked.
export async function fetchHealth(fetchImpl: typeof fetch = fetch): Promise<HealthResponse> {
  const res = await fetchImpl("/api/health");
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new Error(`API unreachable or returned non-JSON (HTTP ${res.status})`);
  }
  return parseOrThrow(HealthResponseSchema, body);
}
