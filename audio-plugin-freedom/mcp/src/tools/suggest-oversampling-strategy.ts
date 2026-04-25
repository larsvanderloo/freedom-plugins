// Heuristic oversampling-strategy recommender.
//
// The rule of thumb: if your nonlinearity introduces harmonics above
// fs/2 - some safety, alias-fold will pollute audible frequencies. The
// number of harmonics scales with the "harshness" of the nonlinearity:
// soft saturation ~3-5 odd harmonics significant; hard clipping ~10-20+;
// foldback / wavefolding can have 30+ at high drive.
//
// Recommended factor ≈ ceil(audibleHarmonicCount × fundamentalUpperHz × 2 / sampleRateHz).
// Rounded to nearest power-of-two for typical JUCE oversampling APIs.

export type DistortionType =
  | "soft-saturation"
  | "tube-saturation"
  | "asymmetric"
  | "hard-clip"
  | "wave-fold"
  | "bit-crush"
  | "ring-mod"
  | "fm";

export type FilterType =
  | "halfband-iir"        // cheap, low CPU; some passband ripple
  | "halfband-fir"        // linear phase; higher CPU
  | "elliptic-iir"        // sharpest cutoff; phase distortion
  | "polyphase-fir"       // best quality, highest CPU
  | "lagrange-poly";      // mostly for fractional resampling

export interface SuggestOversamplingArgs {
  distortionType: DistortionType;
  fundamentalUpperHz?: number;     // highest fundamental to preserve, default 8000
  sampleRateHz?: number;           // host sample rate, default 48000
  cpuBudget?: "tight" | "normal" | "luxurious"; // user preference, default normal
  preservePhase?: boolean;         // if true, force linear-phase filters, default false
}

export interface SuggestOversamplingResult {
  factor: 1 | 2 | 4 | 8 | 16;
  filter: FilterType;
  rationale: string;
  expectedAliasingDb: number;       // approximate residual aliasing
  approximateCpuOverheadFactor: number; // 1.0 = same as baseline
  cautions: string[];
}

const HARMONIC_COUNT_BY_TYPE: Record<DistortionType, number> = {
  "soft-saturation": 5,
  "tube-saturation": 8,
  "asymmetric": 12,
  "hard-clip": 25,
  "wave-fold": 40,
  "bit-crush": 30,        // creates broadband content
  "ring-mod": 6,          // sum + difference; bounded
  "fm": 50,               // Bessel-function spread; can be huge
};

export function suggestOversamplingStrategy(args: SuggestOversamplingArgs): SuggestOversamplingResult {
  const fundamentalUpperHz = args.fundamentalUpperHz ?? 8000;
  const sampleRateHz = args.sampleRateHz ?? 48000;
  const cpu = args.cpuBudget ?? "normal";
  const preservePhase = args.preservePhase ?? false;

  const harmonics = HARMONIC_COUNT_BY_TYPE[args.distortionType];

  // Highest harmonic frequency we want to preserve below fs/2 of the OVERSAMPLED rate.
  const highestHarmonicHz = fundamentalUpperHz * harmonics;
  // Required oversampling rate so highest harmonic is below 0.85 × Nyquist (safety margin)
  const requiredRateHz = (highestHarmonicHz / 0.85) * 2;
  const requiredFactor = Math.max(1, requiredRateHz / sampleRateHz);

  // Round up to nearest power of two, cap at 16
  let factor: 1 | 2 | 4 | 8 | 16 = 1;
  for (const f of [1, 2, 4, 8, 16] as const) {
    if (f >= requiredFactor) {
      factor = f;
      break;
    }
    factor = 16;
  }

  // Filter selection
  let filter: FilterType;
  if (preservePhase) {
    filter = cpu === "tight" ? "halfband-fir" : "polyphase-fir";
  } else if (cpu === "tight") {
    filter = "halfband-iir";
  } else if (cpu === "luxurious") {
    filter = "polyphase-fir";
  } else {
    filter = factor >= 4 ? "polyphase-fir" : "halfband-iir";
  }

  // Rough aliasing estimate (negative dB; more negative is better)
  const aliasingByFilter: Record<FilterType, number> = {
    "halfband-iir": -60,
    "halfband-fir": -90,
    "elliptic-iir": -100,
    "polyphase-fir": -110,
    "lagrange-poly": -50,
  };
  const expectedAliasingDb = aliasingByFilter[filter] - (factor === 1 ? 30 : 0);

  // Approximate CPU overhead factor (multiplier vs. 1× DSP cost)
  // 2× OS ≈ 2.0, 4× ≈ 4-5×, 8× ≈ 9-11×.
  const cpuOverhead =
    factor === 1 ? 1.0 :
    factor === 2 ? (filter === "polyphase-fir" ? 2.5 : 2.0) :
    factor === 4 ? (filter === "polyphase-fir" ? 5.5 : 4.0) :
    factor === 8 ? (filter === "polyphase-fir" ? 11.0 : 8.5) :
                   22.0;

  const cautions: string[] = [];
  if (factor >= 8) {
    cautions.push("8×/16× oversampling is usually overkill; reconsider whether the harmonic count estimate is conservative.");
  }
  if (args.distortionType === "fm") {
    cautions.push("FM is content-dependent; consider analytical anti-aliasing or BLEP/BLAMP rather than brute-force OS.");
  }
  if (args.distortionType === "bit-crush") {
    cautions.push("Bit-crush creates intentional aliasing as a colour; oversampling defeats the effect. Apply the OS only to the pre/post filtering.");
  }
  if (preservePhase && filter !== "halfband-fir" && filter !== "polyphase-fir") {
    cautions.push("preservePhase requested but selected filter is not linear-phase; revisit cpuBudget.");
  }

  const rationale =
    `Distortion type "${args.distortionType}" introduces ~${harmonics} significant harmonics. ` +
    `At a ${fundamentalUpperHz} Hz upper fundamental, the highest harmonic is ${(highestHarmonicHz / 1000).toFixed(1)} kHz. ` +
    `Required intermediate rate ≥ ${(requiredRateHz / 1000).toFixed(1)} kHz → ${factor}× oversampling at host rate ${sampleRateHz} Hz. ` +
    `Filter "${filter}" chosen for cpuBudget=${cpu}${preservePhase ? ", linear-phase required" : ""}.`;

  return {
    factor,
    filter,
    rationale,
    expectedAliasingDb,
    approximateCpuOverheadFactor: Number(cpuOverhead.toFixed(2)),
    cautions,
  };
}
