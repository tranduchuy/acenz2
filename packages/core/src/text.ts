export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

/** Minimum words per IELTS Writing task. */
export const MIN_WORDS = { task1: 150, task2: 250 } as const;

export function initials(name: string): string {
  const w = name.trim().split(/\s+/).filter(Boolean);
  if (w.length === 0) return "?";
  return (w.length > 1 ? w[0]![0]! + w[w.length - 1]![0]! : w[0]!.slice(0, 2)).toUpperCase();
}
