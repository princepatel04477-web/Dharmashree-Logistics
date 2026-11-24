"use client";

import { useSyncExternalStore } from "react";

type TokenUse = "text" | "large" | "decorative" | "surface";

interface TokenSpec {
  name: string;
  use: TokenUse;
  criterion: string;
}

interface ResolvedToken {
  value: string;
  ratio: number | null;
}

const TOKENS: TokenSpec[] = [
  { name: "--paper", use: "surface", criterion: "background" },
  { name: "--paper-2", use: "surface", criterion: "background" },
  { name: "--paper-3", use: "surface", criterion: "background" },
  { name: "--ink", use: "text", criterion: "AA text ≥ 4.5" },
  { name: "--ink-2", use: "text", criterion: "AA text ≥ 4.5" },
  { name: "--muted", use: "text", criterion: "AA text ≥ 4.5" },
  { name: "--line", use: "decorative", criterion: "non-text" },
  { name: "--line-strong", use: "decorative", criterion: "non-text" },
  { name: "--brand", use: "text", criterion: "AA text ≥ 4.5" },
  { name: "--brand-deep", use: "text", criterion: "AA text ≥ 4.5" },
  { name: "--brand-tint", use: "surface", criterion: "background" },
  { name: "--signal-red", use: "decorative", criterion: "small marks only, never text" },
  { name: "--highway", use: "decorative", criterion: "highlights only, text on it is --ink" },
];

interface Rgb {
  r: number;
  g: number;
  b: number;
  a: number;
}

function parseColor(raw: string): Rgb | null {
  const value = raw.trim().toLowerCase();
  const hexMatch = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(value);
  if (hexMatch !== null) {
    const hex = hexMatch[1] ?? "";
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    return {
      r: parseInt(full.slice(0, 2), 16),
      g: parseInt(full.slice(2, 4), 16),
      b: parseInt(full.slice(4, 6), 16),
      a: 1,
    };
  }
  const rgbMatch = /^rgba?\(([^)]+)\)$/.exec(value);
  if (rgbMatch !== null) {
    const parts = (rgbMatch[1] ?? "").split(",").map((p) => p.trim());
    const r = Number(parts[0]);
    const g = Number(parts[1]);
    const b = Number(parts[2]);
    const a = parts.length > 3 ? Number(parts[3]) : 1;
    if ([r, g, b, a].every((n) => Number.isFinite(n))) return { r, g, b, a };
  }
  return null;
}

function channelLuminance(srgb: number): number {
  const s = srgb / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance(c: Rgb): number {
  return (
    0.2126 * channelLuminance(c.r) + 0.7152 * channelLuminance(c.g) + 0.0722 * channelLuminance(c.b)
  );
}

function compositeOver(fg: Rgb, bg: Rgb): Rgb {
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function verdict(use: TokenUse, ratio: number | null): string {
  if (ratio === null) return "unresolved";
  if (use === "text") return ratio >= 4.5 ? "pass" : "fail";
  if (use === "large") return ratio >= 3 ? "pass" : "fail";
  return "info";
}

const EMPTY: Record<string, ResolvedToken> = {};

function resolveTokens(): Record<string, ResolvedToken> {
  const styles = getComputedStyle(document.documentElement);
  const paper = parseColor(styles.getPropertyValue("--paper")) ?? {
    r: 252,
    g: 251,
    b: 247,
    a: 1,
  };
  const next: Record<string, ResolvedToken> = {};
  for (const token of TOKENS) {
    const raw = styles.getPropertyValue(token.name).trim();
    const parsed = parseColor(raw);
    next[token.name] = {
      value: raw === "" ? "unresolved" : raw,
      ratio: parsed === null ? null : contrastRatio(compositeOver(parsed, paper), paper),
    };
  }
  return next;
}

let snapshotCache: Record<string, ResolvedToken> | null = null;

function subscribe(): () => void {
  return () => {};
}

function getSnapshot(): Record<string, ResolvedToken> {
  if (snapshotCache === null) snapshotCache = resolveTokens();
  return snapshotCache;
}

function getServerSnapshot(): Record<string, ResolvedToken> {
  return EMPTY;
}

export function TokenGrid() {
  const resolved = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div className="border-line bg-line grid grid-cols-1 gap-px border sm:grid-cols-2 lg:grid-cols-3">
      {TOKENS.map((token) => {
        const entry = resolved[token.name];
        const ratio = entry?.ratio ?? null;
        const state = verdict(token.use, ratio);
        return (
          <div key={token.name} className="bg-paper-2 space-y-3 p-6">
            <div
              aria-hidden="true"
              className="border-line h-16 w-full border"
              style={{ backgroundColor: `var(${token.name})` }}
            />
            <p className="text-ink font-mono text-xs">{token.name}</p>
            <p className="text-muted font-mono text-xs">{entry?.value ?? "resolving…"}</p>
            <p className="text-ink-2 font-mono text-[11px]">
              {ratio === null ? "ratio vs paper: —" : `ratio vs paper: ${ratio.toFixed(2)}`}
              <span className="text-muted"> · {token.criterion}</span>
            </p>
            <p
              className={
                state === "pass"
                  ? "label-caps text-brand"
                  : state === "fail"
                    ? "label-caps text-brand"
                    : "label-caps"
              }
            >
              {state === "pass" ? "Pass" : state === "fail" ? "Fail" : "Reference"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
