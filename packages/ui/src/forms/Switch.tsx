import { cx } from "../cx";
import { CheckText } from "./CheckText";
import type { CheckLikeProps } from "./CheckLikeProps";
import { checkInput, checkRoot, peerFocusRing } from "./styles";

export function Switch({ label, description, className, ...input }: CheckLikeProps) {
  return (
    <label className={cx(checkRoot, className)}>
      <input type="checkbox" role="switch" className={checkInput} {...input} />
      <span
        className={cx(
          "relative h-6 w-10 shrink-0 rounded-full bg-line-strong transition-colors duration-150 ease-out peer-checked:bg-brand",
          // thumb
          "after:absolute after:left-0.75 after:top-0.75 after:size-4.5 after:rounded-full after:bg-white after:shadow-[0_1px_2px_rgba(0,0,0,0.25)] after:transition-transform after:duration-150 after:ease-out",
          "peer-checked:after:translate-x-4 peer-checked:after:bg-on-brand",
          peerFocusRing,
        )}
        aria-hidden
      />
      <CheckText label={label} description={description} />
    </label>
  );
}
