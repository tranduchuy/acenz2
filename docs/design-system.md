# ACENZ — Design system & UI packages

Tài liệu này mô tả cách monorepo tổ chức phần giao diện, cách setup, và **phải làm gì khi design thay đổi**.

- Design system (bản thiết kế): https://claude.ai/code/artifact/16fafd4f-416e-4edf-9823-e724050abd6d
- Code: `packages/tokens`, `packages/core`, `packages/ui` trong repo này

---

## 1. Tổng quan

```
apps/
  web/          React + Vite + Tailwind v4 — dùng @acenz/ui
  api/          Express — không liên quan UI
packages/
  tokens/       @acenz/tokens — màu, font, spacing, radius, shadow, breakpoint (nguồn: tokens.json)
  core/         @acenz/core  — logic + types thuần TS (band, trạng thái bài tập, ngày, đếm từ)
  ui/           @acenz/ui    — 42 React component (web)
  shared/       @acenz/shared — Zod DTO dùng chung web ↔ api
  tsconfig/     preset tsconfig
```

Luồng phụ thuộc:

```
tokens.json ──► @acenz/tokens ──► tokens.css + tailwind.css (web)
                              └──► object TS (React Native sau này)
@acenz/core ───────────────────► @acenz/ui ──► apps/web
                                            └─► (sau này) @acenz/ui-native ──► apps/mobile
```

| Package | Dùng chung web ↔ mobile? |
|---|---|
| `@acenz/tokens` | Có — cùng một `tokens.json` |
| `@acenz/core` | Có — không dính DOM |
| `@acenz/ui` | Không — chỉ web (HTML + Tailwind). Mobile sẽ có `@acenz/ui-native` cùng tên component và props |

---

## 2. Setup lần đầu

Yêu cầu: Node 24+, pnpm, Docker (Postgres).

```bash
cp .env.example .env
docker compose up -d db
pnpm install
pnpm build      # build tokens → core → ui → apps theo thứ tự (turbo)
pnpm dev
```

`pnpm dev` chạy tsup watch cho các package và Vite cho web. Sửa file trong `packages/ui/src` → web tự reload.

### Tailwind trong `apps/web`

`apps/web/src/index.css`:

```css
@import "tailwindcss";
@import "@acenz/tokens/tailwind.css";   /* token ACENZ thành theme Tailwind */
@import "@acenz/ui/styles.css";         /* CSS component chưa chuyển sang utility */
@source "../../../packages/ui/src";     /* để Tailwind quét class trong ui */
```

Tailwind **chỉ biên dịch ở app** (plugin `@tailwindcss/vite`). `@acenz/ui` viết class Tailwind trong TSX nhưng không tự build CSS — app nào dùng ui phải có Tailwind và dòng `@source` ở trên.

### Theme tối

Đặt `data-theme="dark"` trên `<html>`. Mọi màu token tự đổi; biến thể `dark:` cũng theo thuộc tính này.

### Storybook

Storybook liệt kê các component của `@acenz/ui` và cho chỉnh props trực tiếp (bảng **Controls**), không cần chạy `apps/web`.

```bash
pnpm storybook         # dev server http://localhost:6006 — turbo build tokens + core trước
pnpm build-storybook   # site tĩnh ở packages/ui/storybook-static
```

Chạy từ thư mục gốc. `pnpm --filter @acenz/ui storybook` cũng được, nhưng chỉ khi `tokens` và `core` đã build.

- Preview dùng cùng CSS với app (`.storybook/preview.css`) và cùng font (`.storybook/preview-head.html`).
- Nút **Theme** trên toolbar đổi `data-theme` giữa `light` và `dark`.

Thêm story cho một component:

1. Tạo `<Component>.stories.tsx` cạnh file định nghĩa component. Ví dụ mẫu: `packages/ui/src/Button.stories.tsx`.
2. `title` theo dạng `<Nhóm>/<Component>` (`Primitives/Button`, `Forms/TextField`).
3. Khai báo props mặc định trong `args` để Controls hiện ra; chữ mẫu tiếng Việt, câu ngắn.
4. Chỉ dùng token, không hard-code màu.

---

## 3. Dùng token trong code

Palette, type scale, radius, shadow, breakpoint mặc định của Tailwind **đã bị thay** bằng token ACENZ — `bg-blue-500`, `text-lg`… sẽ không có.

| Viết | Ý nghĩa |
|---|---|
| `bg-surface` `bg-surface-raised` `bg-surface-sunken` | nền trang / card / sidebar, header bảng |
| `text-ink` `text-ink-muted` `border-line` `border-line-strong` | chữ chính / phụ / viền |
| `bg-brand text-on-brand hover:bg-brand-hover` | hành động chính (1 nút primary mỗi màn) |
| `bg-brand-soft text-brand-ink` | trạng thái được chọn |
| `bg-accent text-on-accent` | band điểm (pastel peach) — chỉ dùng cho điểm/thành tích |
| `bg-success-soft text-success` (warning, danger, info tương tự) | trạng thái — luôn kèm icon + chữ |
| `bg-skill-writing-soft text-skill-writing` | tag theo kỹ năng IELTS |
| `p-4` = 16px, `gap-6` = 24px | spacing bước 4px (khớp `space-*`) |
| `rounded-sm/md/lg/full` | 6 / 10 / 16 / 999px |
| `text-h1` `text-h2` `text-h3` `text-body` `text-body-sm` `text-label` `text-caption` `text-score` | kiểu chữ (size + line-height + weight) |
| `sm:` `md:` `lg:` `xl:` | 480 / 768 / 1024 / 1280px |
| `pointer-coarse:` | màn cảm ứng (tăng vùng chạm lên 44px) |

