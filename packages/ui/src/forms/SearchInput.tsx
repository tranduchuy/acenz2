import type { InputHTMLAttributes } from "react";
import { cx } from "../cx";
import { Icon } from "../Icon";

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> { shortcut?: string }

export function SearchInput({ placeholder = "Tìm kiếm…", shortcut, className, ...rest }: SearchInputProps) {
  return (
    <label
      className={cx(
        "flex h-10 min-w-40 flex-[0_1_240px] items-center gap-2 rounded-md border border-line bg-surface-sunken px-3 text-ink-muted pointer-coarse:min-h-11",
        "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
        className,
      )}
    >
      <Icon name="search" size={18} />
      <input
        type="search"
        placeholder={placeholder}
        aria-label={placeholder}
        {...rest}
        className="min-w-0 flex-1 border-0 bg-transparent text-body text-ink outline-none placeholder:text-ink-muted"
      />
      {shortcut && (
        <kbd className="rounded-sm border border-line bg-surface-raised px-1.5 font-sans text-[12px]/[18px] font-light text-ink-muted">{shortcut}</kbd>
      )}
    </label>
  );
}
