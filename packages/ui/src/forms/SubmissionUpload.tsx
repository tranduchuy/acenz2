import { cx } from "../cx";
import { Icon } from "../Icon";
import { ProgressBar } from "../primitives";

export interface UploadFile { name: string; size?: string; progress?: number; error?: string }

export interface SubmissionUploadProps { accept?: string; acceptLabel?: string; maxSizeMB?: number; files?: UploadFile[]; onSelect?: (files: FileList) => void; className?: string }

export function SubmissionUpload({ accept, acceptLabel = "PDF, DOCX, MP3, M4A", maxSizeMB = 20, files = [], onSelect, className }: SubmissionUploadProps) {
  return (
    <div className={cx("flex flex-col gap-3", className)}>
      <label
        className={cx(
          "relative flex cursor-pointer flex-col items-center gap-2 rounded-lg border-[1.5px] border-dashed border-line-strong bg-surface-sunken px-4 py-6 text-center transition-colors duration-150 ease-out",
          "hover:border-brand hover:bg-brand-soft",
          "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus",
        )}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) onSelect?.(e.dataTransfer.files); }}
      >
        <input type="file" multiple accept={accept} className="sr-only" onChange={(e) => e.target.files && onSelect?.(e.target.files)} />
        <span className="inline-flex size-12 items-center justify-center rounded-full bg-surface-raised text-brand shadow-sm"><Icon name="upload" size={24} /></span>
        <span className="font-medium text-ink">Kéo thả file vào đây hoặc <u className="text-brand underline-offset-3">chọn file</u></span>
        <span className="text-body-sm font-light text-ink-muted">{acceptLabel} · tối đa {maxSizeMB} MB</span>
      </label>
      {files.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {files.map((f, i) => (
            <li
              key={i}
              className={cx(
                "grid grid-cols-[auto_1fr_auto] items-center gap-2 rounded-md border border-line bg-surface-raised px-3 py-2 text-body-sm font-light text-ink-muted",
                f.error && "border-danger bg-danger-soft text-danger",
              )}
            >
              <Icon name={f.error ? "alert" : "file"} size={18} />
              <span className="truncate font-medium text-ink">{f.name}</span>
              <span>{f.error ?? f.size}</span>
              {f.progress != null && f.progress < 100 && <span className="col-span-full"><ProgressBar value={f.progress} /></span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
