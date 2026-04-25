import { buildAudioProjectModel, type Stage } from "../state/audio-project.js";

export interface AudioProjectStateResult {
  rootPath: string;
  stage: Stage;
  stageRationale: string;
  nextExpectedActions: string[];
  artefacts: {
    architectureMd: boolean;
    planMd: boolean;
    dspResearchMd: boolean;
    dspFreezeMd: boolean;
    cmakeLists: boolean;
    pluginProcessor: string | null;
    pluginEditor: string | null;
    webviewIndex: string | null;
  };
  juceModulesDeclared: string[];
  versionTagsCount: number;
  cppFileCount: number;
  hppFileCount: number;
}

const STAGE_RATIONALES: Record<Stage, string> = {
  "stage-0-research": "Planning artefacts present (architecture / plan / dsp-research) but no plugin source.",
  "stage-1-shell": "CMake + PluginProcessor stub present. Foundation laid; DSP not yet implemented.",
  "stage-2-dsp": "PluginProcessor + plan committed; DSP work in progress.",
  "stage-3-gui": "WebView UI present alongside processor; integrating GUI with parameters.",
  shipping: "≥2 version tags + DSP frozen + GUI present. Plugin is in active release maintenance.",
  unknown: "No clear stage signal — likely an empty project or non-standard layout.",
};

const NEXT_ACTIONS: Record<Stage, string[]> = {
  "stage-0-research": [
    "Run /audio-plugin-freedom:plugin-planning to produce architecture.md + plan.md",
    "Or invoke /audio-plugin-freedom:dsp-research for deep DSP modelling",
  ],
  "stage-1-shell": [
    "Run /audio-plugin-freedom:plugin-workflow Stage 2 to implement DSP",
    "Verify APVTS layout with validate_apvts_layout MCP tool",
  ],
  "stage-2-dsp": [
    "Run scan_realtime_safety MCP tool to audit processBlock",
    "Run /audio-plugin-freedom:audio-qa for null-test / THD validation",
    "Move to Stage 3 (GUI) once DSP is null-test stable",
  ],
  "stage-3-gui": [
    "Run /audio-plugin-freedom:plugin-testing for pluginval pass",
    "Run check_pluginval_logs MCP tool on the latest pluginval output",
    "Run /audio-plugin-freedom:plugin-packaging once stable",
  ],
  shipping: [
    "Run scan_realtime_safety on each release for regressions",
    "Run check_pluginval_logs after every DAW format build",
    "Use studio's propose_next_action for backlog and rollback decisions",
  ],
  unknown: [
    "Run /audio-plugin-freedom:plugin-ideation if exploring a new plugin",
    "Run /audio-plugin-freedom:plugin-planning if a creative brief exists",
  ],
};

export async function getAudioProjectState(projectPath: string): Promise<AudioProjectStateResult> {
  const model = await buildAudioProjectModel(projectPath);
  return {
    rootPath: projectPath,
    stage: model.detectedStage,
    stageRationale: STAGE_RATIONALES[model.detectedStage],
    nextExpectedActions: NEXT_ACTIONS[model.detectedStage],
    artefacts: {
      architectureMd: model.hasArchitectureMd,
      planMd: model.hasPlanMd,
      dspResearchMd: model.hasDspResearchMd,
      dspFreezeMd: model.hasDspFreezeMd,
      cmakeLists: model.hasCMakeLists,
      pluginProcessor: model.pluginProcessorCpp?.relPath ?? null,
      pluginEditor: model.pluginEditorCpp?.relPath ?? null,
      webviewIndex: model.webviewIndexHtml,
    },
    juceModulesDeclared: model.juceModulesDeclared,
    versionTagsCount: model.versionTagsCount,
    cppFileCount: model.cppFiles.length,
    hppFileCount: model.hppFiles.length,
  };
}
