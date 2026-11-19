import { useState, type ReactNode } from "react";
import { SKILLS, SKILL_LABEL, formatBand, type AssignmentStatus, type Skill } from "@acenz/core";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";
import { Avatar, BandScore, Badge, Button, ProgressBar, SkillTag, StatusBadge } from "./primitives";

export interface StatCardProps { label: string; value: ReactNode; icon?: IconName; delta?: string; trend?: "up" | "down"; deltaLabel?: string; className?: string }
/** `trend` by meaning: "up" = good (success), "down" = bad (danger). */
export function StatCard({ label, value, icon, delta, trend, deltaLabel, className }: StatCardProps) {
  return (
    <div className={cx("ic-card ic-stat", className)}>
      <div className="ic-stat-head"><span>{label}</span>{icon && <span className="ic-stat-icon"><Icon name={icon} size={18} /></span>}</div>
      <div className="ic-stat-value">{value}</div>
      {delta && (
        <div className={cx("ic-stat-delta", trend === "up" && "ic-up", trend === "down" && "ic-down")}>
          {trend === "up" ? "▲ " : trend === "down" ? "▼ " : ""}{delta}{deltaLabel && <span> {deltaLabel}</span>}
        </div>
      )}
    </div>
  );
}

export interface ClassCardProps { name: string; level?: string; teacher?: string; schedule?: string; students?: number; targetBand?: number; progress?: number; pending?: string; href?: string; className?: string }
export function ClassCard({ name, level, teacher, schedule, students, targetBand, progress, pending, href, className }: ClassCardProps) {
  const body = (
    <>
      <div className="ic-classcard-top">
        <div>{level && <div className="ic-classcard-level">{level}</div>}<h3 className="ic-classcard-name">{name}</h3></div>
        {targetBand != null && <BandScore score={targetBand} label="Mục tiêu" size="sm" />}
      </div>
      <ul className="ic-meta">
        {teacher && <li><Avatar name={teacher} size={20} />{teacher}</li>}
        {schedule && <li><Icon name="calendar" size={16} />{schedule}</li>}
        {students != null && <li><Icon name="users" size={16} />{students} học viên</li>}
      </ul>
      {progress != null && <ProgressBar value={progress} label="Tiến độ khoá học" />}
      {pending && <div className="ic-classcard-foot"><Badge tone="warning">{pending}</Badge></div>}
    </>
  );
  return href
    ? <a href={href} className={cx("ic-card ic-classcard", className)} style={{ color: "inherit", textDecoration: "none" }}>{body}</a>
    : <article className={cx("ic-card ic-classcard", className)}>{body}</article>;
}

