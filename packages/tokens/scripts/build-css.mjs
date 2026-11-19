// Generates dist/tokens.css from src/tokens.json — same layout as the design system's tokens.css.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const t = JSON.parse(readFileSync(join(root, "src/tokens.json"), "utf8"));
const val = (v, th) => (typeof v === "string" ? v : (v[th] ?? v.light));
const out = [`/* ${t.name} — generated from tokens.json */`];

const block = (sel, th, onlyDiff) => {
  out.push(`${sel} {`);
  for (const fam of ["color", "shadow"]) {
    for (const x of t[fam]?.tokens ?? []) {
      const v = val(x.value, th);
      if (onlyDiff && v === val(x.value, "light")) continue;
      out.push(`  --${x.name}: ${v};`);
    }
  }
  out.push("}");
};
block(':root, [data-theme="light"]', "light", false);
block('[data-theme="dark"]', "dark", true);
out.push(":root {");
for (const fam of ["spacing", "radius", "breakpoint"]) for (const x of t[fam]?.tokens ?? []) out.push(`  --${x.name}: ${x.value};`);
for (const [k, v] of Object.entries(t.type.families)) out.push(`  --font-${k}: ${v};`);
out.push("}");
for (const g of t.type.groups) {
  for (const s of g.styles) {
    const p = [`font-family: var(--font-${s.family ?? g.family})`, `font-size: ${s.fontSize}`, `line-height: ${s.lineHeight}`, `font-weight: ${s.fontWeight}`];
    if (s.letterSpacing) p.push(`letter-spacing: ${s.letterSpacing}`);
    out.push(`.${s.name} { ${p.join("; ")}; }`);
  }
}
mkdirSync(join(root, "dist"), { recursive: true });
writeFileSync(join(root, "dist/tokens.css"), out.join("\n") + "\n");
console.log("tokens.css written");

// ---------- Tailwind v4 theme: dist/tailwind.css ----------
// Utilities read the same CSS variables as tokens.css, so light/dark switch at runtime via [data-theme].
const tw = [`/* ${t.name} — Tailwind v4 theme, generated from tokens.json. Import after "tailwindcss". */`, '@import "./tokens.css";', ""];
tw.push('@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));', "");
tw.push("@theme inline {", "  --color-*: initial;", "  --color-white: #ffffff;", "  --color-black: #000000;");
for (const c of t.color.tokens) tw.push(`  --color-${c.name}: var(--${c.name});`);
tw.push("}", "", "@theme {", "  --spacing: 4px;", "  --breakpoint-*: initial;");
for (const b of t.breakpoint?.tokens ?? []) tw.push(`  --breakpoint-${b.name.replace(/^bp-/, "")}: ${b.value};`);
tw.push("  --radius-*: initial;");
for (const r of t.radius.tokens) tw.push(`  --${r.name}: ${r.value};`);
for (const [k, v] of Object.entries(t.type.families)) tw.push(`  --font-${k}: ${v};`);
tw.push("  --shadow-*: initial;");
for (const s of t.shadow?.tokens ?? []) tw.push(`  --${s.name}: ${val(s.value, "light")};`);
tw.push("  --text-*: initial;");
for (const g of t.type.groups) {
  for (const s of g.styles) {
    tw.push(`  --text-${s.name}: ${s.fontSize};`, `  --text-${s.name}--line-height: ${s.lineHeight};`, `  --text-${s.name}--font-weight: ${s.fontWeight};`);
    if (s.letterSpacing) tw.push(`  --text-${s.name}--letter-spacing: ${s.letterSpacing};`);
  }
}
tw.push("}");
writeFileSync(join(root, "dist/tailwind.css"), tw.join("\n") + "\n");
console.log("tailwind.css written");
