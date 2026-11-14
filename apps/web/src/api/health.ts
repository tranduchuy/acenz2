import { HealthResponseSchema, parseOrThrow, type HealthResponse } from "@acenz/shared";

// 200 (ok) and 503 (degraded) both carry a valid HealthResponse body, so status is not checked.
export async function fetchHealth(fetchImpl: typeof fetch = fetch): Promise<HealthResponse> {
  const res = await fetchImpl("/api/health");
  const body: unknown = await res.json();
  return parseOrThrow(HealthResponseSchema, body);
}
