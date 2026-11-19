import type { ChangeEvent } from "react";

/** Props shared by Checkbox and Switch. */
export interface CheckLikeProps {
  label: string; description?: string; checked?: boolean; defaultChecked?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void; disabled?: boolean; name?: string; className?: string;
}
