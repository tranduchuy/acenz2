# @acenz/ui

React components of the ACENZ design system (42 components, class prefix `ic-`).
Built on `@acenz/tokens` (colors, type, spacing) and `@acenz/core` (band rounding, status, dates).

## Use in an app (Vite + Tailwind v4)

```css
/* src/index.css */
@import "tailwindcss";
@import "@acenz/tokens/tailwind.css";   /* tokens → Tailwind theme */
@import "@acenz/ui/styles.css";         /* components, in @layer components */
@source "../../../packages/ui/src";
```

```tsx
// main.tsx — once
import "./index.css";

// anywhere
import { AppShell, Sidebar, Topbar, Button, GradingPanel } from "@acenz/ui";
```

Dark theme: set `data-theme="dark"` on `<html>` — token utilities switch automatically; `dark:` targets the same attribute.

## Tailwind with ACENZ tokens

The default Tailwind palette, type scale, radii, shadows and breakpoints are replaced by ACENZ tokens:

| Tailwind | ACENZ |
|---|---|
| `bg-brand text-on-brand`, `bg-surface-raised`, `text-ink`, `text-ink-muted`, `border-line` | color tokens (light/dark via CSS variables) |
| `p-4` = 16px, `gap-6` = 24px | `space-*` (4px base, same numbers) |
| `rounded-sm/md/lg/full` | `radius-*` (6 / 10 / 16 / 999px) |
| `text-h1`, `text-body`, `text-body-sm`, `text-label`, `text-caption`, `text-score` | type styles (size + line height + weight) |
| `shadow-sm/md/lg` | `shadow-*` |
| `sm: md: lg: xl:` | 480 / 768 / 1024 / 1280px |

Use utilities for page layout; use components for UI parts. A `className` utility on a component overrides its default style.

## Source of truth

`src/styles.css` mirrors the design system's `components/bundle.css`; `@acenz/tokens/src/tokens.json` mirrors its `tokens.json`.
Change them here first, then re-sync the design system (`/design-sync` in Claude Code).
