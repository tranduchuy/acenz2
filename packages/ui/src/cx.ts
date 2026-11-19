import { extendTailwindMerge } from "tailwind-merge";

/** ACENZ type styles (`text-h1`, `text-body`…) are font sizes, not colors — tell tailwind-merge. */
export const TEXT_STYLES = ["display", "h1", "h2", "h3", "body-lg", "body", "body-sm", "label", "caption", "score-lg", "score"] as const;

const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: [...TEXT_STYLES] }] } },
});

/** Join class names; later Tailwind utilities win over earlier ones (so `className` overrides defaults). */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return twMerge(parts.filter(Boolean).join(" "));
}

/** Shared focus ring: solid 2px `focus` token, 2px offset. */
export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
