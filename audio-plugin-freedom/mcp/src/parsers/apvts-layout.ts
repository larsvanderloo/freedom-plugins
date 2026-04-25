// Heuristic parser for AudioProcessorValueTreeState parameter layouts.
// Recognises the common JUCE 7+ patterns for parameter construction.

export type ApvtsParamType =
  | "float"
  | "int"
  | "bool"
  | "choice"
  | "unknown";

export interface ApvtsParameter {
  id: string;
  name: string | null;
  type: ApvtsParamType;
  min: number | null;
  max: number | null;
  defaultValue: number | string | boolean | null;
  defaultIndex: number | null;     // for choice
  choices: string[] | null;        // for choice
  sourceLine: number;              // 1-indexed
  raw: string;                     // raw source text matched
}

interface PatternConfig {
  type: ApvtsParamType;
  re: RegExp;
  parse: (m: RegExpExecArray) => Partial<ApvtsParameter>;
}

// Patterns are intentionally permissive; we extract what we can and leave
// what we can't to "unknown".

const PATTERNS: PatternConfig[] = [
  // AudioParameterFloat with 5 args (id, name, min, max, default)
  {
    type: "float",
    re: /AudioParameterFloat\s*>\s*\(\s*(?:juce::ParameterID\s*\{\s*)?"([^"]+)"(?:\s*,\s*\d+\s*\})?\s*,\s*"([^"]*)"\s*,\s*(-?\d*\.?\d+)[fFlLuU]*\s*,\s*(-?\d*\.?\d+)[fFlLuU]*\s*,\s*(-?\d*\.?\d+)[fFlLuU]*/,
    parse: (m) => ({
      id: m[1],
      name: m[2],
      min: parseFloat(m[3]),
      max: parseFloat(m[4]),
      defaultValue: parseFloat(m[5]),
    }),
  },
  // AudioParameterFloat with NormalisableRange
  {
    type: "float",
    re: /AudioParameterFloat\s*>\s*\(\s*(?:juce::ParameterID\s*\{\s*)?"([^"]+)"(?:\s*,\s*\d+\s*\})?\s*,\s*"([^"]*)"\s*,\s*juce::NormalisableRange<[^>]+>\s*\(\s*(-?\d*\.?\d+)[fFlLuU]*\s*,\s*(-?\d*\.?\d+)[fFlLuU]*[^)]*\)\s*,\s*(-?\d*\.?\d+)[fFlLuU]*/,
    parse: (m) => ({
      id: m[1],
      name: m[2],
      min: parseFloat(m[3]),
      max: parseFloat(m[4]),
      defaultValue: parseFloat(m[5]),
    }),
  },
  // AudioParameterInt
  {
    type: "int",
    re: /AudioParameterInt\s*>\s*\(\s*(?:juce::ParameterID\s*\{\s*)?"([^"]+)"(?:\s*,\s*\d+\s*\})?\s*,\s*"([^"]*)"\s*,\s*(-?\d+)\s*,\s*(-?\d+)\s*,\s*(-?\d+)/,
    parse: (m) => ({
      id: m[1],
      name: m[2],
      min: parseInt(m[3], 10),
      max: parseInt(m[4], 10),
      defaultValue: parseInt(m[5], 10),
    }),
  },
  // AudioParameterBool
  {
    type: "bool",
    re: /AudioParameterBool\s*>\s*\(\s*(?:juce::ParameterID\s*\{\s*)?"([^"]+)"(?:\s*,\s*\d+\s*\})?\s*,\s*"([^"]*)"\s*,\s*(true|false)/,
    parse: (m) => ({
      id: m[1],
      name: m[2],
      defaultValue: m[3] === "true",
    }),
  },
  // AudioParameterChoice
  {
    type: "choice",
    re: /AudioParameterChoice\s*>\s*\(\s*(?:juce::ParameterID\s*\{\s*)?"([^"]+)"(?:\s*,\s*\d+\s*\})?\s*,\s*"([^"]*)"\s*,\s*(?:juce::)?StringArray\s*\{\s*([^}]+)\}\s*,\s*(\d+)/,
    parse: (m) => {
      const choices = m[3]
        .split(",")
        .map((s) => s.trim().replace(/^"|"$/g, ""))
        .filter(Boolean);
      return {
        id: m[1],
        name: m[2],
        choices,
        defaultIndex: parseInt(m[4], 10),
      };
    },
  },
];

export function extractApvtsParameters(content: string): ApvtsParameter[] {
  const out: ApvtsParameter[] = [];
  const lines = content.split(/\r?\n/);

  // Match across joined lines too (parameters are often multi-line).
  // We do two passes: per-line first (catches single-line decls), then
  // joined-blocks for multi-line decls.

  // Pass 1: per-line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pattern of PATTERNS) {
      const m = pattern.re.exec(line);
      if (m) {
        const partial = pattern.parse(m);
        out.push({
          id: partial.id ?? "",
          name: partial.name ?? null,
          type: pattern.type,
          min: partial.min ?? null,
          max: partial.max ?? null,
          defaultValue: partial.defaultValue ?? null,
          defaultIndex: partial.defaultIndex ?? null,
          choices: partial.choices ?? null,
          sourceLine: i + 1,
          raw: line.trim(),
        });
      }
    }
  }

  // Pass 2: joined-block scan for multi-line parameter declarations.
  // For lines starting an AudioParameter* declaration that did not match in
  // pass 1, concatenate forward until paren depth returns to zero (the
  // matching close of `make_unique<...>(...)`). This avoids accidentally
  // concatenating sibling parameter declarations into one match.
  for (let i = 0; i < lines.length; i++) {
    if (!/AudioParameter(Float|Int|Bool|Choice)/.test(lines[i])) continue;
    // Skip if pass 1 already matched at this start line
    if (out.some((p) => p.sourceLine === i + 1)) continue;

    // Walk paren depth from this line until balanced
    let combined = "";
    let depth = 0;
    let started = false;
    let endLine = i;
    for (let j = i; j < Math.min(i + 12, lines.length); j++) {
      const seg = lines[j];
      combined += (combined ? " " : "") + seg.trim();
      endLine = j;
      for (const ch of seg) {
        if (ch === "(") {
          depth++;
          started = true;
        } else if (ch === ")") {
          depth--;
        }
      }
      if (started && depth === 0) break;
    }

    for (const pattern of PATTERNS) {
      const m = pattern.re.exec(combined);
      if (m) {
        const partial = pattern.parse(m);
        out.push({
          id: partial.id ?? "",
          name: partial.name ?? null,
          type: pattern.type,
          min: partial.min ?? null,
          max: partial.max ?? null,
          defaultValue: partial.defaultValue ?? null,
          defaultIndex: partial.defaultIndex ?? null,
          choices: partial.choices ?? null,
          sourceLine: i + 1,
          raw: combined.trim().slice(0, 200),
        });
        break;
      }
    }
    i = endLine;
  }

  return out;
}
