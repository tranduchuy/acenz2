import { useEffect, useState } from "react";
import type { HealthResponse } from "@acenz/shared";
import { fetchHealth } from "./api/health";

type State =
  | { kind: "loading" }
  | { kind: "success"; data: HealthResponse }
  | { kind: "error"; message: string };

export default function App() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    fetchHealth()
      .then((data) => setState({ kind: "success", data }))
      .catch((err: unknown) =>
        setState({ kind: "error", message: err instanceof Error ? err.message : String(err) }),
      );
  }, []);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>Acenz2</h1>
      {state.kind === "loading" && <p>Checking API…</p>}
      {state.kind === "success" && (
        <dl>
          <dt>status</dt>
          <dd>{state.data.status}</dd>
          <dt>db</dt>
          <dd>{state.data.db}</dd>
          <dt>timestamp</dt>
          <dd>{state.data.timestamp}</dd>
        </dl>
      )}
      {state.kind === "error" && <p role="alert">API error: {state.message}</p>}
    </main>
  );
}
