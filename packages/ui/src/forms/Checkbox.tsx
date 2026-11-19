import { cx } from "../cx";
import { Icon } from "../Icon";
import { CheckText } from "./CheckText";
import type { CheckLikeProps } from "./CheckLikeProps";
import { checkInput, checkMark, checkRoot, peerFocusRing } from "./styles";

export function Checkbox({ label, description, className, disabled, ...input }: CheckLikeProps) {
  return (
    <label className={cx(checkRoot, disabled && "cursor-not-allowed opacity-45", className)}>
      <input type="checkbox" className={checkInput} disabled={disabled} {...input} />
      <span
        className={cx(checkMark, "rounded-sm text-transparent peer-checked:border-brand peer-checked:bg-brand peer-checked:text-on-brand", peerFocusRing)}
        aria-hidden
      >
        <Icon name="check" size={14} />
      </span>
      <CheckText label={label} description={description} />
    </label>
  );
}
