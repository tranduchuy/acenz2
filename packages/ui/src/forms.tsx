import { useId, useState, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { countWords } from "@acenz/core";
import { cx } from "./cx";
import { Icon } from "./Icon";
import { ProgressBar } from "./primitives";

function FieldFoot({ error, hint, extra }: { error?: string; hint?: string; extra?: ReactNode }) {
  if (!error && !hint && !extra) return null;
  return (
    <div className="ic-field-foot">
      {error ? <span className="ic-field-error"><Icon name="alert" size={14} />{error}</span> : <span className="ic-hint">{hint ?? ""}</span>}
      {extra}
    </div>
  );
}

export interface TextFieldProps {
  label?: string; value?: string; defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string; hint?: string; error?: string;
  multiline?: boolean; rows?: number; minWords?: number; disabled?: boolean; id?: string; name?: string; className?: string;
}
/** With `minWords` shows a live word count (Writing Task 1: 150, Task 2: 250). */
export function TextField({ label, value, defaultValue = "", onChange, placeholder, hint, error, multiline, rows = 6, minWords, disabled, id, name, className }: TextFieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  const [inner, setInner] = useState(defaultValue);
  const val = value ?? inner;
  const words = countWords(val);
  const handle = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setInner(e.target.value); onChange?.(e); };
  const common = { id: fid, name, value: val, onChange: handle, placeholder, disabled, "aria-invalid": !!error || undefined, className: cx("ic-input", multiline && "ic-textarea", error && "ic-input-error") };
  return (
    <div className={cx("ic-field", className)}>
      {label && <label className="ic-label" htmlFor={fid}>{label}</label>}
      {multiline ? <textarea rows={rows} {...common} /> : <input {...common} />}
      <FieldFoot error={error} hint={hint} extra={minWords ? <span className={cx("ic-wordcount", words < minWords && "ic-wordcount-under")}>{words} / {minWords} từ</span> : undefined} />
    </div>
  );
}

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> { shortcut?: string }
export function SearchInput({ placeholder = "Tìm kiếm…", shortcut, className, ...rest }: SearchInputProps) {
  return (
    <label className={cx("ic-search", className)}>
      <Icon name="search" size={18} />
      <input type="search" placeholder={placeholder} aria-label={placeholder} {...rest} />
      {shortcut && <kbd>{shortcut}</kbd>}
    </label>
  );
}

export type SelectOption = string | { value: string; label: string };
export interface SelectProps {
  label?: string; options: SelectOption[]; value?: string; defaultValue?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void; placeholder?: string; hint?: string; error?: string; disabled?: boolean; id?: string; name?: string; className?: string;
}
export function Select({ label, options, value, defaultValue, onChange, placeholder, hint, error, disabled, id, name, className }: SelectProps) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className={cx("ic-field", className)}>
      {label && <label className="ic-label" htmlFor={fid}>{label}</label>}
      <div className="ic-select">
        <select id={fid} name={name} className={cx("ic-input", error && "ic-input-error")} value={value} defaultValue={value === undefined ? (defaultValue ?? (placeholder ? "" : undefined)) : undefined} onChange={onChange} disabled={disabled}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => {
            const opt = typeof o === "string" ? { value: o, label: o } : o;
            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
          })}
        </select>
        <Icon name="down" size={18} className="ic-select-caret" />
      </div>
      <FieldFoot error={error} hint={hint} />
    </div>
  );
}

interface CheckLikeProps { label: string; description?: string; checked?: boolean; defaultChecked?: boolean; onChange?: (e: ChangeEvent<HTMLInputElement>) => void; disabled?: boolean; name?: string; className?: string }

export function Checkbox({ label, description, className, disabled, ...input }: CheckLikeProps) {
  return (
    <label className={cx("ic-check", disabled && "ic-disabled", className)}>
      <input type="checkbox" className="ic-check-input" disabled={disabled} {...input} />
      <span className="ic-check-box" aria-hidden><Icon name="check" size={14} /></span>
      <span><span className="ic-check-label">{label}</span>{description && <span className="ic-check-desc">{description}</span>}</span>
    </label>
  );
}

export function Switch({ label, description, className, ...input }: CheckLikeProps) {
  return (
    <label className={cx("ic-switch", className)}>
      <input type="checkbox" role="switch" className="ic-check-input" {...input} />
      <span className="ic-switch-track" aria-hidden><span className="ic-switch-thumb" /></span>
      <span><span className="ic-check-label">{label}</span>{description && <span className="ic-check-desc">{description}</span>}</span>
    </label>
  );
}

export interface RadioProps {
  name: string; options: { value: string; label: string; description?: string }[];
  value?: string; defaultValue?: string; onChange?: (e: ChangeEvent<HTMLInputElement>) => void; legend?: string; className?: string;
}
export function Radio({ name, options, value, defaultValue, onChange, legend, className }: RadioProps) {
  return (
    <fieldset className={cx("ic-radios", className)}>
      {legend && <legend className="ic-label">{legend}</legend>}
      {options.map((o) => (
        <label key={o.value} className="ic-check">
          <input type="radio" name={name} value={o.value} className="ic-check-input" onChange={onChange}
            {...(value !== undefined ? { checked: value === o.value } : { defaultChecked: defaultValue === o.value })} />
          <span className="ic-radio-dot" aria-hidden />
          <span><span className="ic-check-label">{o.label}</span>{o.description && <span className="ic-check-desc">{o.description}</span>}</span>
        </label>
      ))}
    </fieldset>
  );
}

