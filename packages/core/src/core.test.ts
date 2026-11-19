import { describe, expect, it } from "vitest";
import { assignmentStatus, countWords, formatBand, formatDeadline, initials, overallBand, roundBand } from "./index";

describe("band", () => {
  it("rounds to nearest .5, quarters round up", () => {
    expect(roundBand(6.25)).toBe(6.5);
    expect(roundBand(6.125)).toBe(6);
    expect(roundBand(6.75)).toBe(7);
  });
  it("overall needs every score", () => {
    expect(overallBand([6.5, 7, 6.5, 6])).toBe(6.5);
    expect(overallBand([6.5, null, 6.5, 6])).toBeNull();
  });
  it("formats with one decimal", () => {
    expect(formatBand(7)).toBe("7.0");
    expect(formatBand(null)).toBe("–");
  });
});

describe("text & date", () => {
  it("counts words", () => expect(countWords("  this policy brings  more ")).toBe(4));
  it("initials from Vietnamese names", () => expect(initials("Nguyễn Thu Hà")).toBe("NH"));
  it("formats deadline", () => expect(formatDeadline(new Date(2026, 10, 20, 23, 59))).toBe("Thứ Sáu, 20/11 · 23:59"));
});

describe("status", () => {
  const due = new Date(2026, 10, 20, 23, 59);
  it("due soon within 48h", () => expect(assignmentStatus({ due, now: new Date(2026, 10, 19, 12) })).toBe("due-soon"));
  it("missing after deadline", () => expect(assignmentStatus({ due, now: new Date(2026, 10, 21) })).toBe("missing"));
  it("late submission", () => expect(assignmentStatus({ due, submittedAt: new Date(2026, 10, 21) })).toBe("late"));
});
