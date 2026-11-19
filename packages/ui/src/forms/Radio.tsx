import type { ChangeEvent } from "react";
import { cx } from "../cx";
import { CheckText } from "./CheckText";
import { checkInput, checkMark, checkRoot, fieldLabel, peerFocusRing } from "./styles";

export interface RadioProps {
  name: string; options: { value: string; label: string; description?: string }[];
  value?: string; defaultValue?: string; onChange?: (e: ChangeEvent<HTMLInputElement>) => void; legend?: string; className?: string;
}

export function Radio({ name, options, value, defaultValue, onChange, legend, className }: RadioProps) {
  return (
    <fieldset className={cx("m-0 flex flex-col gap-3 border-0 p-0", className)}>
      {legend && <legend className={cx(fieldLabel, "mb-3 p-0")}>{legend}</legend>}
      {options.map((o) => (
        <label key={o.value} className={checkRoot}>
          <input
            type="radio"
            name={name}
            value={o.value}
            className={checkInput}
            onChange={onChange}
            {...(value !== undefined ? { checked: value === o.value } : { defaultChecked: defaultValue === o.value })}
          />
          <span
            className={cx(checkMark, "rounded-full peer-checked:border-brand peer-checked:bg-brand peer-checked:inset-ring-4 peer-checked:inset-ring-surface-raised", peerFocusRing)}
            aria-hidden
          />
          <CheckText label={o.label} description={o.description} />
        </label>
      ))}
    </fieldset>
  );
}
