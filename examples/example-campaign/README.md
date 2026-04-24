# Example campaign — Parallax Notes "Infinite Canvas" launch

This is a worked example demonstrating the full marketing-team-freedom pipeline. Fictional product (`Parallax Notes` — a visual-first note-taking app), real-shaped deliverables. Use it as a reference for what each agent's output looks like in a real campaign.

## What's here

```
example-campaign/
├── POSITIONING.md            # strategist output — product positioning
├── AUDIENCE.md               # strategist output — primary + secondary personas
├── BRAND-VOICE.md            # strategist output — voice rules + calibration
├── brief.md                  # /brief skill output — creative brief for the email
├── copy/
│   └── email-launch.md       # copywriter output — email body draft
└── hooks/
    └── email-subject.md      # hook-writer output — labelled subject-line options
```

## The flow that produced this

1. **`strategist`** interviewed the user (implicit) → produced `POSITIONING.md`, `AUDIENCE.md`, `BRAND-VOICE.md`.
2. **`/marketing-team-freedom:brief`** → produced `brief.md` from strategy + user's campaign idea.
3. **`/marketing-team-freedom:write email-launch`** → dispatched `copywriter` → produced `copy/email-launch.md`.
4. **`/marketing-team-freedom:hooks email-subject`** → dispatched `hook-writer` → produced `hooks/email-subject.md` (12 options, 3 picks with rationale).
5. **(next step, not shown)** `/marketing-team-freedom:voice-check` → would dispatch `brand-voice-guardian` against the top-3 subject lines + email body before shipping.
6. **(also not shown)** `/marketing-team-freedom:adapt` → would dispatch `channel-adapter` to repurpose this into a Twitter post + LinkedIn post + blog announcement if the user wants multi-channel.

## What to notice

- **Every downstream file references upstream files.** The brief cites positioning + audience. The email draft cites the brief. The hooks cite the email + brand voice.
- **Concrete > abstract.** AUDIENCE.md names Maya, gives her verbatim vocabulary. The copy uses Maya's language, not the brand's internal jargon.
- **Voice rules are pre-committed.** BRAND-VOICE.md explicitly bans "revolutionary" / "game-changing" / emoji in email subject lines. When the hook-writer generates options, it respects these — one option was flagged as TOO LONG (73 char), another was restructured to fit the 40-50 char constraint.
- **Voice is traceable.** If in 6 months someone writes a "promoted blog post" email that opens with "We're thrilled to announce...", the next voice-check will flag it by referencing `BRAND-VOICE.md`.

## How to use this as a template

1. Copy the folder to your own project as a starting point:
   ```bash
   cp -r examples/example-campaign /path/to/your/brand
   ```
2. Rewrite `POSITIONING.md` / `AUDIENCE.md` / `BRAND-VOICE.md` for your actual product. Or delete them and run the `strategist` agent to interview you fresh.
3. Start new campaigns under `campaigns/<campaign-slug>/` with their own `brief.md`, `copy/`, `hooks/`, `adapted/`.
4. Run the pipeline via `/marketing-team-freedom:*` skills.
