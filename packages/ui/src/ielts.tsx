import { useState, type ReactNode } from "react";
import { ATTENDANCE, BAND_STEPS, WRITING_CRITERIA, formatCountdown, formatDuration, overallBand, type Attendance, type Skill } from "@acenz/core";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";
import { Avatar, BandScore, Button, ProgressBar, useControllable } from "./primitives";
import { Checkbox, Select, TextField } from "./forms";

export interface CountdownTimerProps { seconds: number; total?: number; label?: string; className?: string }
/** Warning under 5 min, danger under 1 min. The parent ticks `seconds`. */
export function CountdownTimer({ seconds, total, label = "Thời gian còn lại", className }: CountdownTimerProps) {
  const s = Math.max(0, seconds);
  const state = s <= 60 ? "danger" : s <= 300 ? "warning" : "normal";
  return (
    <div className={cx("ic-timer", `ic-timer-${state}`, className)} role="timer" aria-live={state === "normal" ? "off" : "polite"}>
      <Icon name={state === "normal" ? "timer" : "alert"} size={18} />
      <div><div className="ic-timer-label">{label}</div><div className="ic-timer-value">{formatCountdown(s)}</div></div>
      {total ? <div className="ic-timer-track"><div style={{ width: `${(s / total) * 100}%` }} /></div> : null}
    </div>
  );
}

