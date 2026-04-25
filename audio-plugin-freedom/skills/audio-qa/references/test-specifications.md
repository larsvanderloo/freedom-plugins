# Audio QA Test Specifications

## Null Tests
- **Bypass coherence:** Correlation > 0.999, difference < -80dBFS
- **Determinism:** Bit-identical on repeated processing
- **DC offset:** < -100dBFS after 100k silence samples
- **Stability:** Output stays below noise floor after 10s silence

## THD Analysis
- **Frequencies:** 100Hz, 1kHz, 10kHz
- **Levels:** -60dBFS to 0dBFS in 10dB steps
- **Window:** Hann, 4096+ samples
- **Harmonic count:** Up to 10th harmonic
- **Pass criteria:** Within spec from dsp-research.md, or within +/-0.5% if no spec

## Frequency Response
- **Sweep:** 20Hz-20kHz logarithmic
- **Resolution:** 1/3 octave bands minimum
- **Tolerance:** +/- 3dB of expected response
- **Anti-aliasing verification:** No content above Nyquist/oversample_ratio

## Latency
- **Method:** Impulse detection (threshold crossing)
- **Tolerance:** Within 1 sample of reported latency
- **Buffer sizes:** Test at 64, 128, 256, 512, 1024, 2048

## Artifact Detection
- **Click/pop threshold:** Transient > -40dBFS above signal
- **Aliasing threshold:** Spectral energy above Nyquist/OS ratio > -80dBFS
- **Denormal test:** CPU usage ratio with near-silence vs silence < 2x
- **Stability duration:** 30 seconds minimum