Quy tắc:

- **Không hard-code mã màu** (`#d01723`, `text-[#…]`). Thiếu màu → thêm token (mục 5).
- Logic nghiệp vụ (làm tròn band, trạng thái bài tập, format ngày) lấy từ `@acenz/core`, không viết lại trong component hay app.
- Ghép class bằng `cx()` của `@acenz/ui` (có `tailwind-merge`): `className` truyền vào sẽ **ghi đè** class mặc định, không cộng dồn.

```tsx
import { Button, cx } from "@acenz/ui";
<Button variant="primary" className="w-full md:w-auto">Nộp bài</Button>
```

---

## 4. Trạng thái chuyển component sang Tailwind

Component đang chuyển dần từ CSS `ic-*` (`packages/ui/src/styles.css`) sang utility trong TSX. Trong lúc chuyển, cả hai cùng chạy; CSS cũ nằm trong `@layer components` nên utility luôn thắng.

| Nhóm | Component | Trạng thái |
|---|---|---|
| 1 · Primitives | Button, Badge, StatusBadge, SkillTag, BandScore, Avatar, ProgressBar, Tabs | ✅ Tailwind |
| 2 · Forms | TextField, PasswordField, SearchInput, Select, Checkbox, Radio, Switch, DatePicker, SubmissionUpload | ✅ Tailwind (`src/forms/`) |
| 3 · Feedback | Dialog, Toast, Banner, Tooltip, EmptyState, Skeleton | ⏳ |
| 4 · Layout | AppShell, Sidebar, Topbar, BottomNav, Breadcrumb, Pagination | ⏳ |
| 5 · Data | StatCard, ClassCard, AssignmentItem, RosterTable, NotificationItem, SkillBreakdown, BandTrendChart | ⏳ |
| 6 · IELTS | CountdownTimer, ScheduleCalendar, AttendanceToggle, GradingPanel, FeedbackComment, AudioPlayer, AudioRecorder, AnnouncementComposer | ⏳ |

Còn giữ tạm trong `styles.css` vì component nhóm khác đang dùng — xoá khi nhóm đó chuyển xong:

| Rule | Ai còn dùng | Xoá ở |
|---|---|---|
| `.ic-iconbtn*` | Topbar (layout), Toast/Dialog (feedback) | nhóm 3, 4 |
| `.ic-input`, `.ic-select*` | ô chọn điểm trong GradingPanel (ielts) | nhóm 6 |

Quy ước cho nhóm đã chuyển: mỗi component một file `.tsx` trong thư mục `packages/ui/src/<nhóm>/`, viết bằng function component; `index.ts` của thư mục export lại, `src/index.ts` giữ nguyên `export * from "./<nhóm>"`. Helper dùng chung trong nhóm (class dùng lại, `FieldFoot`…) nằm cạnh, không export ra ngoài package.

Khi chuyển một component:

1. Viết lại class trong `.tsx` bằng utility + token (giữ nguyên props và hành vi).
2. Xoá các rule `.ic-<tên>` tương ứng trong `styles.css`. Giữ lại rule nào component khác còn dùng (ví dụ `.ic-skill-*`, `.ic-input`).
3. Responsive bằng container query vẫn để trong CSS (AppShell, Topbar, RosterTable) cho tới khi chuyển nhóm Layout — dùng `@container` của Tailwind (`@container`, `@md:`…).
4. `pnpm typecheck` + mở web kiểm tra cả theme sáng và tối.
5. Cập nhật bảng trên.

---

## 5. Khi design thay đổi — làm gì?

Nguyên tắc: **một nguồn sự thật cho mỗi thứ**, và mọi thay đổi đi qua PR.

| Thứ | Nguồn sự thật |
|---|---|
| Màu, font, spacing, radius, shadow, breakpoint | `packages/tokens/src/tokens.json` |
| Component (giao diện + hành vi) | `packages/ui/src/**/*.tsx` |
| Logic nghiệp vụ dùng chung | `packages/core/src` |
| Quy tắc dùng (khi nào dùng gì, giọng văn) | README của design system |

### Giai đoạn hiện tại — design system đi trước

Đang thiết kế màn hình bằng Claude Design, design system còn thay đổi nhiều.

**A. Đổi token (ví dụ màu brand, cỡ chữ, radius)**

