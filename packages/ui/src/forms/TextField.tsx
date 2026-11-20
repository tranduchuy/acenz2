import { useId, useState, type ChangeEvent, type HTMLAttributes } from "react";
import { countWords } from "@acenz/core";
import { cx } from "../cx";
import { FieldFoot } from "./FieldFoot";
import { field, fieldControl, fieldLabel } from "./styles";

export interface TextFieldProps {
  label?: string; value?: string; defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string; hint?: string; error?: string;
  multiline?: boolean; rows?: number; minWords?: number; disabled?: boolean; id?: string; name?: string; className?: string;
  /** Input type for single-line fields (ignored when `multiline`). */
  type?: "text" | "email";
  autoComplete?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
}

/** With `minWords` shows a live word count (Writing Task 1: 150, Task 2: 250). */
export function TextField({ label, value, defaultValue = "", onChange, placeholder, hint, error, multiline, rows = 6, minWords, disabled, id, name, className, type = "text", autoComplete, inputMode }: TextFieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  const [inner, setInner] = useState(defaultValue);
  const val = value ?? inner;
  const words = countWords(val);
  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setInner(e.target.value); onChange?.(e); };
  const common = {
    id: fid, name, value: val, onChange: handle, placeholder, disabled, autoComplete, "aria-invalid": !!error || undefined,
    className: cx(fieldControl, multiline && "h-auto resize-y p-3 text-body-lg", error && "border-danger"),
  };
  return (
    <div className={cx(field, className)}>
      {label && <label className={fieldLabel} htmlFor={fid}>{label}</label>}
      {multiline ? <textarea rows={rows} {...common} /> : <input type={type} inputMode={inputMode} {...common} />}
      <FieldFoot
        error={error}
        hint={hint}
        extra={minWords ? <span className={cx("tabular-nums text-ink-muted", words < minWords && "font-medium text-warning")}>{words} / {minWords} từ</span> : undefined}
      />
    </div>
  );
}
