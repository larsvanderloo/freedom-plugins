---
description: Repurpose an approved, voice-checked piece of copy into N other channels (X thread, LinkedIn post, email, Reel script, Reddit post, etc.) while preserving voice and claims. Dispatches channel-adapter agent with the source + target channels list. Output: one file per target channel in campaigns/<campaign>/adapted/. Use when a long-form piece is performing and you want multi-channel coverage, or when a launch needs coordinated rollout across channels.
---

# Adapt

Wraps the `channel-adapter` agent. Takes one approved source piece + a list of target channels, produces channel-native drafts for each.

## Pre-flight checks

1. **Source piece exists and is approved.** Don't adapt drafts — voice drift compounds across channels. The source should have passed `brand-voice-guardian`.
2. **Target channels specified.** "Adapt this for LinkedIn" is fine. "Adapt for social" is too vague — which social platforms?
3. **Channel-specific persona known.** LinkedIn audience may differ from Twitter audience. Confirm with user: "Is this hitting the same persona on LinkedIn as on Twitter, or is LinkedIn a B2B cut we should address differently?"

## Dispatch pattern

Invoke `channel-adapter` with:
- Path to source piece
- List of target channels
- Any channel-specific audience notes
- `BRAND-VOICE.md` path (to carry across adaptations)

## After channel-adapter returns

For each adaptation:
1. Report: source piece, target channel, length, what was preserved / cut
2. Route each through `brand-voice-guardian` before shipping — voice drift across channels is the #1 failure mode
3. Escalate channel-specific hooks (subject lines, ad headlines, TikTok hook-lines) to `hook-writer` — channel-adapter writes bodies, not hooks

## Typical repurpose fans

- Blog post → Twitter thread + LinkedIn post + email newsletter + Reddit comment
- Launch announcement → email + landing-page update + Twitter post + LinkedIn post + ad creative brief
- Customer story → case study page + LinkedIn post + sales one-pager + quote for website

## Don't

- ❌ Repurpose without voice-check step (channel-adapter will ask for it; don't override)
- ❌ Adapt into a channel whose audience differs without discussing with strategist first
- ❌ Run adapt on something that's still in draft. Lock the source first.
- ❌ Add new claims during adaptation. Stay within the source's commitments.
