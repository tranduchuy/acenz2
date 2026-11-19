import { useState } from "react";
import { cx, focusRing } from "../cx";
import { Icon } from "../Icon";
import { FieldFoot } from "./FieldFoot";
import { field, fieldControl, fieldLabel } from "./styles";

const WD = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const WEEKDAY_LONG = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
const pad = (n: number) => String(n).padStart(2, "0");

const NAV_BTN = cx(
  "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md bg-transparent text-ink-muted hover:bg-surface-sunken hover:text-ink pointer-coarse:min-h-11 pointer-coarse:min-w-11",
  focusRing,
);

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
    <div className={cx(field, "relative max-w-105", className)}>
      {label && <span className={fieldLabel}>{label}</span>}
      <div className="flex gap-2">
        <button
          type="button"
          className={cx(fieldControl, "inline-flex flex-1 cursor-pointer items-center gap-2 text-left tabular-nums")}
          aria-haspopup="dialog"
          aria-expanded={shown}
          onClick={() => setOpen(!shown)}
        >
          <Icon name="calendar" size={18} className="text-ink-muted" />
          {`${WEEKDAY_LONG[sel.getDay()]}, ${pad(sel.getDate())}/${pad(sel.getMonth() + 1)}/${sel.getFullYear()}`}
        </button>
        <input
          type="time"
          className={cx(fieldControl, "w-34 flex-none tabular-nums scheme-light-dark")}
          defaultValue={time}
          aria-label="Giờ"
          onChange={(e) => onTimeChange?.(e.target.value)}
        />
      </div>
      {shown && (
        <div className="mt-1 box-border w-74 rounded-lg border border-line bg-surface-raised p-3 shadow-md" role="dialog" aria-label="Chọn ngày">
          <div className="mb-2 flex items-center justify-between text-body">
            <button type="button" className={NAV_BTN} aria-label="Tháng trước" onClick={() => setView(new Date(y, m - 1, 1))}><Icon name="left" size={16} /></button>
            <b className="font-medium">Tháng {m + 1}, {y}</b>
            <button type="button" className={NAV_BTN} aria-label="Tháng sau" onClick={() => setView(new Date(y, m + 1, 1))}><Icon name="right" size={16} /></button>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {WD.map((w) => <span key={w} className="text-caption leading-7 tracking-normal text-ink-muted">{w}</span>)}
            {cells.map((c, k) =>
              c ? (
                <button
                  key={k}
                  type="button"
                  className={cx(
                    "h-9 cursor-pointer rounded-md bg-transparent text-body-sm font-light tabular-nums text-ink hover:bg-surface-sunken",
                    focusRing,
                    isSel(c) && "bg-brand font-semibold text-on-brand hover:bg-brand",
                  )}
                  onClick={() => pick(c)}
                >
                  {c}
                </button>
              ) : (
                <span key={k} />
              ),
            )}
          </div>
        </div>
      )}
      {hint && <FieldFoot hint={hint} />}
    </div>
  );
}
