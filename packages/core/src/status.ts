import type { AssignmentStatus, Attendance, Tone } from "./types";

export const ASSIGNMENT_STATUS: Record<AssignmentStatus, { tone: Tone; label: string }> = {
  "not-submitted": { tone: "neutral", label: "Chưa nộp" },
  "due-soon": { tone: "warning", label: "Sắp đến hạn" },
  submitted: { tone: "info", label: "Đã nộp" },
  graded: { tone: "success", label: "Đã chấm" },
  late: { tone: "danger", label: "Nộp muộn" },
  missing: { tone: "danger", label: "Thiếu bài" },
};

export const ATTENDANCE: Record<Attendance, { tone: Tone; label: string }> = {
  present: { tone: "success", label: "Có mặt" },
  late: { tone: "warning", label: "Muộn" },
  absent: { tone: "danger", label: "Vắng" },
};

/** Due within this many hours counts as "due-soon". */
export const DUE_SOON_HOURS = 48;

/** Learner-side status from deadline and submission state. */
export function assignmentStatus(input: { due: Date; submittedAt?: Date | null; gradedAt?: Date | null; now?: Date }): AssignmentStatus {
  const now = input.now ?? new Date();
  if (input.gradedAt) return "graded";
  if (input.submittedAt) return input.submittedAt > input.due ? "late" : "submitted";
  if (now > input.due) return "missing";
  return input.due.getTime() - now.getTime() <= DUE_SOON_HOURS * 3600_000 ? "due-soon" : "not-submitted";
}
