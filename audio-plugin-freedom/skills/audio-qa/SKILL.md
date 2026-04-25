---
name: audio-qa
description: Orchestrates the Audio QA Agent for audio-domain testing. Runs null tests, THD analysis, frequency response sweeps, latency measurement, artifact detection, and A/B reference comparison. Produces qa-report.md.
allowed-tools:
  - Task # REQUIRED - delegates to audio-qa-agent
  - Read # For contracts and source
  - Write # For QA report
  - Bash # For building test harness, running tests
preconditions:
  - Plugin engine must build (engine library compiles)
---

# audio-qa Skill

**Purpose:** Orchestrate the Audio QA Agent for comprehensive audio-domain testing. This goes beyond code-level validation (which validation-agent handles) to actually process signals through the plugin and measure the output.

**Invoked by:** `/audio-test` command, product-orchestrator dispatch, or optionally in checkpoint protocol (Step 3.5)

---

## Entry Point

```
/audio-test [PluginName]
```

### Precondition Checks
1. Engine source exists and can be compiled
2. For ODS124: `engine/` directory with CMakeLists.txt
3. Test framework available (`tests/TestFramework.h`)

---

## Delegation Protocol

1. **Gather context:**
   - DSP_FREEZE.md (calibration targets)
   - dsp-research.md (validation criteria, if exists)
   - architecture.md (processing chain description)
   - Existing test files (for patterns)

2. **Invoke subagent:**
   ```
   Task(subagent_type="audio-qa-agent", description="Audio QA for [PluginName]", model="opus")
   ```

3. **Handle result:**
   - If all tests pass: report clean bill of health
   - If failures: present failures with severity, recommend fixes
   - If build fails: report build failure, cannot proceed

---

## Output

- `qa-report.md` - Human-readable test report
- JSON report following `audio-qa-report.json` schema
- Optional: diagnostic WAV files for manual inspection

---

## Test Categories (Summary)

1. **Null tests:** Bypass coherence, determinism, DC offset, stability
2. **THD analysis:** Single-tone at multiple frequencies and levels
3. **Frequency response:** Sweep, tone stack curves, rolloff
4. **Latency:** Absolute measurement, consistency
5. **Artifacts:** Clicks/pops, aliasing, zipper noise, denormals
6. **Dynamic range:** Noise floor, max output, SNR
7. **Reference comparison:** A/B against dsp-research.md targets
