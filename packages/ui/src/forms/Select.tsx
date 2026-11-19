import { useId, type ChangeEvent } from "react";
import { cx } from "../cx";
import { Icon } from "../Icon";
import { FieldFoot } from "./FieldFoot";
import { field, fieldControl, fieldLabel } from "./styles";

export type SelectOption = string | { value: string; label: string };

export interface SelectProps {
  label?: string; options: SelectOption[]; value?: string; defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void; placeholder?: string; hint?: string; error?: string; disabled?: boolean; id?: string; name?: string; className?: string;
}

export function Select({ label, options, value, defaultValue, onChange, placeholder, hint, error, disabled, id, name, className }: SelectProps) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={cx(field, className)}>
      {label && <label className={fieldLabel} htmlFor={fid}>{label}</label>}
      <div className="relative">
        <select
          id={fid}
          name={name}
          className={cx(fieldControl, "cursor-pointer appearance-none pr-9", error && "border-danger")}
          value={value}
          defaultValue={value === undefined ? (defaultValue ?? (placeholder ? "" : undefined)) : undefined}
          onChange={onChange}
          disabled={disabled}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => {
            const opt = typeof o === "string" ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
        <Icon name="down" size={18} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
      </div>
      <FieldFoot error={error} hint={hint} />
    </div>
  );
}
