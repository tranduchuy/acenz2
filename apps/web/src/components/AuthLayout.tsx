import type { ReactNode } from "react";
import { Icon, type IconName } from "@acenz/ui";
import logoWhite from "../assets/logo-white.png";

const FEATURES: { icon: IconName; text: string }[] = [
  { icon: "send", text: "Nộp bài Writing, Speaking ngay trên web" },
  { icon: "message", text: "Xem nhận xét và Band theo từng tiêu chí" },
  { icon: "calendar", text: "Theo dõi lịch học và thông báo của lớp" },
];

interface AuthLayoutProps {
  /** Line under the logo: in the desktop brand panel and in the mobile header band. */
  tagline: string;
  /** `data-testid` of the desktop brand panel (hidden below `lg`). */
  brandPanelTestId: string;
  /** The page's own content: heading and form. */
  children: ReactNode;
}

/** Shared frame of the sign-in pages: brand panel on desktop, header band on mobile, content column. */
export function AuthLayout({ tagline, brandPanelTestId, children }: AuthLayoutProps) {
  return (
    <div className="min-h-dvh bg-surface font-sans text-ink lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Desktop brand panel */}
      <aside className="hidden flex-col justify-between gap-10 bg-brand px-12 pt-12 pb-10 text-on-brand lg:flex" data-testid={brandPanelTestId}>
        <img src={logoWhite} alt="ACENZ" className="h-11 w-auto self-start dark:invert" />
        <div className="flex max-w-[480px] flex-col gap-8">
          <h2 className="m-0 text-display">{tagline}</h2>
          <ul className="m-0 flex list-none flex-col gap-4 p-0 text-body">
            {FEATURES.map((f) => (
              <li key={f.icon} className="flex items-center gap-3">
                <Icon name={f.icon} />
                <span>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="m-0 text-body-sm">© 2026 ACENZ</p>
      </aside>

      <div className="flex min-h-dvh flex-col lg:min-h-0">
        {/* Mobile header band */}
        <header className="flex flex-col gap-4 bg-brand px-6 pt-8 pb-6 text-on-brand lg:hidden">
          <img src={logoWhite} alt="ACENZ" className="h-8 w-auto self-start dark:invert" />
          <p className="m-0 text-h2 font-extralight">{tagline}</p>
        </header>

        <main className="flex flex-1 flex-col px-6 pt-6 pb-5 lg:items-center lg:justify-center lg:px-8 lg:py-10">
          <div className="flex w-full flex-col gap-5 lg:max-w-[420px] lg:gap-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
