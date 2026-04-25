---
description: Maintain CONTENT-CALENDAR.md — scheduled pieces across channels, with pillar coverage, cadence analysis, and gap detection. Not a full publishing tool (no actual posting), a planning artefact. Use to add upcoming pieces, check for pillar drift (too much of one message, too little of another), rebalance the cadence, or generate the next 4 weeks of planned content from a campaign roadmap.
---

# Calendar

`CONTENT-CALENDAR.md` is where campaigns become a shipping plan. Not a CMS — just a Markdown file that lists what's going out when, on which channel, to which persona, expressing which messaging pillar.

## Structure

Canonical `CONTENT-CALENDAR.md`:

```markdown
# Content calendar

**Cadence targets:**
- Email newsletter: 1/week (Thursday)
- Twitter: 5-7 posts/week
- LinkedIn: 3 posts/week
- Blog: 2/month

**Pillar balance target (over a 4-week window):**
- Pillar 1: 40%
- Pillar 2: 30%
- Pillar 3: 30%

---

## Week of <date>

| Date | Channel | Campaign | Title / Hook | Pillar | Persona | Status | Notes |
|------|---------|----------|--------------|--------|---------|--------|-------|
| <date> | email | <camp> | <title> | P1 | primary | draft | link: <path> |
| <date> | twitter | <camp> | <hook> | P2 | primary | hook-pending | |
| <date> | linkedin | <camp> | <hook> | P1 | secondary | shipped | |

## Week of <date>

...

## Upcoming (unscheduled)

- <piece>, <channel> — needs date
- <piece>, <channel> — needs brief
```

## What this skill does

### 1. Add a piece

User: "Schedule the launch email for next Tuesday."
You:
- Read current calendar
- Add row to the appropriate week
- Check against cadence targets — are we over-posting emails this week?
- Check against pillar balance — does this piece (Pillar 1) unbalance the 4-week window?
- Flag if yes; confirm with user before committing

### 2. Analyse coverage

User: "Are we balanced across pillars this month?"
You:
- Tally pillar representation across last + next 2 weeks
- Compare to target ratios
- Report: "Pillar 1 = 60% (target 40%), Pillar 3 = 10% (target 30%). Gap in Pillar 3."
- Suggest: "Next 2 weeks should lean Pillar 3. Copywriter could adapt <existing piece> to P3 angle, or strategist could brief a net-new P3 piece."

### 3. Detect cadence drift

User: "Run a calendar health check."
You:
- Check each channel against its cadence target
- Report channels that are over/under
- Highlight weeks with zero coverage on a committed channel
- Highlight weeks with pile-ups that will compete for the same audience attention

### 4. Generate a 4-week plan

User: "Give me the next 4 weeks based on our active campaigns."
You:
- Read active `campaigns/*/brief.md`
- Distribute pieces across weeks respecting cadence + pillar balance
- Propose schedule
- Flag pieces that need briefs / copy / hook-writing before the proposed date

## Don't

- ❌ Schedule pieces without knowing the brief is committed or drafted (creates deadline pressure that skips quality checks)
- ❌ Let one campaign dominate the calendar — pillar balance exists to prevent message fatigue
- ❌ Manage this in a spreadsheet offline — Markdown + git gives you a history trail
- ❌ Schedule same pillar 3 days in a row on same channel (audience reads as repetitive)

## Integrations

- If `studio` plugin is installed, calendar changes get committed + CHANGELOG'd like any other artefact
- Post-mortem after a campaign should update the calendar's cadence targets if learnings suggest rebalance
