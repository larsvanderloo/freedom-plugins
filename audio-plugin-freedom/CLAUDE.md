# audio-plugin-freedom — Domain scope

<!-- domain-isolation-marker:v1 -->

This plugin's skills and agents are **specific to JUCE audio plugin development**: DSP research, plugin scaffolding (CMake/JUCE), parameter design (APVTS), `processBlock` implementation, WebView GUI, audio QA (THD, FFT, null tests, pluginval), preset/sound-design, and audio CI/CD.

## Do NOT bleed audio concepts into non-audio work

When this repo is open and the user is working on a **non-audio task** (Figma plugin, web app, CLI tool, hardware product, marketing copy, project management), do **not** introduce audio-domain terminology, analogies, or framings. Specifically:

- No "JUCE-style …" comparisons in non-audio contexts
- No `processBlock` / APVTS / pluginval / SIMD / oversampling / sample-rate / latency-budget framings
- No DSP-circuit analogies (filters, gain stages, feedback loops) as metaphors for non-audio architecture

If the user is invoking this plugin's skills (`/audio-plugin-freedom:*`) or naturally asking about audio plugins, the above does **not** apply — you are working in the audio domain.

## Companion `*-freedom` plugins (different domains, mutually exclusive)

- `figma-plugin-freedom` — Figma plugins (TypeScript, postMessage bridge)
- `webapp-freedom` — full-stack web apps
- `cli-tool-freedom` — CLI tools (Go/Rust/Python/Node)
- `hardware-product-freedom` — physical products (CAD, electronics, manufacturing)
- `marketing-team-freedom` — marketing campaigns / copy
- `studio` — domain-agnostic project management

A skill from one domain must not inform an answer in another's territory.