export interface AssignmentItemProps { title: string; skill?: Skill; due?: string; status: AssignmentStatus; score?: number; submitted?: number; total?: number; onClick?: () => void; className?: string }
export function AssignmentItem({ title, skill = "writing", due, status, score, submitted, total, onClick, className }: AssignmentItemProps) {
  return (
    <div className={cx("ic-assign", className)} tabIndex={onClick ? 0 : undefined} role={onClick ? "button" : undefined}
      onClick={onClick} onKeyDown={(e) => { if (onClick && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onClick(); } }}>
      <span className={`ic-assign-icon ic-skill-${skill}`}><Icon name="file" /></span>
      <div className="ic-assign-main">
        <div className="ic-assign-title">{title}</div>
        <div className="ic-assign-meta">
          <SkillTag skill={skill} />
          {due && <span>Hạn: {due}</span>}
          {total ? <span>{submitted ?? 0}/{total} đã nộp</span> : null}
        </div>
      </div>
      <div className="ic-assign-side">
        {score != null && <BandScore score={score} size="sm" />}
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

export interface RosterStudent { id?: string; name: string; email?: string; avatar?: string; attendance: number; submitted: number; total: number; band: number | null }
export interface RosterTableProps { students: RosterStudent[]; onView?: (s: RosterStudent) => void; className?: string }
/** Attendance under 80% is flagged. Under 600px of its own width rows become cards. */
export function RosterTable({ students, onView, className }: RosterTableProps) {
  return (
    <div className={cx("ic-card ic-table-wrap", className)}>
      <table className="ic-table">
        <thead><tr><th>Học viên</th><th className="ic-num">Chuyên cần</th><th className="ic-num">Bài đã nộp</th><th className="ic-num">Band gần nhất</th><th /></tr></thead>
        <tbody>
          {students.map((s, i) => {
            const low = s.attendance < 80;
            return (
              <tr key={s.id ?? i}>
                <td><div className="ic-person"><Avatar name={s.name} src={s.avatar} size={32} /><div><div className="ic-person-name">{s.name}</div>{s.email && <div className="ic-person-sub">{s.email}</div>}</div></div></td>
                <td data-label="Chuyên cần" className={cx("ic-num", low && "ic-text-danger")}>{low && <Icon name="alert" size={14} />}{s.attendance}%</td>
                <td data-label="Đã nộp" className="ic-num">{s.submitted}/{s.total}</td>
                <td data-label="Band" className="ic-num"><BandScore score={s.band} size="sm" /></td>
                <td className="ic-actions"><Button variant="ghost" size="sm" onClick={() => onView?.(s)}>Xem</Button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const KIND_ICON = { assignment: "file", grade: "check", announcement: "megaphone", comment: "message", deadline: "clock" } as const satisfies Record<string, IconName>;
export interface NotificationItemProps { kind?: keyof typeof KIND_ICON; actor?: string; classLabel?: string; time?: string; unread?: boolean; onClick?: () => void; children?: ReactNode; className?: string }
export function NotificationItem({ kind = "announcement", actor, classLabel, time, unread, onClick, children, className }: NotificationItemProps) {
  return (
    <div className={cx("ic-notif", unread && "ic-notif-unread", className)} tabIndex={0} role="button" onClick={onClick}
      onKeyDown={(e) => { if (onClick && e.key === "Enter") onClick(); }}>
      <span className={`ic-notif-icon ic-notif-${kind}`}><Icon name={KIND_ICON[kind]} size={18} /></span>
      <div className="ic-notif-main">
        <div className="ic-notif-text">{actor && <b>{actor} </b>}{children}</div>
        <div className="ic-notif-meta">{[classLabel, time].filter(Boolean).join(" · ")}</div>
      </div>
      {unread && <span className="ic-notif-dot" aria-label="Chưa đọc" />}
    </div>
  );
}

export interface SkillBreakdownProps { scores: Partial<Record<Skill, number | null>>; target?: number; title?: string; className?: string }
export function SkillBreakdown({ scores, target, title, className }: SkillBreakdownProps) {
  const W = 520, L = 96, R = 48, rowH = 40, top = 12, H = top + rowH * 4 + 28;
  const sx = (v: number) => L + (v / 9) * (W - L - R);
  const aria = SKILLS.map((k) => `${SKILL_LABEL[k]} ${scores[k] == null ? "chưa có" : formatBand(scores[k])}`).join(", ");
  return (
    <figure className={cx("ic-chart", className)}>
      {title && <figcaption className="ic-chart-title">{title}</figcaption>}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={aria}>
        {[0, 3, 6, 9].map((t) => (
          <g key={t}><line x1={sx(t)} x2={sx(t)} y1={top - 4} y2={top + rowH * 4} className="ic-grid" /><text x={sx(t)} y={H - 8} className="ic-axis" textAnchor="middle">{t}</text></g>
        ))}
        {SKILLS.map((k, i) => {
          const v = scores[k]; const y = top + i * rowH + 10; const bw = v == null ? 0 : sx(v) - L;
          return (
            <g key={k} className="ic-bar-g">
              <title>{`${SKILL_LABEL[k]}: ${v == null ? "chưa có" : formatBand(v)}`}</title>
              <rect x={0} y={y - 8} width={W} height={rowH - 4} fill="transparent" />
              <text x={0} y={y + 14} className="ic-chart-label">{SKILL_LABEL[k]}</text>
              {v == null
                ? <text x={L} y={y + 14} className="ic-axis">Chưa có điểm</text>
                : <><rect x={L} y={y} width={bw} height={20} rx={4} className={`ic-fill-${k}`} /><text x={L + bw + 8} y={y + 15} className="ic-chart-value">{formatBand(v)}</text></>}
            </g>
          );
        })}
        {target != null && (
          <g><line x1={sx(target)} x2={sx(target)} y1={top - 6} y2={top + rowH * 4} className="ic-target" /><text x={sx(target) + 4} y={top} className="ic-axis ic-target-label">Mục tiêu {formatBand(target)}</text></g>
        )}
      </svg>
    </figure>
  );
}

export interface BandTrendChartProps { points: { label: string; band: number }[]; target?: number; min?: number; max?: number; title?: string; className?: string }
/** One series only; the title names it. */
export function BandTrendChart({ points, target, min = 4, max = 9, title, className }: BandTrendChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 560, H = 220, L = 36, R = 16, T = 20, B = 32;
  const sx = (i: number) => L + (points.length < 2 ? 0 : (i * (W - L - R)) / (points.length - 1));
  const sy = (v: number) => T + ((max - v) / (max - min)) * (H - T - B);
  const d = points.map((q, i) => `${i ? "L" : "M"}${sx(i)} ${sy(q.band)}`).join(" ");
  const ticks = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const last = points.length - 1;
  return (
    <figure className={cx("ic-chart", className)}>
      {title && <figcaption className="ic-chart-title">{title}</figcaption>}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${title ?? "Band"}: ${points.map((q) => `${q.label} ${formatBand(q.band)}`).join(", ")}`} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => <g key={t}><line x1={L} x2={W - R} y1={sy(t)} y2={sy(t)} className="ic-grid" /><text x={L - 8} y={sy(t) + 4} className="ic-axis" textAnchor="end">{t.toFixed(1)}</text></g>)}
        {target != null && <g><line x1={L} x2={W - R} y1={sy(target)} y2={sy(target)} className="ic-target" /><text x={L + 6} y={sy(target) - 6} className="ic-axis ic-target-label">Mục tiêu {formatBand(target)}</text></g>}
        {hover != null && <line x1={sx(hover)} x2={sx(hover)} y1={T} y2={H - B} className="ic-crosshair" />}
        <path d={d} className="ic-line" />
        {points.map((q, i) => (
          <g key={i}>
            <text x={sx(i)} y={H - 10} className="ic-axis" textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"}>{q.label}</text>
            <circle cx={sx(i)} cy={sy(q.band)} r={hover === i || i === last ? 5 : 4} className="ic-dot" />
            {i === last && <text x={sx(i) - 10} y={sy(q.band) - 12} className="ic-chart-value" textAnchor="end">{formatBand(q.band)}</text>}
            <rect x={sx(i) - 20} y={T} width={40} height={H - T - B} fill="transparent" onMouseEnter={() => setHover(i)}><title>{`${q.label}: Band ${formatBand(q.band)}`}</title></rect>
          </g>
        ))}
      </svg>
      {hover != null && points[hover] && <div className="ic-chart-tip" style={{ left: `${(sx(hover) / W) * 100}%` }}><b>{formatBand(points[hover].band)}</b> · {points[hover].label}</div>}
    </figure>
  );
}
