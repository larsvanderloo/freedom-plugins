# Case study — ods-engine v0.20.5 → v0.20.8

This is a real session arc that demonstrates every skill and hook in the session-discipline plugin working together. It's the source material the plugin was extracted from.

**Project:** [ods-engine](https://github.com/larsvanderloo/ods-engine) — a C++17 static library modelling a Dumble ODS #124 tube amp, plus a JUCE plugin wrapper.

**Arc duration:** 3 sessions across 2 calendar days (2026-04-22 → 2026-04-23).

**Headline result:** Found and fixed a non-trivial numerical bug in an 8×8 hand-coded Newton-Raphson solver that had shipped in production for one release cycle, while maintaining a clean noise floor, schematic-accurate DC operating point, and a 9%-faster CPU budget than the previous workaround.

## Session 1 (late night, 2026-04-22): ship the feature

**User report (functional framing):** "Volume knob should give tonal character. It's currently acting as a level control. A real Dumble has saturation onset around Vol=0.6-0.9."

Followed investigation discipline:

1. **`/orchestrate`** proposed: measure what's happening before fixing.
2. **Agent dispatch** (`Explore`) traced the Volume parameter from APVTS → engine → CleanPreamp → V1b grid.
3. **Measured V1B operating point**: plate at 230 V (spec: 120-140 V). Tube was cold-biased — no headroom for saturation.
4. **Fix**: added a new B+5 rail via 150 kΩ decoupling resistor per schematic. Plate drops into spec range. Volume character returns.
5. **Shipped as v0.20.5**: CHANGELOG entry with measurement table.

Within an hour of install, the user came back: **"there's a weird noise / low-quality artifact"** in the new version.

## Session 2 (same night, 2026-04-22): the rollback

6. **`/orchestrate`** proposed: investigate ASAP; do not leave broken plugin installed.
7. **Measurement** confirmed: 30-80 dB broadband HF noise floor regression in v0.20.5 vs v0.20.4.
8. **Triage:** investigation requires ≥1 session, user's plugin is broken now. **Decision: rollback.**
9. **`rollback-release` skill**: plugin v0.20.6 ships, re-pinned to engine v0.20.4. CHANGELOG explicitly labelled `ROLLBACK:`. User gets clean plugin back.
10. **`handoff-doc` skill**: `HANDOFF-v0.20.5-clean-preamp-noise.md` written with:
    - TL;DR (3 sentences)
    - Git state verification commands
    - Exact repro command (process_wav with specific args)
    - Measurement table (baseline / broken, 5 metrics each)
    - Five hypotheses H1-H5, cost-ordered (5 min → 1 day)
    - Step-by-step recipe
    - Success criteria for v0.20.7
    - Artefact index (13 files in `/tmp/v205-artifact/`)
    - Out-of-scope list (don't untag v0.20.5 — it's the reproducer)
11. **`backlog` skill**: FEAT-7 added to `BACKLOG.md` noting the user-flagged Volume saturation gap with success criteria for a future complete fix.

## Session 3 (next morning, 2026-04-23): workaround

12. **`/orchestrate`** read the handoff. Decided: full root-cause investigation is a 1-2 day arc; user wants working Volume character now. Propose Option X (cathode sinks at 315 V rail, analogous to v0.20.4 PI fix).
13. **Direct implementation** — analogous to a known-good pattern, confidence high. Tuned sinks iteratively (r1 → r2 → r3) with measurement feedback.
14. **v0.20.7 ships**: CHANGELOG entry, measurement table. Cathode sinks give schematic-close V_plate (151 V vs target 120-140 V) and dramatically improve max/noon THD ratio (6.3× → 17.8×, better than v0.20.5's 13.5×).
15. **BACKLOG FEAT-7 stays open** — this is a workaround, not root cause. Handoff doc stays live.

## Session 4 (later same day): root cause

User says **"lets set this up"** — meaning investigate the noise properly.

16. **`investigation-branch` skill**: branched `investigate/clean-preamp-noise`, installed v0.20.5 failing state as first commit, verified repro matches handoff numbers exactly.
17. **Cost-ordered hypothesis testing:**
    - **H1** (Schur-reduced NR): tested in 5 min by toggling the Schur mode flag — **rejected** (identical noise).
    - **H3** (ToneStack SSR B+-dependence): tested by grep (0 cost) — **rejected** (ToneStack has no B+ reference).
    - **H4** (warmup insufficient): 5-min test bumping warmup 30000 → 300000 — **rejected** (identical noise).
    - **H5** (solver precision): instrumented `hc7_solveTimestep` with per-sample `(iter, updateNorm)` dump via env var. **Confirmed root cause.**
18. **Bonus finding during H5**: `process_wav`'s `nr_cap` argument never reached the HC solver — it was setting `setMaxIterations` on the generic MNA section, not `syncNRParams` on the HC solver's `hcMaxIter_`. The v0.20.5-era "NR_CAP=100 doesn't help" conclusion (captured in the handoff) was **wrong**, caused by this plumbing gap. Once cap=100 actually propagated to the HC solver, the convergence issue was diagnosable in minutes.
19. **The actual bug**: NR oscillates rather than converges when V1 is in its hot-bias region (full-step Newton over-shoots). With cap=10 the iteration exits with residual ~0.26 V — producing the 30-80 dB noise.
20. **Fix**: damp the NR update by 0.5 (`v[i] += 0.5 * rhs_lu[i]`), bump NR_CAP_RT to 100, tighten tolerances. 4 lines of real code.
21. **Verification**: noise floor returns to within 4 dB of v0.20.4 baseline at the schematic-correct rail. V1B plate at 146 V (spec 120-140). I_p at 0.49 mA (spec 0.5-0.7). 23/23 ctest pass. CPU 9% FASTER than v0.20.7 (damping gives smoother convergence trajectory).
22. **Merge back**: `git merge --no-ff investigate/clean-preamp-noise` preserves the investigation arc in `git log --graph`.
23. **v0.20.8 ships**: CHANGELOG entry includes full investigation timeline (H1/H3/H4 rejected, H5 confirmed, plus the `nr_cap` plumbing discovery).
24. **FEAT-7 closed**: BACKLOG entry marked `CLOSED in v0.20.8 (2026-04-23)` with the success criteria hit and original context preserved.
25. **Plugin v0.20.8 shipped**: re-pinned to engine v0.20.8, auval PASS, user's Logic installation now has the real fix.

## What the plugin encoded, line by line

| Pattern | Skill that encodes it |
|---|---|
| Reading project state before proposing | `orchestrate` |
| Never shipping without a measurement table | `changelog-discipline` |
| Rolling back as a numbered release, not a revert | `rollback-release` |
| Writing a handoff before ending a broken session | `handoff-doc` |
| Preserving the failing-state tag as a reproducer | `investigation-branch` + `rollback-release` |
| Cost-ordered hypothesis testing | `investigation-branch` |
| Filing FEAT items with concrete success criteria | `backlog` |
| `--no-ff` merge to keep the investigation arc visible | `investigation-branch` |
| User A/B verdict > Claude's opinion | `ab-audition` |
| Framing "weird noise" as measurable HF regression | `orchestrate` style rules (functional framing) |
| Subagents forbidden from commits / tags | `agent-git-boundary` hook |
| Version-sync check on tag creation | `version-bump-sync` hook |

Every single one of these came out of this arc. None of them are audio-specific.

## The meta-takeaway

A session like this isn't "Claude did the work". It's a human + Claude + a set of habits working together to turn "there's a weird noise" into a measurable regression into a confirmed root cause into a shipped fix. The habits are portable. The plugin bottles them.
