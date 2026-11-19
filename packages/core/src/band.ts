/** IELTS bands go from 0 to 9 in 0.5 steps. */
export const BAND_STEPS: readonly number[] = Array.from({ length: 19 }, (_, i) => 9 - i * 0.5);

/** Rounds to the nearest 0.5 band; .25 rounds up, .75 rounds up (IELTS convention). */
export function roundBand(value: number): number {
  return Math.floor(value * 2 + 0.5) / 2;
}

/** Overall band from criterion scores; null until every score is set. */
export function overallBand(scores: readonly (number | null | undefined)[]): number | null {
  if (scores.length === 0 || scores.some((s) => s == null)) return null;
  const sum = (scores as number[]).reduce((a, b) => a + b, 0);
  return roundBand(sum / scores.length);
}

/** Always one decimal with a dot: 7 → "7.0". null → "–". */
export function formatBand(value: number | null | undefined): string {
  return value == null ? "–" : value.toFixed(1);
}

export const WRITING_CRITERIA = [
  { key: "tr", label: "Task Response", description: "Mức độ trả lời đúng và đủ yêu cầu đề" },
  { key: "cc", label: "Coherence & Cohesion", description: "Mạch lạc, liên kết ý" },
  { key: "lr", label: "Lexical Resource", description: "Vốn từ vựng" },
  { key: "gra", label: "Grammatical Range & Accuracy", description: "Ngữ pháp đa dạng, chính xác" },
] as const;

export const SPEAKING_CRITERIA = [
  { key: "fc", label: "Fluency & Coherence", description: "Trôi chảy, mạch lạc" },
  { key: "lr", label: "Lexical Resource", description: "Vốn từ vựng" },
  { key: "gra", label: "Grammatical Range & Accuracy", description: "Ngữ pháp đa dạng, chính xác" },
  { key: "p", label: "Pronunciation", description: "Phát âm" },
] as const;
