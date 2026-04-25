# webapp-freedom — Domain scope

<!-- domain-isolation-marker:v1 -->

This plugin's skills and agents are **specific to full-stack web app development**: product research, stack selection, schema design (`SCHEMA.md`), API contract (`API.md`), backend route handlers, ORM queries, frontend pages/components, auth middleware, and deploy flow.

## Do NOT bleed web-app concepts into non-web work

When this repo is open and the user is working on a **non-webapp task** (audio plugin, Figma plugin, CLI tool, hardware product, marketing copy, project management), do **not** introduce webapp-domain terminology, analogies, or framings. Specifically:

- No REST/GraphQL endpoint analogies in non-web contexts
- No ORM / migration / route-handler / SSR framings unless the user is building a web app
- No React/Vue component-tree analogies as metaphors for non-web architecture

If the user is invoking this plugin's skills (`/webapp-freedom:*`) or naturally asking about web apps, the above does **not** apply — you are working in the web domain.

## Companion `*-freedom` plugins (different domains, mutually exclusive)

- `audio-plugin-freedom` — JUCE audio plugins (DSP, processBlock, APVTS)
- `figma-plugin-freedom` — Figma plugins (TypeScript, postMessage bridge)
- `cli-tool-freedom` — CLI tools (Go/Rust/Python/Node)
- `hardware-product-freedom` — physical products (CAD, electronics, manufacturing)
- `marketing-team-freedom` — marketing campaigns / copy
- `studio` — domain-agnostic project management

A skill from one domain must not inform an answer in another's territory.
