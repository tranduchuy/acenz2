import { useEffect, useId, type ReactNode } from "react";
import type { Tone } from "@acenz/core";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";

type StatusTone = Exclude<Tone, "neutral">;
const TONE_ICON: Record<StatusTone, IconName> = { info: "info", success: "check", warning: "clock", danger: "alert" };

export interface BannerProps { tone?: StatusTone; title?: ReactNode; children?: ReactNode; icon?: IconName; action?: ReactNode; className?: string }
export function Banner({ tone = "info", title, children, icon, action, className }: BannerProps) {
  return (
    <div className={cx("ic-banner", `ic-banner-${tone}`, className)} role={tone === "danger" ? "alert" : "status"}>
      <Icon name={icon ?? TONE_ICON[tone]} />
      <div className="ic-banner-body">{title && <b>{title}</b>}{children && <span>{children}</span>}</div>
      {action}
    </div>
  );
}

export interface ToastProps { title: ReactNode; children?: ReactNode; tone?: StatusTone; action?: ReactNode; onClose?: () => void; className?: string }
/** Show bottom-right; auto-dismiss after 5s except errors. */
export function Toast({ title, children, tone = "success", action, onClose, className }: ToastProps) {
  return (
    <div className={cx("ic-toast", className)} role="status">
      <span className={`ic-toast-icon ic-toast-${tone}`}><Icon name={TONE_ICON[tone]} size={18} /></span>
      <div className="ic-toast-body">
        <div className="ic-toast-title">{title}</div>
        {children && <div className="ic-toast-text">{children}</div>}
      </div>
      {action}
      <button type="button" className="ic-iconbtn ic-iconbtn-sm" aria-label="Đóng" onClick={onClose}><Icon name="x" size={16} /></button>
    </div>
  );
}

export interface DialogProps { title: ReactNode; children?: ReactNode; actions?: ReactNode; onClose?: () => void; open?: boolean; tone?: "danger"; inline?: boolean; className?: string }
/** Modal. Escape closes. Becomes a bottom sheet under 600px. */
export function Dialog({ title, children, actions, onClose, open = true, tone, inline, className }: DialogProps) {
  const id = useId();
  useEffect(() => {
    if (!open || inline || !onClose) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, inline, onClose]);
  if (!open) return null;
  return (
    <div className={cx("ic-dialog-backdrop", inline && "ic-dialog-inline")} onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={cx("ic-dialog", className)} role="dialog" aria-modal aria-labelledby={id}>
        <div className="ic-dialog-head">
          {tone === "danger" && <span className="ic-dialog-icon"><Icon name="alert" /></span>}
          <h2 id={id}>{title}</h2>
          <button type="button" className="ic-iconbtn ic-iconbtn-sm" aria-label="Đóng" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div className="ic-dialog-body">{children}</div>
        {actions && <div className="ic-dialog-actions">{actions}</div>}
      </div>
    </div>
  );
}

export interface TooltipProps { label: string; children: ReactNode; open?: boolean; className?: string }
export function Tooltip({ label, children, open, className }: TooltipProps) {
  return (
    <span className={cx("ic-tip", open && "ic-tip-open", className)} tabIndex={0}>
      {children}
      <span className="ic-tip-bubble" role="tooltip">{label}</span>
    </span>
  );
}

export interface EmptyStateProps { title: ReactNode; children?: ReactNode; icon?: IconName; action?: ReactNode; className?: string }
export function EmptyState({ title, children, icon = "inbox", action, className }: EmptyStateProps) {
  return (
    <div className={cx("ic-empty", className)}>
      <span className="ic-empty-icon"><Icon name={icon} size={28} /></span>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export interface SkeletonProps { variant?: "text" | "row" | "card"; lines?: number }
export function Skeleton({ variant = "text", lines = 3 }: SkeletonProps) {
  if (variant === "row")
    return (
      <div className="ic-skel-row" aria-hidden>
        <span className="ic-skel ic-skel-circle" />
        <div className="ic-skel-lines"><span className="ic-skel" style={{ width: "55%" }} /><span className="ic-skel ic-skel-sm" style={{ width: "35%" }} /></div>
        <span className="ic-skel ic-skel-pill" />
      </div>
    );
  if (variant === "card")
    return (
      <div className="ic-card ic-skel-card" aria-hidden>
        <span className="ic-skel ic-skel-sm" style={{ width: "40%" }} /><span className="ic-skel ic-skel-lg" style={{ width: "75%" }} />
        <span className="ic-skel" style={{ width: "60%" }} /><span className="ic-skel" style={{ width: "50%" }} /><span className="ic-skel ic-skel-bar" />
      </div>
    );
  return <div className="ic-skel-lines" aria-hidden>{Array.from({ length: lines }, (_, i) => <span key={i} className="ic-skel" style={{ width: i === lines - 1 ? "60%" : "100%" }} />)}</div>;
}
