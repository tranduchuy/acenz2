import type { Skill } from "./types";

export const SKILLS: readonly Skill[] = ["listening", "reading", "writing", "speaking"];

export const SKILL_LABEL: Record<Skill, string> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};
