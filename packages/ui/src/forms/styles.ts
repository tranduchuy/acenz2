import { focusRing } from "../cx";

/** Stacked field wrapper: label, control, foot. */
export const field = "flex min-w-0 flex-col gap-2";

/** Field label (13/18, medium). */
export const fieldLabel = "text-label text-ink";

/** Text-like control: input, textarea, select, date button. Error → add `border-danger`. */
export const fieldControl = [
  "h-10 w-full rounded-md border border-line-strong bg-surface-raised px-3 text-body text-ink placeholder:text-ink-muted pointer-coarse:min-h-11",
  focusRing,
].join(" ");

/** Focus ring on the box/track that follows a visually hidden `peer` input. */
export const peerFocusRing = "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus";

/** Row shared by Checkbox, Switch and each Radio option. */
export const checkRoot = "relative flex cursor-pointer items-start gap-3 text-body leading-[22px]";

/** Native input kept in the a11y tree but invisible; the sibling span draws the control. */
export const checkInput = "peer absolute size-px opacity-0";

/** Checkbox box / radio dot frame (add shape + checked colors). */
export const checkMark =
  "mt-px inline-flex size-5 shrink-0 items-center justify-center border-[1.5px] border-line-strong bg-surface-raised transition-colors duration-[120ms] ease-out";
