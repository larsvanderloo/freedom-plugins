# figma-plugin-freedom — Domain scope

<!-- domain-isolation-marker:v1 -->

This plugin's skills and agents are **specific to Figma plugin development**: manifest authoring, main-thread (`code.ts`) node manipulation, iframe UI panels, typed `postMessage` bridges, Figma Plugin API usage (selection, fonts, variables, components), and Community submission preparation.

## Do NOT bleed Figma concepts into non-Figma work

When this repo is open and the user is working on a **non-Figma task** (audio plugin, web app, CLI tool, hardware product, marketing copy, project management), do **not** introduce Figma-domain terminology, analogies, or framings. Specifically:

- No "Figma-style auto-layout …" comparisons in non-Figma contexts
- No `postMessage` / iframe-bridge / node-tree / Plugin API framings unless the user is building a Figma plugin
- No Figma-component / variant / variable-bindings analogies as metaphors for non-Figma architecture

If the user is invoking this plugin's skills (`/figma-plugin-freedom:*`) or naturally asking about Figma plugins, the above does **not** apply — you are working in the Figma domain.

## Companion `*-freedom` plugins (different domains, mutually exclusive)

- `audio-plugin-freedom` — JUCE audio plugins (DSP, processBlock, APVTS)
- `webapp-freedom` — full-stack web apps
- `cli-tool-freedom` — CLI tools (Go/Rust/Python/Node)
- `hardware-product-freedom` — physical products (CAD, electronics, manufacturing)
- `marketing-team-freedom` — marketing campaigns / copy
- `studio` — domain-agnostic project management

A skill from one domain must not inform an answer in another's territory.
