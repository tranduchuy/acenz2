import type { ReactNode } from "react";
import { Icon } from "../Icon";

export interface FieldFootProps { error?: string; hint?: string; extra?: ReactNode }

/** Hint or error line under a field; `extra` sits on the right (e.g. word count). */
export function FieldFoot({ error, hint, extra }: FieldFootProps) {
  if (!error && !hint && !extra) return null;
  return (
    <div className="flex min-h-5 justify-between gap-3 text-body-sm font-light">
      {error ? (
        <span className="inline-flex items-center gap-1 text-danger"><Icon name="alert" size={14} />{error}</span>
      ) : (
        <span className="text-ink-muted">{hint ?? ""}</span>
      )}
      {extra}
    </div>
  );
}