1. Sửa trên design system (hoặc nhờ Claude sửa).
2. Copy `project/tokens.json` của design system → `packages/tokens/src/tokens.json`.
3. `pnpm --filter @acenz/tokens build` (sinh lại `tokens.css` và `tailwind.css`).
4. Kiểm tra web cả 2 theme; xem lại độ tương phản nếu đổi màu chữ/nền (tối thiểu 4.5:1).
5. Mở PR: `chore(tokens): …` — ghi rõ token nào đổi, giá trị cũ → mới.

> Đổi **tên** token (không chỉ giá trị) là breaking change: tìm và thay mọi utility đang dùng tên cũ (`grep -r "bg-tên-cũ" apps packages`) trong cùng PR.

**B. Đổi giao diện một component**

1. Sửa trên design system để chốt thiết kế.
2. Sửa `packages/ui/src/<nhóm>/<Component>.tsx` cho khớp (dev). Nhóm chưa chuyển vẫn là một file `<nhóm>.tsx`.
3. Nếu thêm/bỏ prop: cập nhật types và mọi chỗ dùng trong `apps/web`.
4. PR: `feat(ui): …` / `fix(ui): …`, kèm ảnh trước/sau.

**C. Thêm component mới**

1. Thiết kế + viết guideline trên design system.
2. Tạo `<Component>.tsx` (một component một file) trong thư mục nhóm phù hợp của `packages/ui/src`, export ở `index.ts` của nhóm, viết bằng Tailwind + token ngay từ đầu.
3. Logic dùng chung (nếu có) đặt ở `@acenz/core`.
4. PR `feat(ui): add <Tên>`.

**D. Màn hình (page) mới**

1. Thiết kế trên Claude Design, dùng design system ACENZ (để màn hình dùng đúng component).
2. Dev dựng page trong `apps/web` bằng `@acenz/ui` + utility cho layout. Không tạo lại component đã có.
3. Thiếu component → làm theo mục C trước.

### Giai đoạn sau — code đi trước (khi design system ổn định, bản 1.0)

Đảo chiều: **code là nguồn sự thật**, design system được sinh lại từ code.

1. Mọi thay đổi token/component làm trong `packages/*` trước, qua PR + QC.
2. Release: tăng version `@acenz/ui` / `@acenz/tokens` (semver), ghi `CHANGELOG.md`.
3. Đồng bộ design system từ code: trong Claude Code chạy `/design-sync` (trỏ vào `packages/ui`). Design system chuyển sang chỉ đọc — ai muốn đổi phải sửa code.
4. Tự động hoá: gắn bước sync vào CI khi tag release (ví dụ `ui-v1.2.0`).
5. Các canvas thiết kế đang dùng ACENZ: mở từng canvas, nhờ Claude "cập nhật design system ACENZ" để lấy bản mới.

Semver gợi ý:

| Thay đổi | Version |
|---|---|
| Sửa giá trị token, sửa style không đổi API | patch `1.0.x` |
| Thêm token, thêm component, thêm prop tuỳ chọn | minor `1.x.0` |
| Đổi tên/xoá token, đổi/xoá prop, đổi hành vi | major `x.0.0` |

---

## 6. Responsive

- Breakpoint: `sm` 480 · `md` 768 · `lg` 1024 · `xl` 1280.
- AppShell tự đổi theo chiều rộng của chính nó: sidebar đầy đủ ≥1024, thanh icon 768–1023, dưới 768 ẩn sidebar + hiện `BottomNav`.
- Màn hình học viên: thiết kế mobile-first. Màn hình giáo viên: desktop-first nhưng phải dùng được ở 360px.
- Lưới card: `grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4` — không cố định số cột.
- Vùng chạm tối thiểu 44px trên màn cảm ứng.

Chi tiết: section *Responsive* trong design system.

---

## 7. Khi có app mobile (React Native)

1. Tạo `apps/mobile` (Expo) và `packages/ui-native`.
2. Dùng lại `@acenz/tokens` (import object `colors`, `spacing`, `typography`…) và `@acenz/core` nguyên vẹn.
3. Viết lại component trong `ui-native` **cùng tên và props** với `@acenz/ui`, dùng `View`/`Text`/`StyleSheet` (hoặc NativeWind nếu muốn giữ cú pháp Tailwind).
4. Đổi token vẫn chỉ sửa một chỗ: `tokens.json`.

---

## 8. Checklist PR liên quan UI

- [ ] Không hard-code màu/cỡ chữ; chỉ dùng token
- [ ] Đúng cả theme sáng và tối
- [ ] Chữ trên nền đạt tương phản 4.5:1 (3:1 với chữ ≥24px, viền, icon)
- [ ] Trạng thái có icon + chữ, không chỉ màu
- [ ] Focus bàn phím thấy rõ (`focusRing`)
- [ ] Kiểm tra ở 375px và 1280px
- [ ] Copy tiếng Việt, câu ngắn, nút bắt đầu bằng động từ; band điểm 1 chữ số thập phân (`7.0`)
- [ ] `pnpm typecheck` và `pnpm test` pass
- [ ] Đổi token/API → ghi vào PR (và CHANGELOG khi đã versioning)
