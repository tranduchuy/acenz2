/**
 * ACENZ design tokens — platform-agnostic.
 * Source of truth: ./tokens.json (same file as the ACENZ design system artifact).
 * Web: import "@acenz/tokens/tokens.css" (CSS custom properties, light + dark).
 * React Native / JS: use the typed objects below.
 */
import raw from "./tokens.json";

type ThemeId = "light" | "dark";
type ColorValue = string | Partial<Record<ThemeId, string>>;
interface Token<V = string> { name: string; value: V; usage?: string }
interface TypeStyle { name: string; fontSize: string; lineHeight: string; fontWeight: number; letterSpacing?: string; usage?: string }
interface TokenFile {
  name: string;
  color: { themes: { id: ThemeId; name: string }[]; tokens: Token<ColorValue>[] };
  type: { families: Record<string, string>; groups: { name: string; family: string; styles: TypeStyle[] }[] };
  spacing: { tokens: Token[] };
  radius: { tokens: Token[] };
  shadow: { tokens: Token<ColorValue>[] };
  breakpoint: { tokens: Token[] };
}

const t = raw as unknown as TokenFile;

const pick = (v: ColorValue, theme: ThemeId): string =>
  typeof v === "string" ? v : (v[theme] ?? v.light ?? "");

const colorsFor = (theme: ThemeId): Record<string, string> =>
  Object.fromEntries(t.color.tokens.map((c) => [c.name, pick(c.value, theme)]));

const toNumber = (v: string): number => Number.parseFloat(v);

/** Colors per theme, keyed by token name: colors.light.brand → "#d01723". */
export const colors = { light: colorsFor("light"), dark: colorsFor("dark") } as const;

/** Spacing in px numbers: spacing["space-4"] → 16. */
export const spacing: Record<string, number> = Object.fromEntries(t.spacing.tokens.map((s) => [s.name, toNumber(s.value)]));

/** Radius in px numbers: radius["radius-md"] → 10. */
export const radius: Record<string, number> = Object.fromEntries(t.radius.tokens.map((r) => [r.name, toNumber(r.value)]));

/** Breakpoints in px numbers: breakpoints["bp-md"] → 768. */
export const breakpoints: Record<string, number> = Object.fromEntries(t.breakpoint.tokens.map((b) => [b.name, toNumber(b.value)]));

/** Type styles in px numbers, ready for React Native StyleSheet or JS styles. */
export const typography: Record<string, { fontFamily: string; fontSize: number; lineHeight: number; fontWeight: number; letterSpacing?: string }> =
  Object.fromEntries(
    t.type.groups.flatMap((g) =>
      g.styles.map((s) => [
        s.name,
        { fontFamily: g.family, fontSize: toNumber(s.fontSize), lineHeight: toNumber(s.lineHeight), fontWeight: s.fontWeight, letterSpacing: s.letterSpacing },
      ]),
    ),
  );

export const fontFamilies = t.type.families;

export type { ThemeId };
export const tokens = { name: t.name, colors, spacing, radius, breakpoints, typography, fontFamilies } as const;
export default tokens;
