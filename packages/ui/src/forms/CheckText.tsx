export interface CheckTextProps { label: string; description?: string }

/** Label + optional description next to a checkbox, switch or radio. */
export function CheckText({ label, description }: CheckTextProps) {
  return (
    <span>
      <span className="block text-ink">{label}</span>
      {description && <span className="block text-body-sm font-light text-ink-muted">{description}</span>}
    </span>
  );
}