const WD = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const WEEKDAY_LONG = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const pad = (n: number) => String(n).padStart(2, "0");

export interface DatePickerProps {
  label?: string; value?: Date; defaultValue?: Date; onChange?: (d: Date) => void;
  time?: string; onTimeChange?: (t: string) => void; open?: boolean; defaultOpen?: boolean; hint?: string; className?: string;
}
/** Deadline picker: date + time. Weeks start on Monday (T2). */
export function DatePicker({ label, value, defaultValue, onChange, time = "23:59", onTimeChange, open, defaultOpen = false, hint, className }: DatePickerProps) {
  const [inner, setInner] = useState<Date>(defaultValue ?? new Date());
  const sel = value ?? inner;
  const [view, setView] = useState(new Date(sel.getFullYear(), sel.getMonth(), 1));
  const [isOpen, setOpen] = useState(defaultOpen);
  const shown = open ?? isOpen;
  const y = view.getFullYear(), m = view.getMonth();
  const first = (new Date(y, m, 1).getDay() + 6) % 7;
  const days = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [...Array<null>(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const pick = (d: number) => { const n = new Date(y, m, d); setInner(n); onChange?.(n); setOpen(false); };
  const isSel = (d: number) => sel.getFullYear() === y && sel.getMonth() === m && sel.getDate() === d;
  return (
    <div className={cx("ic-field ic-date", className)}>
      {label && <span className="ic-label">{label}</span>}
      <div className="ic-date-row">
        <button type="button" className="ic-input ic-date-btn" aria-haspopup="dialog" aria-expanded={shown} onClick={() => setOpen(!shown)}>
          <Icon name="calendar" size={18} />
          {`${WEEKDAY_LONG[sel.getDay()]}, ${pad(sel.getDate())}/${pad(sel.getMonth() + 1)}/${sel.getFullYear()}`}
        </button>
        <input type="time" className="ic-input ic-date-time" defaultValue={time} aria-label="Giờ" onChange={(e) => onTimeChange?.(e.target.value)} />
      </div>
      {shown && (
        <div className="ic-cal" role="dialog" aria-label="Chọn ngày">
          <div className="ic-cal-head">
            <button type="button" className="ic-iconbtn ic-iconbtn-sm" aria-label="Tháng trước" onClick={() => setView(new Date(y, m - 1, 1))}><Icon name="left" size={16} /></button>
            <b>Tháng {m + 1}, {y}</b>
            <button type="button" className="ic-iconbtn ic-iconbtn-sm" aria-label="Tháng sau" onClick={() => setView(new Date(y, m + 1, 1))}><Icon name="right" size={16} /></button>
          </div>
          <div className="ic-cal-grid">
            {WD.map((w) => <span key={w} className="ic-cal-wd">{w}</span>)}
            {cells.map((c, k) => c ? <button key={k} type="button" className={cx("ic-cal-day", isSel(c) && "ic-cal-on")} onClick={() => pick(c)}>{c}</button> : <span key={k} />)}
          </div>
        </div>
      )}
      {hint && <div className="ic-field-foot"><span className="ic-hint">{hint}</span></div>}
    </div>
  );
}

export interface UploadFile { name: string; size?: string; progress?: number; error?: string }
export interface SubmissionUploadProps { accept?: string; acceptLabel?: string; maxSizeMB?: number; files?: UploadFile[]; onSelect?: (files: FileList) => void; className?: string }
export function SubmissionUpload({ accept, acceptLabel = "PDF, DOCX, MP3, M4A", maxSizeMB = 20, files = [], onSelect, className }: SubmissionUploadProps) {
  return (
    <div className={cx("ic-upload-wrap", className)}>
      <label className="ic-upload"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) onSelect?.(e.dataTransfer.files); }}>
        <input type="file" multiple accept={accept} className="ic-sr" onChange={(e) => e.target.files && onSelect?.(e.target.files)} />
        <span className="ic-upload-icon"><Icon name="upload" size={24} /></span>
        <span className="ic-upload-title">Kéo thả file vào đây hoặc <u>chọn file</u></span>
        <span className="ic-upload-hint">{acceptLabel} · tối đa {maxSizeMB} MB</span>
      </label>
      {files.length > 0 && (
        <ul className="ic-upload-list">
          {files.map((f, i) => (
            <li key={i} className={cx("ic-upload-file", f.error && "ic-upload-file-error")}>
              <Icon name={f.error ? "alert" : "file"} size={18} />
              <span className="ic-upload-name">{f.name}</span>
              <span className="ic-upload-size">{f.error ?? f.size}</span>
              {f.progress != null && f.progress < 100 && <span className="ic-upload-bar"><ProgressBar value={f.progress} /></span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
