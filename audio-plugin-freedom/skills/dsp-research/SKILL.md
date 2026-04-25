---
name: dsp-research
description: Orchestrates the DSP Research Agent ("Sound Brain") for deep analog circuit modeling, algorithm invention, and mathematical model generation. Produces dsp-research.md contract consumed by research-planning-agent during Stage 0.
allowed-tools:
  - Task # REQUIRED - delegates to dsp-research-agent
  - Read # For contracts
  - Write # For output contract
  - Edit # For state updates
  - Bash # For git commits
preconditions:
  - creative-brief.md must exist (for new plugins) OR research prompt provided
---

# dsp-research Skill

**Purpose:** Orchestrate the DSP Research Agent for deep algorithm research and analog circuit modeling. This skill operates upstream of the planning pipeline - its output (dsp-research.md) feeds into the existing research-planning-agent during Stage 0.

**Invoked by:** `/research-dsp` command or product-orchestrator dispatch

---

## Entry Point

### Input Modes

1. **Plugin-scoped research:** `/research-dsp [PluginName]`
   - Read creative-brief.md from `plugins/[PluginName]/.ideas/`
   - Research the DSP approach for the entire plugin
   - Output: `plugins/[PluginName]/.ideas/dsp-research.md`

2. **Topic-scoped research:** `/research-dsp "Model a vintage compressor"`
   - No plugin context required
   - Research a specific algorithm or circuit
   - Output: `dsp-research-[topic].md` in working directory

3. **ODS124 research:** `/research-dsp ODS124`
   - Read existing contracts from project root
   - Research specific ODS124 improvements or extensions
   - Output: `dsp-research.md` in project root

---

## Precondition Checks

For plugin-scoped research:
1. Check `plugins/[PluginName]/.ideas/creative-brief.md` exists
2. If not found, suggest: "No creative brief found. Run `/dream [PluginName]` first to create one."

For topic-scoped research:
1. No preconditions - research prompt is sufficient

---

## Delegation Protocol

1. **Gather context** (parallel reads):
   - creative-brief.md (if exists)
   - Existing dsp-research.md (if exists - for extension)
   - architecture.md (if exists - for understanding current design)
   - DSP_FREEZE.md (if exists - for calibration reference)

2. **Construct subagent prompt:**
   ```
   Research topic: [user's request or creative brief summary]
   
   Existing context:
   [Include any relevant contract excerpts]
   
   Produce a comprehensive dsp-research.md with:
   - Mathematical models
   - Algorithm pseudocode
   - Validation criteria with measurable targets
   - Implementation recommendations
   ```

3. **Invoke subagent:**
   ```
   Task(subagent_type="dsp-research-agent", description="DSP research: [topic]", model="opus")
   ```

4. **Handle result:**
   - If success: Present summary to user, offer to proceed to `/plan`
   - If failure: Present error and suggest next steps

---

## Output Handling

After subagent returns:

1. Verify `dsp-research.md` was created
2. Present key findings summary to user:
   - Models developed
   - Validation criteria defined
   - Implementation recommendations
   - Open questions (if any)
3. Offer next steps:
   - "Proceed to planning? (`/plan [PluginName]`)"
   - "Refine research further?"
   - "Save and continue later"

---

## Integration with Planning Pipeline

When `/plan [PluginName]` runs after DSP research:
- The plugin-planning skill checks for `dsp-research.md`
- If found, passes it as additional input to research-planning-agent
- The planning agent uses the mathematical models to create more accurate architecture.md

This creates the flow:
```
/research-dsp → dsp-research.md → /plan → architecture.md + plan.md → /implement
```
