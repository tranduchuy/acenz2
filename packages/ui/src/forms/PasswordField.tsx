import { useId, useState, type ChangeEvent } from "react";
import { cx, focusRing } from "../cx";
import { Icon } from "../Icon";
import { FieldFoot } from "./FieldFoot";
import { field, fieldControl, fieldLabel } from "./styles";

export interface PasswordFieldProps {
  label?: string; value?: string; defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; hint?: string; error?: string; disabled?: boolean;
  /** `current-password` on login, `new-password` on register / change password. */
  autoComplete?: string;
  id?: string; name?: string; className?: string;
}

/** Password input with a show/hide toggle. */
export function PasswordField({ label, value, defaultValue = "", onChange, placeholder, hint, error, disabled, autoComplete, id, name, className }: PasswordFieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  const [inner, setInner] = useState(defaultValue);
  const [visible, setVisible] = useState(false);
  const val = value ?? inner;
  const handle = (e: ChangeEvent<HTMLInputElement>) => { setInner(e.target.value); onChange?.(e); };
  return (
    <div className={cx(field, className)}>
      {label && <label className={fieldLabel} htmlFor={fid}>{label}</label>}
      <div className="relative">
        <input
          id={fid} name={name} type={visible ? "text" : "password"} value={val} onChange={handle}
          placeholder={placeholder} disabled={disabled} autoComplete={autoComplete} aria-invalid={!!error || undefined}
          className={cx(fieldControl, "pr-11", error && "border-danger")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          aria-pressed={visible}
          aria-controls={fid}
          className={cx(
            "absolute top-1/2 right-0.5 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-sm text-ink-muted hover:bg-surface-sunken hover:text-ink disabled:cursor-not-allowed disabled:opacity-45 pointer-coarse:size-11",
            focusRing,
          )}
        >
          <Icon name={visible ? "eye-off" : "eye"} />
        </button>
      </div>
      <FieldFoot error={error} hint={hint} />
    </div>
  );
}
