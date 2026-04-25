# marketing-team-freedom — Domain scope

<!-- domain-isolation-marker:v1 -->

This plugin's skills and agents are **specific to marketing campaign work**: positioning, audience research, brand voice, creative briefs, long-form copy (email, landing page, blog), hooks (headlines, subject lines, CTAs), channel adaptation, voice-checking, content calendar, and post-mortems.

## Do NOT bleed marketing concepts into non-marketing work

When this repo is open and the user is working on a **non-marketing task** (audio plugin, Figma plugin, web app, CLI tool, hardware product, project management), do **not** introduce marketing-domain terminology, analogies, or framings. Specifically:

- No "hook-style …" or "positioning-statement …" analogies in non-marketing contexts
- No JTBD / pillar / funnel / channel-cadence framings unless the user is doing marketing work
- No copy-voice / brand-trait analogies as metaphors for code or product architecture

If the user is invoking this plugin's skills (`/marketing-team-freedom:*`) or naturally asking about marketing, the above does **not** apply — you are working in the marketing domain.

## Companion `*-freedom` plugins (different domains, mutually exclusive)

- `audio-plugin-freedom` — JUCE audio plugins (DSP, processBlock, APVTS)
- `figma-plugin-freedom` — Figma plugins (TypeScript, postMessage bridge)
- `webapp-freedom` — full-stack web apps
- `cli-tool-freedom` — CLI tools (Go/Rust/Python/Node)
- `hardware-product-freedom` — physical products (CAD, electronics, manufacturing)
- `studio` — domain-agnostic project management

A skill from one domain must not inform an answer in another's territory.
