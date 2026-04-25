# marketing-team-freedom

**A virtual marketing team for Claude Code.** Six specialised agents (strategist, copywriter, hook-writer, brand-voice-guardian, channel-adapter, marketing-orchestrator) plus seven skills that treat marketing as a structured, versionable pipeline — positioning → brief → copy → voice-check → channel-adapt → publish → post-mortem.

Designed to layer on top of [`studio`](../studio-plugin/) for handoff docs, CHANGELOG continuity, and rollback-as-release. Works standalone or together.

## Why this exists

Marketing work Claude usually produces is a one-shot: "write me a tweet about X". That skips every real marketing-team habit — strategy, audience, voice consistency, proof, channel adaptation, post-mortem. Results feel generic and lose continuity between pieces.

This plugin encodes those habits as agents with explicit upstream/downstream dependencies. Every agent reads the strategy files (`POSITIONING.md`, `AUDIENCE.md`, `BRAND-VOICE.md`) as ground truth. Deliverables are Markdown files in a structured folder that you can git-track, revise, and review.

## Install

```bash
git clone https://github.com/larsvanderloo/marketing-team-freedom ~/plugins/marketing-team-freedom
claude --plugin-dir ~/plugins/marketing-team-freedom
```

Recommended: install alongside `studio` for the session-overlay discipline:

```bash
claude \
  --plugin-dir ~/plugins/studio \
  --plugin-dir ~/plugins/marketing-team-freedom
```

## Quick start — new brand

```
# In Claude Code, from a new or existing directory:
/marketing-team-freedom:brief
```

The orchestrator will detect that `POSITIONING.md` / `AUDIENCE.md` / `BRAND-VOICE.md` are missing and dispatch the **strategist** agent to interview you. After strategy files are committed, you can draft briefs and produce copy.

## Quick start — existing brand

If you already have a brand voice established (past customer-facing work you want Claude to match):

1. Write `BRAND-VOICE.md` by hand or via `strategist` using samples of past copy
2. Write `POSITIONING.md` + `AUDIENCE.md` by hand or via `strategist`
3. Commit them
4. Start briefing campaigns — all downstream agents now read your ground truth

## Project structure convention

```
your-marketing-project/
├── POSITIONING.md              # strategist-produced
├── AUDIENCE.md                 # strategist-produced
├── BRAND-VOICE.md              # strategist-produced
├── MESSAGING-HIERARCHY.md      # strategist-produced
├── CONTENT-CALENDAR.md         # maintained by /calendar
├── campaigns/
│   └── <campaign-slug>/
│       ├── brief.md            # /brief
│       ├── copy/
│       │   ├── email-invite.md      # /write → copywriter
│       │   ├── landing-hero.md
│       │   └── blog-announce.md
│       ├── hooks/
│       │   ├── email-subject-lines.md   # /hooks → hook-writer
│       │   └── landing-h1.md
│       └── adapted/
│           ├── twitter-thread.md   # /adapt → channel-adapter
│           ├── linkedin-post.md
│           └── reel-script.md
└── post-mortems/
    └── <campaign>-<YYYY-MM-DD>.md   # /post-mortem
```

## Agents

| Agent | Role |
|---|---|
| `strategist` | Produces upstream artefacts (POSITIONING, AUDIENCE, BRAND-VOICE, MESSAGING-HIERARCHY). Source of truth for everyone else. |
| `copywriter` | Long-form copy producer. Reads strategy, writes drafts for a specific channel from a brief. |
| `hook-writer` | Generates 8-15 labelled headline/subject-line/CTA options per brief, across archetypes (direct, curiosity, story, contrarian, number, question). |
| `brand-voice-guardian` | Non-destructive voice reviewer. Severity-labelled findings (BLOCKER/MAJOR/MINOR), proposed rewrites. |
| `channel-adapter` | Repurposes approved pieces across channels — voice invariant, format variant. |
| `marketing-orchestrator` | Campaign-level Product Owner. Reads state, proposes sequences, dispatches specialists. Advisory-mode. |

## Skills (all namespaced `/marketing-team-freedom:<name>`)

| Skill | What it does |
|---|---|
| `brief` | Write a creative / campaign brief that enforces specificity (goal, persona, pillar, CTA, channel, constraints). |
| `write` | Dispatch the copywriter with a brief + channel → draft saved under `campaigns/<name>/copy/`. |
| `hooks` | Generate option sets for headlines / subject lines / CTAs / hooks. |
| `adapt` | Repurpose an approved piece across N channels. |
| `voice-check` | Run brand-voice-guardian against a draft before shipping. |
| `calendar` | Maintain `CONTENT-CALENDAR.md` with pillar balance + cadence analysis. |
| `post-mortem` | Structured campaign retrospective feeding learnings back to strategy files. |

## Typical campaign flow

```
1.  /marketing-team-freedom:brief
         ↓
2.  /marketing-team-freedom:write          → copywriter
         ↓
3.  /marketing-team-freedom:hooks          → hook-writer
         ↓
4.  /marketing-team-freedom:voice-check    → brand-voice-guardian (blocker?)
         ↓  (fix + re-check if needed)
5.  ship the piece
         ↓
6.  /marketing-team-freedom:adapt          → channel-adapter (N channels)
         ↓
7.  /marketing-team-freedom:voice-check    → each adaptation
         ↓
8.  ship the adaptations
         ↓
9.  (campaign ends)
10. /marketing-team-freedom:post-mortem    → learnings feed back to strategy
```

The `marketing-orchestrator` agent proposes this sequence automatically — you approve each step before it dispatches.

## Philosophy

- **Strategy is a committed artefact, not a slide deck.** `POSITIONING.md` + `AUDIENCE.md` + `BRAND-VOICE.md` are the contract every other agent reads. They're git-versioned. Drift is visible.
- **Specificity beats scale.** Named personas with verbatim vocabulary beat "our customers". Specific proof beats general claims.
- **Voice travels, format doesn't.** Adaptations across channels preserve voice but restructure for medium. A `channel-adapter` producing identical text on five platforms is a bug.
- **Hooks are option sets, not single picks.** The hook-writer generates 8-15 across archetypes; the human picks. Claude doesn't "know" which hook works — the audience does.
- **Voice-check is non-optional.** Every customer-facing piece passes `brand-voice-guardian` before shipping. Voice drift is cheap to prevent, expensive to recover from.
- **Post-mortems update strategy.** A post-mortem that doesn't propose strategy-file changes was too shallow to be worth writing.

## Use on a non-marketing team?

Some components are more general than marketing:

- `BRAND-VOICE.md` pattern works for any author / publication with a consistent voice (blog, newsletter, research group)
- `channel-adapter` works for any content you'd multi-publish (engineering blog posts, conference talks → blog → Twitter)
- `post-mortem` template is useful for any shipped-artefact review

But the full pipeline is designed for marketing campaigns specifically. For engineering, use `studio` + a technical plugin (like `plugin-freedom-system-audio` for audio DSP, or the `figma-plugin-freedom` / `webapp-freedom` templates).

## Development

```bash
claude --plugin-dir $(pwd)
# Inside Claude Code:
/help                                        # should list /marketing-team-freedom:<skill> entries
/marketing-team-freedom:brief                # test the first skill
```

After edits:
```
/reload-plugins
```

## License

MIT — see [LICENSE](LICENSE).

## Credits

Built as the non-engineering counterpart to `studio`. Extracted from the patterns of real marketing work, designed to dogfood the "encode working habits as reusable Claude Code plugins" approach beyond software domains.
