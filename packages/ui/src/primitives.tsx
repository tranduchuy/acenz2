import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { ASSIGNMENT_STATUS, SKILL_LABEL, formatBand, initials, type AssignmentStatus, type Skill, type Tone } from "@acenz/core";
import { cx, focusRing } from "./cx";
import { Icon, type IconName } from "./Icon";

// ---------- Button ----------
const BUTTON_VARIANT = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover",
  secondary: "bg-surface-raised text-ink border-line-strong hover:bg-surface-sunken",
  ghost: "bg-transparent text-brand hover:bg-brand-soft hover:text-brand-ink",
  danger: "bg-surface-raised text-danger border-danger hover:bg-danger-soft",
} as const;
const BUTTON_SIZE = {
  md: "h-10 px-4 text-body pointer-coarse:min-h-11",
  sm: "h-8 px-3 text-body-sm pointer-coarse:min-h-10",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof BUTTON_VARIANT;
  size?: keyof typeof BUTTON_SIZE;
  icon?: IconName;
}
/** One `primary` per view. Verb-first, sentence-case labels. */
export function Button({ variant = "secondary", size = "md", icon, className, children, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      {...rest}
      className={cx(
        "ic-btn inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-transparent font-medium transition-colors duration-150 ease-out",
        "disabled:cursor-not-allowed disabled:opacity-45",
        focusRing,
        BUTTON_VARIANT[variant],
        BUTTON_SIZE[size],
        className,
      )}
    >
      {icon && <Icon name={icon} size={size === "sm" ? 16 : 18} />}
      {children}
    </button>
  );
}

// ---------- Badge ----------
const BADGE_TONE: Record<Tone, string> = {
  neutral: "bg-surface-sunken text-ink-muted ring-1 ring-inset ring-line",
  info: "bg-info-soft text-info",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};
const TONE_ICON: Partial<Record<Tone, IconName>> = { success: "check", warning: "clock", danger: "alert", info: "circle" };
const chip = "inline-flex items-center gap-1 whitespace-nowrap rounded-sm px-2 py-1 text-caption";

export interface BadgeProps { tone?: Tone; icon?: IconName | false; children?: ReactNode; className?: string }
/** Status label: tone + icon + word, never color alone. */
export function Badge({ tone = "neutral", icon, children, className }: BadgeProps) {
  const name = icon === false ? undefined : (icon ?? TONE_ICON[tone]);
  return (
    <span className={cx(chip, BADGE_TONE[tone], className)}>
      {name && <Icon name={name} size={14} />}
      {children}
    </span>
  );
}

/** Badge preset for assignment status — fixed tone + Vietnamese label. */
export function StatusBadge({ status, className }: { status: AssignmentStatus; className?: string }) {
  const s = ASSIGNMENT_STATUS[status];
  return (
    <Badge tone={s.tone} icon={status === "missing" ? "x" : status === "not-submitted" ? false : undefined} className={className}>
      {s.label}
    </Badge>
  );
}

// ---------- SkillTag ----------
/** Skill colors for reuse: tag background + text. */
export const SKILL_TONE: Record<Skill, string> = {
  listening: "bg-skill-listening-soft text-skill-listening",
  reading: "bg-skill-reading-soft text-skill-reading",
  writing: "bg-skill-writing-soft text-skill-writing",
  speaking: "bg-skill-speaking-soft text-skill-speaking",
};

export interface SkillTagProps { skill: Skill; children?: ReactNode; className?: string }
export function SkillTag({ skill, children, className }: SkillTagProps) {
  return <span className={cx(chip, SKILL_TONE[skill], className)}>{children ?? SKILL_LABEL[skill]}</span>;
}

// ---------- BandScore ----------
const BAND_SIZE = {
  sm: "min-w-10 px-2 py-0.5 text-[14px] leading-5",
  md: "min-w-14 px-3 py-2 text-score",
  lg: "min-w-24 px-5 py-4 text-score-lg",
} as const;

export interface BandScoreProps { score: number | null | undefined; label?: string; size?: keyof typeof BAND_SIZE; className?: string }
/** Pastel peach chip, one decimal. null → neutral dash. */
export function BandScore({ score, label, size = "md", className }: BandScoreProps) {
  const text = formatBand(score);
  const empty = score == null;
  return (
    <span className={cx("inline-flex flex-col items-center justify-center tabular-nums", className)} aria-label={`${label ?? "Band"} ${text}`}>
      {label && <span className="mb-1 text-caption text-ink-muted">{label}</span>}
      <span
        className={cx(
          "inline-flex items-center justify-center rounded-full font-semibold",
          empty ? "bg-surface-sunken text-ink-muted ring-1 ring-inset ring-line" : "bg-accent text-on-accent",
          BAND_SIZE[size],
        )}
      >
        {text}
      </span>
    </span>
  );
}

// ---------- Avatar ----------
export interface AvatarProps { name: string; src?: string; size?: number; className?: string }
export function Avatar({ name, src, size = 32, className }: AvatarProps) {
  return (
    <span
      className={cx("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-soft font-medium leading-none text-brand-ink", className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
      title={name}
    >
      {src ? <img src={src} alt={name} className="size-full object-cover" /> : initials(name)}
    </span>
  );
}

// ---------- ProgressBar ----------
export interface ProgressBarProps { value: number; max?: number; label?: string; valueText?: string; className?: string }
export function ProgressBar({ value, max = 100, label, valueText, className }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      {label && (
        <div className="flex justify-between text-body-sm text-ink-muted">
          <span>{label}</span>
          <span className="font-medium tabular-nums text-ink">{valueText ?? `${Math.round(pct)}%`}</span>
        </div>
      )}
      <div
        className="h-2 overflow-hidden rounded-full bg-surface-sunken ring-1 ring-inset ring-line"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-brand transition-[width] duration-200 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ---------- state helper ----------
/** Controlled (value + onChange) or uncontrolled (defaultValue). */
export function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void): [T, (v: T) => void] {
  const [inner, setInner] = useState<T>(defaultValue);
  const current = value !== undefined ? value : inner;
  return [current, (v: T) => { setInner(v); onChange?.(v); }];
}

// ---------- Tabs ----------
export interface TabItem { value: string; label: string; count?: number }
export interface TabsProps { items: TabItem[]; value?: string; defaultValue?: string; onChange?: (value: string) => void; className?: string }
/** Scrolls horizontally on narrow screens instead of wrapping. */
export function Tabs({ items, value, defaultValue, onChange, className }: TabsProps) {
  const [cur, set] = useControllable(value, defaultValue ?? items[0]?.value ?? "", onChange);
  return (
    <div className={cx("flex gap-1 overflow-x-auto border-b border-line", className)} role="tablist">
      {items.map((it) => {
        const on = it.value === cur;
        return (
          <button
            key={it.value}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => set(it.value)}
            className={cx(
              "-mb-px inline-flex shrink-0 cursor-pointer items-center gap-2 border-b-2 border-transparent bg-transparent px-3 pb-3 pt-2 text-body font-normal text-ink-muted hover:text-ink",
              focusRing,
              on && "border-brand font-medium text-brand hover:text-brand",
            )}
          >
            {it.label}
            {it.count != null && (
              <span className={cx("rounded-full px-1.5 text-caption", on ? "bg-brand-soft text-brand-ink" : "bg-surface-sunken text-ink-muted")}>{it.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
