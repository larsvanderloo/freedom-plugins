# audio-plugin-freedom

Claude Code plugin for JUCE audio plugin development. **The full agent team behind the `ods-engine` Dumble ODS #124 modelling project**, packaged for reuse on any new audio plugin project.

14 specialised agents covering Stage 0 (research) through Stage 6+ (release), 13 skills for the typical workflows. Proven across 20+ tagged releases on a real-world non-trivial DSP project.

Designed to layer on [`session-discipline`](../session-discipline) for the session overlay (handoff docs, CHANGELOG, rollback-as-release).

## Install

```bash
claude \
  --plugin-dir ~/Documents/Claude/claude-plugins/session-discipline \
  --plugin-dir ~/Documents/Claude/claude-plugins/audio-plugin-freedom
```

Or upload `audio-plugin-freedom.zip` via claude.ai → Plugins → Upload local plugin.

## Quick start — new audio plugin

```
/audio-plugin-freedom:plugin-ideation     # brainstorm the concept
/audio-plugin-freedom:plugin-planning     # Stage 0 research + architecture
/audio-plugin-freedom:plugin-workflow     # Stages 1-3 implementation
/audio-plugin-freedom:audio-qa            # null tests, THD, sweeps
/audio-plugin-freedom:plugin-packaging    # PKG installer
```

## Agents (14)

| Agent | Stage | Role |
|---|---|---|
| `dsp-research-agent` | 0 | Invents/derives DSP algorithms, models analog gear, produces dsp-research.md |
| `research-planning-agent` | 0 | Consolidates research into architecture.md + plan.md |
| `foundation-shell-agent` | 1 | JUCE project structure + APVTS parameter scaffolding |
| `dsp-agent` | 2 | processBlock implementation against research contract |
| `ui-design-agent` | 3a | WebView UI mockup YAML + test HTML |
| `ui-finalization-agent` | 3b | Production HTML + C++ boilerplate + CMake config |
| `gui-agent` | 3c | Integrates finalised WebView with JUCE parameter bindings |
| `validation-agent` | post-stage | Automated build + test + DAW-load verification |
| `audio-qa-agent` | QA | Null tests, THD, frequency response, A/B reference comparison |
| `sound-design-agent` | release | Preset architect, demo producer, factory presets |
| `cicd-agent` | release | GitHub Actions build/test/release workflows |
| `plugin-engineer-agent` | review | Code reviewer for real-time safety, SIMD, JUCE 8 patterns |
| `troubleshoot-agent` | always | Deep research for build failures, linker, plugin validation |
| `product-orchestrator-agent` | overlay | Audio-specific top-level orchestrator (vs. domain-agnostic session-orchestrator) |

## Skills (13, namespaced `/audio-plugin-freedom:<name>`)

| Skill | What it does |
|---|---|
| `plugin-ideation` | Brainstorm audio plugin concepts |
| `plugin-planning` | Stage 0 — DSP research + architecture + implementation plan |
| `plugin-workflow` | Stages 1-3 — foundation + DSP + GUI orchestrated |
| `plugin-testing` | Run automated tests, pluginval, manual DAW QA |
| `plugin-packaging` | Create branded PKG installer for distribution |
| `plugin-lifecycle` | Install / uninstall / reset / destroy plugin |
| `plugin-improve` | Modify completed plugins with versioning + regression testing |
| `audio-qa` | Audio-domain testing — null tests, THD, frequency response, artifacts |
| `sound-design` | Generate factory presets, reference audio, A/B frameworks |
| `dsp-research` | Solo DSP research arc (without full planning skill) |
| `ui-mockup` | WebView UI design + iteration via mockup YAML |
| `cicd` | GitHub Actions setup for cross-platform plugin builds |
| `troubleshooting-docs` | Capture solved problems as searchable knowledge base entries |

## Typical project flow

```
1. plugin-ideation                            → creative brief
2. plugin-planning (dsp-research + research-planning)
                                              → architecture.md + plan.md
3. plugin-workflow (foundation + dsp + ui-mockup + ui-finalization + gui)
                                              → working plugin
4. plugin-testing (audio-qa + plugin-engineer review)
                                              → QA-passing plugin
5. sound-design                               → factory presets
6. plugin-packaging                           → PKG installer
7. cicd                                       → GitHub release workflow
8. plugin-improve                             → ongoing maintenance
```

`session-discipline` overlays this with handoff docs, CHANGELOG continuity, rollback releases, and orchestration discipline.

## Provenance

Every agent and skill in this plugin was used in production across the `ods-engine` Dumble ODS #124 modelling project. The release arc (v0.5.0 → v0.20.10) covered:
- Phase A/B/C/D schematic-truth audits
- HC solver development (PI 9×9, CleanPreamp 8×8, PowerAmp monolithic)
- Multi-day investigation arcs with failing-state preservation
- Production rollbacks (v0.20.6) and root-cause fixes (v0.20.8)
- Plugin packaging + Logic AU validation across multiple formats

These agents survived real engineering pressure. They're not theoretical.

## License

MIT — see [LICENSE](LICENSE).

## Part of the `claude-plugins` monorepo

See [../README.md](../README.md) for the full plugin collection.
