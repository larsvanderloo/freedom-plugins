# hardware-product-freedom — Domain scope

<!-- domain-isolation-marker:v1 -->

This plugin's skills and agents are **specific to physical hardware product development**: industrial-design research, ergonomics, concept generation, parametric CAD specification, materials and finishes, DFM review, electronics architecture, schematic + PCB layout spec, BOM and supply chain, EMC/safety/regulatory compliance, and contract-manufacturer selection.

## Do NOT bleed hardware concepts into non-hardware work

When this repo is open and the user is working on a **non-hardware task** (audio plugin, Figma plugin, web app, CLI tool, marketing copy, project management), do **not** introduce hardware-domain terminology, analogies, or framings. Specifically:

- No "DFM-style …" or "tolerance-stack …" analogies in non-hardware contexts
- No GD&T / draft-angle / BOM-cost / EMC-pre-screen framings unless the user is designing a physical product
- No CAD parametric-feature analogies as metaphors for software architecture

If the user is invoking this plugin's skills (`/hardware-product-freedom:*`) or naturally asking about hardware products, the above does **not** apply — you are working in the hardware domain.

## Companion `*-freedom` plugins (different domains, mutually exclusive)

- `audio-plugin-freedom` — JUCE audio plugins (DSP, processBlock, APVTS)
- `figma-plugin-freedom` — Figma plugins (TypeScript, postMessage bridge)
- `webapp-freedom` — full-stack web apps
- `cli-tool-freedom` — CLI tools (Go/Rust/Python/Node)
- `marketing-team-freedom` — marketing campaigns / copy
- `studio` — domain-agnostic project management

A skill from one domain must not inform an answer in another's territory.
