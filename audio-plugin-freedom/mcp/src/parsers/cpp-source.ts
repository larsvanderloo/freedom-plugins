// Lightweight C++ parser for audio-plugin source files.
// Not a full parser — heuristic regex/brace tracker sufficient to:
//   - locate processBlock-like methods
//   - flag operations that are unsafe on the audio thread
//
// Limitations are documented per function. Heuristic, not authoritative.

export interface MethodBlock {
  name: string;            // e.g. "processBlock"
  startLine: number;       // 1-indexed line number of opening brace
  endLine: number;         // 1-indexed line number of closing brace
  body: string;            // body text between braces, exclusive
}

const PROCESS_METHOD_NAMES = [
  "processBlock",
  "processBlockBypassed",
  "process",
  "renderNextBlock",
  "processSamples",
  "processWrapped",
  "getNextAudioBlock",
];

/**
 * Find process-block-like method blocks. Heuristic — looks for
 * `<returnType> <ClassName>::<method>(...)` followed by `{ ... }`.
 *
 * Misses: in-line method definitions in headers (those are flagged
 * separately if scanned). Also misses lambdas — fine, they're not the
 * normal entry point for the audio thread.
 */
export function findProcessBlockMethods(content: string): MethodBlock[] {
  const out: MethodBlock[] = [];
  const lines = content.split(/\r?\n/);
  // Match: optional return type, then ClassName::methodName(arg-list)
  const sigRe = new RegExp(
    `\\b\\w[\\w:<>,\\s\\*\\&]*\\s+\\w+::(${PROCESS_METHOD_NAMES.join("|")})\\s*\\(`,
  );

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(sigRe);
    if (!m) continue;
    const methodName = m[1];
    // Find the opening `{` from this line forward (could be on same line or next)
    let braceStart = -1;
    for (let j = i; j < Math.min(i + 10, lines.length); j++) {
      const idx = lines[j].indexOf("{");
      if (idx >= 0) {
        braceStart = j;
        break;
      }
    }
    if (braceStart < 0) continue;
    // Walk braces until we find the matching close
    let depth = 0;
    let bodyStart = braceStart;
    let bodyEnd = -1;
    for (let j = braceStart; j < lines.length; j++) {
      for (const ch of lines[j]) {
        if (ch === "{") depth++;
        else if (ch === "}") {
          depth--;
          if (depth === 0) {
            bodyEnd = j;
            break;
          }
        }
      }
      if (bodyEnd >= 0) break;
    }
    if (bodyEnd < 0) continue;
    const body = lines.slice(bodyStart + 1, bodyEnd).join("\n");
    out.push({
      name: methodName,
      startLine: bodyStart + 1,
      endLine: bodyEnd + 1,
      body,
    });
    i = bodyEnd; // skip past this method
  }
  return out;
}

export type Severity = "blocker" | "major" | "minor";

export interface SafetyFinding {
  severity: Severity;
  kind: string;            // category, e.g. "allocation", "lock", "logging"
  line: number;            // 1-indexed line in the original file
  text: string;            // trimmed source line
  rationale: string;       // why this is unsafe on the audio thread
}

/**
 * Patterns are conservative — false positives are OK (better to flag for
 * human review than miss); false negatives are worse but unavoidable
 * without a real parser.
 *
 * Each pattern declares the audio-thread safety class:
 *   blocker — guaranteed to glitch / fail real-time (alloc, lock, IO)
 *   major   — likely to glitch under load (juce::String temp, throw, vector::push_back)
 *   minor   — worth a look (virtual call into base, std::function copy)
 */
const UNSAFE_PATTERNS: Array<{
  re: RegExp;
  kind: string;
  severity: Severity;
  rationale: string;
}> = [
  {
    re: /\bnew\s+(?!\(\s*[Rr]eal[Tt]ime)\w/,
    kind: "allocation",
    severity: "blocker",
    rationale: "Heap allocation on the audio thread — non-deterministic time, can take a lock in the allocator.",
  },
  {
    re: /\b(malloc|calloc|realloc|free)\s*\(/,
    kind: "allocation",
    severity: "blocker",
    rationale: "C heap operation on the audio thread.",
  },
  {
    re: /\bstd::(mutex|lock_guard|unique_lock|recursive_mutex|shared_mutex|shared_lock|condition_variable)\b/,
    kind: "lock",
    severity: "blocker",
    rationale: "Locking the audio thread can cause priority-inversion stalls and unbounded wait.",
  },
  {
    re: /\bjuce::(WaitableEvent|CriticalSection)\b/,
    kind: "lock",
    severity: "blocker",
    rationale: "JUCE synchronisation primitive on the audio thread.",
  },
  {
    re: /\b(std::cout|std::cerr|std::clog|printf|fprintf|puts|std::endl)\b/,
    kind: "logging",
    severity: "blocker",
    rationale: "Stdio is locked + buffered — never call from the audio thread.",
  },
  {
    re: /\bjuce::Logger::\w+\s*\(/,
    kind: "logging",
    severity: "blocker",
    rationale: "juce::Logger flushes to file / synchronises.",
  },
  {
    re: /\bDBG\s*\(/,
    kind: "logging",
    severity: "major",
    rationale: "DBG() expands to writeToLog in debug builds; safe in release but a real-time pitfall during dev runs.",
  },
  {
    re: /\bjuce::File\s*\(|\bfopen\s*\(|\bstd::(ifstream|ofstream|fstream)\b|\bopen\s*\(\s*"/,
    kind: "io",
    severity: "blocker",
    rationale: "File IO on the audio thread.",
  },
  {
    re: /\bjuce::String\s*\(\s*"/,
    kind: "string-alloc",
    severity: "major",
    rationale: "juce::String constructed from a literal allocates a ref-counted buffer.",
  },
  {
    re: /\bthrow\s+\w/,
    kind: "exception",
    severity: "blocker",
    rationale: "Throwing on the audio thread; exception-handling does heap work.",
  },
  {
    re: /\.(push_back|emplace_back|insert|resize|reserve|emplace)\s*\(/,
    kind: "container-grow",
    severity: "major",
    rationale: "May allocate if capacity is exceeded — pre-reserve at prepareToPlay.",
  },
  {
    re: /\bnew\s+std::function\b|std::function\s*<[^>]*>\s+\w+\s*=/,
    kind: "std-function",
    severity: "minor",
    rationale: "std::function may small-buffer-optimise but copying a non-trivial target allocates.",
  },
  {
    re: /\bdynamic_cast\s*</,
    kind: "rtti",
    severity: "minor",
    rationale: "RTTI lookup is bounded but adds latency variance; prefer static_cast where the type is known.",
  },
];

export function scanForUnsafeOps(
  body: string,
  bodyStartLine: number,
): SafetyFinding[] {
  const out: SafetyFinding[] = [];
  const lines = body.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comments — primitive but catches obvious cases
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) continue;
    for (const p of UNSAFE_PATTERNS) {
      if (p.re.test(line)) {
        out.push({
          severity: p.severity,
          kind: p.kind,
          line: bodyStartLine + i + 1, // body line + 1 because body begins after opening brace
          text: trimmed,
          rationale: p.rationale,
        });
      }
    }
  }
  return out;
}
