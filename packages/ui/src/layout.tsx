import { Fragment, type MouseEvent, type ReactNode } from "react";
import { cx } from "./cx";
import { Icon, type IconName } from "./Icon";
import { SearchInput } from "./forms";
import { Avatar, useControllable } from "./primitives";

export interface NavItem { value: string; label: string; icon?: IconName; count?: number; href?: string }

function navClick(it: NavItem, set: (v: string) => void) {
  return (e: MouseEvent) => { if (!it.href) e.preventDefault(); set(it.value); };
}

export interface AppShellProps { sidebar: ReactNode; topbar?: ReactNode; bottomNav?: ReactNode; children?: ReactNode; className?: string }
/** Responds to its own width: full sidebar ≥1024, icon rail 768–1023, BottomNav below 768. */
export function AppShell({ sidebar, topbar, bottomNav, children, className }: AppShellProps) {
  return (
    <div className={cx("ic-shell", className)}>
      <div className="ic-shell-grid">
        {sidebar}
        <div className="ic-shell-main">
          {topbar}
          <main className="ic-shell-content">{children}</main>
          {bottomNav}
        </div>
      </div>
    </div>
  );
}

export interface SidebarProps { items: NavItem[]; value?: string; defaultValue?: string; onChange?: (value: string) => void; logo?: string; logoAlt?: string; footer?: ReactNode; className?: string }
export function Sidebar({ items, value, defaultValue, onChange, logo, logoAlt = "ACENZ", footer, className }: SidebarProps) {
  const [cur, set] = useControllable(value, defaultValue ?? items[0]?.value ?? "", onChange);
  return (
    <aside className={cx("ic-sidebar", className)}>
      {logo && <div className="ic-sidebar-logo"><img src={logo} alt={logoAlt} /></div>}
      <nav className="ic-sidebar-nav">
        {items.map((it) => {
          const on = it.value === cur;
          return (
            <a key={it.value} href={it.href ?? "#"} className={cx("ic-nav", on && "ic-nav-on")} aria-current={on ? "page" : undefined} onClick={navClick(it, set)} title={it.label}>
              <Icon name={it.icon ?? "circle"} size={20} />
              <span>{it.label}</span>
              {it.count ? <span className="ic-nav-count">{it.count}</span> : null}
            </a>
          );
        })}
      </nav>
      {footer && <div className="ic-sidebar-foot">{footer}</div>}
    </aside>
  );
}

export interface BottomNavProps { items: NavItem[]; value?: string; defaultValue?: string; onChange?: (value: string) => void; label?: string; className?: string }
/** Phone navigation, max 5 items. Shown by AppShell below 768px. */
export function BottomNav({ items, value, defaultValue, onChange, label = "Điều hướng chính", className }: BottomNavProps) {
  const [cur, set] = useControllable(value, defaultValue ?? items[0]?.value ?? "", onChange);
  return (
    <nav className={cx("ic-bottomnav", className)} aria-label={label}>
      {items.slice(0, 5).map((it) => {
        const on = it.value === cur;
        return (
          <a key={it.value} href={it.href ?? "#"} className={cx("ic-bnav", on && "ic-bnav-on")} aria-current={on ? "page" : undefined} onClick={navClick(it, set)}>
            <span className="ic-bnav-icon">
              <Icon name={it.icon ?? "circle"} size={22} />
              {it.count ? <span className="ic-bnav-count">{it.count > 9 ? "9+" : it.count}</span> : null}
            </span>
            <span className="ic-bnav-label">{it.label}</span>
          </a>
        );
      })}
    </nav>
  );
}

export interface Crumb { label: string; href?: string }
export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav className={cx("ic-crumbs", className)} aria-label="Breadcrumb">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <Fragment key={i}>
            {last ? <span aria-current="page" className="ic-crumb-current">{it.label}</span> : <a href={it.href ?? "#"} className="ic-crumb">{it.label}</a>}
            {!last && <Icon name="right" size={14} />}
          </Fragment>
        );
      })}
    </nav>
  );
}

export interface TopbarProps {
  title?: ReactNode; breadcrumb?: Crumb[]; unread?: number; user?: { name: string; role?: string; avatar?: string };
  search?: boolean; searchPlaceholder?: string; onMenu?: () => void; onBell?: () => void; actions?: ReactNode; className?: string;
}
export function Topbar({ title, breadcrumb, unread, user, search = true, searchPlaceholder = "Tìm học viên, bài tập…", onMenu, onBell, actions, className }: TopbarProps) {
  return (
    <header className={cx("ic-topbar", className)}>
      <button type="button" className="ic-iconbtn ic-topbar-menu" aria-label="Mở menu" onClick={onMenu}><Icon name="menu" /></button>
      <div className="ic-topbar-title">
        {breadcrumb && <Breadcrumb items={breadcrumb} />}
        {title && <h1>{title}</h1>}
      </div>
      <div className="ic-topbar-tools">
        {search && <SearchInput placeholder={searchPlaceholder} />}
        {actions}
        <button type="button" className="ic-iconbtn" aria-label={`Thông báo${unread ? ` (${unread} chưa đọc)` : ""}`} onClick={onBell}>
          <Icon name="bell" />
          {unread ? <span className="ic-iconbtn-count">{unread > 9 ? "9+" : unread}</span> : null}
        </button>
        {user && (
          <div className="ic-topbar-user">
            <Avatar name={user.name} src={user.avatar} size={32} />
            <div><div className="ic-topbar-name">{user.name}</div>{user.role && <div className="ic-topbar-role">{user.role}</div>}</div>
          </div>
        )}
      </div>
    </header>
  );
}

export interface PaginationProps { total: number; pageSize?: number; page?: number; defaultPage?: number; onChange?: (page: number) => void; unit?: string; className?: string }
export function Pagination({ total, pageSize = 25, page, defaultPage = 1, onChange, unit = "học viên", className }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const [cur, set] = useControllable(page, defaultPage, onChange);
  const go = (n: number) => set(Math.max(1, Math.min(pages, n)));
  const list: (number | "…")[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - cur) <= 1) list.push(i);
    else if (list[list.length - 1] !== "…") list.push("…");
  }
  const from = total === 0 ? 0 : (cur - 1) * pageSize + 1;
  const to = Math.min(total, cur * pageSize);
  return (
    <div className={cx("ic-pager", className)}>
      <span className="ic-pager-info">{from}–{to} / {total} {unit}</span>
      <div className="ic-pager-pages">
        <button type="button" className="ic-pg" disabled={cur === 1} onClick={() => go(cur - 1)} aria-label="Trang trước"><Icon name="left" size={16} /></button>
        {list.map((n, k) => n === "…"
          ? <span key={`e${k}`} className="ic-pg-gap">…</span>
          : <button key={n} type="button" className={cx("ic-pg", n === cur && "ic-pg-on")} aria-current={n === cur ? "page" : undefined} onClick={() => go(n)}>{n}</button>)}
        <button type="button" className="ic-pg" disabled={cur === pages} onClick={() => go(cur + 1)} aria-label="Trang sau"><Icon name="right" size={16} /></button>
      </div>
    </div>
  );
}
