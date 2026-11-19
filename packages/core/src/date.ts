const WEEKDAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"] as const;
const pad = (n: number) => String(n).padStart(2, "0");

export const weekdayVi = (d: Date): string => WEEKDAYS[d.getDay()]!;

/** "Thứ Sáu, 20/11 · 23:59" — homework deadlines always show day and time. */
export function formatDeadline(d: Date): string {
  return `${weekdayVi(d)}, ${d.getDate()}/${d.getMonth() + 1} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "Thứ Sáu, 20/11/2026" */
export function formatDateLong(d: Date): string {
  return `${weekdayVi(d)}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** "5 phút trước", "2 giờ trước" within 24 h, else the deadline format without weekday. */
export function formatRelative(d: Date, now: Date = new Date()): string {
  const s = Math.round((now.getTime() - d.getTime()) / 1000);
  if (s < 60) return "Vừa xong";
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 172800) return "Hôm qua";
  return `${weekdayVi(d)}, ${d.getDate()}/${d.getMonth() + 1}`;
}

/** "2:08" for audio and timers. */
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${pad(s % 60)}`;
}

/** "40:12" countdown. */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}
