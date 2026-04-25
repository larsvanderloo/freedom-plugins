# Reference Audio Generation

## Test Signals
- **Sine tones:** 100Hz, 440Hz, 1kHz, 5kHz at -20dBFS
- **Frequency sweep:** 20Hz-20kHz logarithmic, 10 seconds
- **Impulse:** Single sample at 0dBFS
- **Pink noise:** 10 seconds at -20dBFS
- **Program material:** DI guitar (if available)

## Processing Method
1. Build engine standalone (no JUCE needed)
2. Use `tools/process_wav.cpp` or custom test harness
3. Process each test signal through each preset configuration
4. Save output as WAV files

## A/B Comparison Framework
- Compare processed output against reference measurements from dsp-research.md
- Metrics: frequency response correlation, THD similarity, envelope matching
- Subjective criteria: warmth, clarity, dynamics, character

## Output Structure
```
reference/
├── generate_reference.sh  # Script to generate all reference audio
├── test_signals/           # Input test signals
├── presets/                # Processed output per preset
└── analysis/              # Comparison scripts and reports
```
