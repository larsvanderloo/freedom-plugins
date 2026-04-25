---
name: sound-design
description: Orchestrates the Sound Design Agent for preset creation, reference audio generation, and A/B comparison frameworks. Produces factory presets, preset-spec.md, and reference audio scripts.
allowed-tools:
  - Task # REQUIRED - delegates to sound-design-agent
  - Read # For contracts
  - Write # For presets and documentation
  - Bash # For git operations, audio processing
preconditions:
  - Plugin must be working (DSP complete or frozen)
  - parameter-spec.md must exist (to know parameter ranges)
---

# sound-design Skill

**Purpose:** Orchestrate the Sound Design Agent for creating factory presets, reference audio generation scripts, and A/B comparison frameworks. This skill brings the plugin to life with mix-ready sounds.

**Invoked by:** `/presets` command or product-orchestrator dispatch

---

## Entry Point

```
/presets [PluginName]
```

### Precondition Checks
1. Plugin DSP is working (frozen or Stage 2+ complete)
2. parameter-spec.md exists (parameter ranges needed for preset values)
3. creative-brief.md exists (use cases inform preset design)

---

## Delegation Protocol

1. **Gather context:**
   - creative-brief.md (use cases, sonic character)
   - parameter-spec.md (parameter ranges, defaults)
   - architecture.md (processing chain)
   - dsp-research.md (reference behavior, if exists)

2. **Invoke subagent:**
   ```
   Task(subagent_type="sound-design-agent", description="Create presets for [PluginName]", model="sonnet")
   ```

3. **Handle result:**
   - Present preset summary (categories, count, highlights)
   - Offer to generate reference audio (if processing tool available)
   - Offer to proceed to packaging

---

## Output Structure
```
[PluginName]/Presets/
├── Factory/[Category]/[PresetName].xml
├── reference/
│   ├── generate_reference.sh
│   └── test_signals/
├── preset-spec.md
└── README.md
```