export interface ScheduleEvent { day: number; start: string; end: string; title: string; room?: string; skill?: Skill }
export interface ScheduleCalendarProps { events: ScheduleEvent[]; days?: string[]; dates?: string[]; today?: number; from?: number; to?: number; className?: string }
const toH = (t: string) => { const [h = "0", m = "0"] = t.split(":"); return Number(h) + Number(m) / 60; };
export function ScheduleCalendar({ events, days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"], dates, today, from = 17, to = 22, className }: ScheduleCalendarProps) {
  const hourH = 48;
  const hours = Array.from({ length: to - from }, (_, i) => from + i);
  return (
    <div className={cx("ic-card ic-sched", className)}>
      <div className="ic-sched-grid" style={{ gridTemplateColumns: `48px repeat(${days.length}, 1fr)` }}>
        <span />
        {days.map((d, i) => <div key={d} className={cx("ic-sched-day", today === i && "ic-sched-today")}>{d}{dates?.[i] && <b>{dates[i]}</b>}</div>)}
        <div className="ic-sched-hours" style={{ height: hours.length * hourH }}>{hours.map((h) => <span key={h} style={{ top: (h - from) * hourH }}>{h}:00</span>)}</div>
        {days.map((d, i) => (
          <div key={d} className="ic-sched-col" style={{ height: hours.length * hourH }}>
            {events.filter((e) => e.day === i).map((e, k) => (
              <div key={k} className={`ic-sched-ev ic-skill-${e.skill ?? "writing"}`} style={{ top: (toH(e.start) - from) * hourH + 2, height: (toH(e.end) - toH(e.start)) * hourH - 4 }}>
                <b>{e.title}</b><span>{e.start}–{e.end}{e.room ? ` · ${e.room}` : ""}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const ATT_ICON: Record<Attendance, IconName> = { present: "check", late: "clock", absent: "x" };
export interface AttendanceToggleProps { value?: Attendance; defaultValue?: Attendance; onChange?: (v: Attendance) => void; label?: string; className?: string }
export function AttendanceToggle({ value, defaultValue, onChange, label = "Điểm danh", className }: AttendanceToggleProps) {
  const [cur, set] = useControllable<Attendance | undefined>(value, defaultValue, onChange as (v: Attendance | undefined) => void);
  return (
    <div className={cx("ic-att", className)} role="radiogroup" aria-label={label}>
      {(Object.keys(ATTENDANCE) as Attendance[]).map((k) => {
        const on = cur === k;
        return (
          <button key={k} type="button" role="radio" aria-checked={on} className={cx("ic-att-btn", on && `ic-att-${k}`)} onClick={() => set(k)}>
            <Icon name={ATT_ICON[k]} size={14} />{ATTENDANCE[k].label}
          </button>
        );
      })}
    </div>
  );
}

export interface Criterion { key: string; label: string; description?: string }
export interface GradingPanelProps {
  title?: string; subtitle?: string; criteria?: readonly Criterion[];
  scores?: Record<string, number | null>; defaultScores?: Record<string, number | null>;
  onChange?: (scores: Record<string, number | null>) => void;
  comment?: string; onCommentChange?: (v: string) => void;
  onSaveDraft?: () => void; onSubmit?: (r: { scores: Record<string, number | null>; overall: number }) => void; className?: string;
}
/** Overall = average of criteria rounded to the nearest .5. "Trả bài" enables when all are set. */
export function GradingPanel({ title = "Chấm bài", subtitle, criteria = WRITING_CRITERIA, scores, defaultScores = {}, onChange, comment, onCommentChange, onSaveDraft, onSubmit, className }: GradingPanelProps) {
  const [sc, set] = useControllable(scores, defaultScores, onChange);
  const overall = overallBand(criteria.map((c) => sc[c.key]));
  return (
    <div className={cx("ic-card ic-grade", className)}>
      <div className="ic-grade-head">
        <div><h3>{title}</h3>{subtitle && <div className="ic-grade-sub">{subtitle}</div>}</div>
        <BandScore score={overall} label="Overall" />
      </div>
      <div className="ic-grade-rows">
        {criteria.map((c) => (
          <div key={c.key} className="ic-grade-row">
            <div><div className="ic-grade-crit">{c.label}</div>{c.description && <div className="ic-grade-desc">{c.description}</div>}</div>
            <div className="ic-select ic-grade-select">
              <select className="ic-input" aria-label={c.label} value={sc[c.key] == null ? "" : String(sc[c.key])}
                onChange={(e) => set({ ...sc, [c.key]: e.target.value === "" ? null : Number(e.target.value) })}>
                <option value="">–</option>
                {BAND_STEPS.map((b) => <option key={b} value={String(b)}>{b.toFixed(1)}</option>)}
              </select>
              <Icon name="down" size={16} className="ic-select-caret" />
            </div>
          </div>
        ))}
      </div>
      <TextField label="Nhận xét chung" multiline rows={3} placeholder="Điểm mạnh, điểm cần cải thiện, gợi ý cho lần sau…" value={comment} onChange={(e) => onCommentChange?.(e.target.value)} />
      <div className="ic-grade-actions">
        <Button onClick={onSaveDraft}>Lưu nháp</Button>
        <Button variant="primary" icon="send" disabled={overall == null} onClick={() => overall != null && onSubmit?.({ scores: sc, overall })}>Trả bài</Button>
      </div>
    </div>
  );
}

export interface FeedbackCommentProps { author: string; children: ReactNode; quote?: string; criterion?: string; suggestion?: string; time?: string; className?: string }
export function FeedbackComment({ author, children, quote, criterion, suggestion, time, className }: FeedbackCommentProps) {
  return (
    <div className={cx("ic-fb", className)}>
      {quote && <blockquote className="ic-fb-quote">{quote}</blockquote>}
      <div className="ic-fb-card">
        <div className="ic-fb-head"><Avatar name={author} size={24} /><b>{author}</b>{criterion && <span className="ic-fb-crit">{criterion}</span>}{time && <span className="ic-fb-time">{time}</span>}</div>
        <div className="ic-fb-text">{children}</div>
        {suggestion && <div className="ic-fb-suggest"><span>Gợi ý: </span><b>{suggestion}</b></div>}
      </div>
    </div>
  );
}

const SPEEDS = [1, 1.25, 0.75];
export interface AudioPlayerProps { title: string; duration: number; current?: number; playing?: boolean; onPlayPause?: (playing: boolean) => void; speed?: number; onSpeedChange?: (s: number) => void; onSeek?: (seconds: number) => void; showSpeed?: boolean; className?: string }
/** Control surface: wire it to an <audio> element in the app. */
export function AudioPlayer({ title, duration, current = 0, playing, onPlayPause, speed, onSpeedChange, onSeek, showSpeed = true, className }: AudioPlayerProps) {
  const [isPlaying, setPlaying] = useControllable(playing, false, onPlayPause);
  const [sp, setSp] = useControllable(speed, 1, onSpeedChange);
  const pct = duration ? (current / duration) * 100 : 0;
  return (
    <div className={cx("ic-audio", className)}>
      <button type="button" className="ic-audio-play" aria-label={isPlaying ? "Tạm dừng" : "Phát"} onClick={() => setPlaying(!isPlaying)}><Icon name={isPlaying ? "pause" : "play"} size={20} /></button>
      <div className="ic-audio-main">
        <div className="ic-audio-top"><span className="ic-audio-title">{title}</span><span className="ic-audio-time">{formatDuration(current)} / {formatDuration(duration)}</span></div>
        <div className="ic-audio-track" role="slider" tabIndex={0} aria-label="Tua" aria-valuemin={0} aria-valuemax={duration} aria-valuenow={current}
          onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); onSeek?.(((e.clientX - r.left) / r.width) * duration); }}
          onKeyDown={(e) => { if (e.key === "ArrowRight") onSeek?.(Math.min(duration, current + 5)); if (e.key === "ArrowLeft") onSeek?.(Math.max(0, current - 5)); }}>
          <div className="ic-audio-fill" style={{ width: `${pct}%` }} /><span className="ic-audio-knob" style={{ left: `${pct}%` }} />
        </div>
      </div>
      {showSpeed && <button type="button" className="ic-audio-speed" aria-label="Tốc độ phát" onClick={() => setSp(SPEEDS[(SPEEDS.indexOf(sp) + 1) % SPEEDS.length]!)}>{sp}×</button>}
    </div>
  );
}

export interface AudioRecorderProps { state?: "idle" | "recording" | "recorded"; elapsed?: number; limit?: number; prompt?: string; onToggle?: () => void; onRetry?: () => void; onSubmit?: () => void; className?: string }
/** UI only: drive `state`/`elapsed` from MediaRecorder in the app. */
export function AudioRecorder({ state = "idle", elapsed = 0, limit = 120, prompt = "Nhấn để bắt đầu ghi âm", onToggle, onRetry, onSubmit, className }: AudioRecorderProps) {
  return (
    <div className={cx("ic-card ic-rec", `ic-rec-${state}`, className)}>
      <button type="button" className="ic-rec-btn" aria-label={state === "recording" ? "Dừng ghi âm" : "Bắt đầu ghi âm"} onClick={onToggle}><Icon name={state === "recording" ? "stop" : "mic"} size={24} /></button>
      <div className="ic-rec-main">
        <div className="ic-rec-status">{state === "recording" ? <span className="ic-rec-live">Đang ghi âm</span> : state === "recorded" ? "Đã ghi xong" : prompt}</div>
        <div className="ic-rec-time">{formatDuration(elapsed)} / {formatDuration(limit)}</div>
        <ProgressBar value={elapsed} max={limit} />
      </div>
      {state === "recorded" && <div className="ic-rec-actions"><Button variant="ghost" size="sm" icon="redo" onClick={onRetry}>Ghi lại</Button><Button variant="primary" size="sm" icon="send" onClick={onSubmit}>Nộp bài</Button></div>}
    </div>
  );
}

export interface AnnouncementComposerProps { classes?: string[]; defaultClass?: string; heading?: string; onCancel?: () => void; onSend?: (a: { audience: string; title: string; body: string; email: boolean; pin: boolean }) => void; className?: string }
export function AnnouncementComposer({ classes = ["Tất cả lớp"], defaultClass, heading = "Gửi thông báo", onCancel, onSend, className }: AnnouncementComposerProps) {
  const [audience, setAudience] = useState(defaultClass ?? classes[0] ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState(true);
  const [pin, setPin] = useState(false);
  return (
    <div className={cx("ic-card ic-compose", className)}>
      <h3>{heading}</h3>
      <Select label="Gửi đến" options={classes} value={audience} onChange={(e) => setAudience(e.target.value)} />
      <TextField label="Tiêu đề" placeholder="VD: Lịch thi thử Mock test tháng 12" value={title} onChange={(e) => setTitle(e.target.value)} />
      <TextField label="Nội dung" multiline rows={4} placeholder="Nội dung thông báo…" value={body} onChange={(e) => setBody(e.target.value)} />
      <div className="ic-compose-opts">
        <Checkbox label="Gửi kèm email" checked={email} onChange={(e) => setEmail(e.target.checked)} />
        <Checkbox label="Ghim lên đầu lớp" checked={pin} onChange={(e) => setPin(e.target.checked)} />
      </div>
      <div className="ic-grade-actions">
        <Button variant="ghost" onClick={onCancel}>Huỷ</Button>
        <Button variant="primary" icon="send" disabled={!title.trim()} onClick={() => onSend?.({ audience, title, body, email, pin })}>Gửi thông báo</Button>
      </div>
    </div>
  );
}
