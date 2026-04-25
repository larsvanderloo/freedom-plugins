#!/usr/bin/env node
// audio-plugin-freedom-mcp — MCP server for the audio-plugin-freedom plugin.
// JUCE-domain analysis: real-time safety, APVTS validation, project phase,
// oversampling strategy, and pluginval-log triage.
//
// Tools exposed:
//   scan_realtime_safety           — find allocations / locks / IO in processBlock paths
//   validate_apvts_layout          — check APVTS parameter declarations for common bugs
//   get_audio_project_state        — Stage 0/1/2/3/shipping detection + next actions
//   suggest_oversampling_strategy  — heuristic OS factor + filter recommendation
//   check_pluginval_logs           — categorise pluginval output, surface action items

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { scanRealtimeSafety } from "./tools/scan-realtime-safety.js";
import { validateApvtsLayout } from "./tools/validate-apvts-layout.js";
import { getAudioProjectState } from "./tools/get-audio-project-state.js";
import { suggestOversamplingStrategy } from "./tools/suggest-oversampling-strategy.js";
import { checkPluginvalLogs } from "./tools/check-pluginval-logs.js";

// ---------- Tool argument schemas ----------

const ProjectPathArg = z.object({
  project_path: z.string().describe("Absolute path to the JUCE project root."),
});

const ScanRealtimeSafetyArgs = ProjectPathArg;
const ValidateApvtsLayoutArgs = ProjectPathArg;
const GetAudioProjectStateArgs = ProjectPathArg;

const SuggestOversamplingArgs = z.object({
  distortion_type: z.enum([
    "soft-saturation",
    "tube-saturation",
    "asymmetric",
    "hard-clip",
    "wave-fold",
    "bit-crush",
    "ring-mod",
    "fm",
  ]).describe("Type of nonlinearity introducing harmonics."),
  fundamental_upper_hz: z.number().positive().optional().describe("Highest fundamental to preserve. Default 8000."),
  sample_rate_hz: z.number().positive().optional().describe("Host sample rate. Default 48000."),
  cpu_budget: z.enum(["tight", "normal", "luxurious"]).optional().describe("CPU budget bias. Default normal."),
  preserve_phase: z.boolean().optional().describe("Force linear-phase filter. Default false."),
});

const CheckPluginvalLogsArgs = z.object({
  log_path: z.string().optional().describe("Absolute path to a pluginval log file."),
  log_content: z.string().optional().describe("Raw pluginval log content as a string. Provide either this or log_path."),
});

// ---------- Server setup ----------

const server = new Server(
  {
    name: "audio-plugin-freedom-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "scan_realtime_safety",
      description:
        "Scan all C++ source files in the project for real-time-unsafe operations inside processBlock-like methods. Flags heap allocation (new/malloc), locks (std::mutex, juce::CriticalSection), IO (std::cout, juce::Logger, file handles), throwing, juce::String construction from literals, and container growth (push_back). Severity-labelled (blocker/major/minor) with rationale per finding. Use early in Stage 2 DSP work and before every release.",
      inputSchema: {
        type: "object",
        properties: {
          project_path: { type: "string", description: "Absolute path to the JUCE project root." },
        },
        required: ["project_path"],
      },
    },
    {
      name: "validate_apvts_layout",
      description:
        "Parse AudioProcessorValueTreeState parameter declarations from C++ sources. Validates: ID uniqueness (duplicate IDs are silently dropped by APVTS), min<max ordering, defaults within range, choice arrays non-empty with valid defaultIndex, ID-format hygiene, and duplicate display-names. Returns parsed parameters + severity-labelled issues. Run after parameter additions and before each release.",
      inputSchema: {
        type: "object",
        properties: {
          project_path: { type: "string", description: "Absolute path to the JUCE project root." },
        },
        required: ["project_path"],
      },
    },
    {
      name: "get_audio_project_state",
      description:
        "Detect the current pipeline stage of an audio-plugin project (Stage 0 research → Stage 1 shell → Stage 2 DSP → Stage 3 GUI → shipping) by inspecting committed artefacts (architecture.md, plan.md, dsp-research.md, DSP_FREEZE.md, CMakeLists.txt, PluginProcessor.cpp/.h, WebView UI, version-tag count). Returns the stage, rationale, recommended next actions, and the artefact roll-up. Audio-domain-specific complement to studio's generic find_active_phase.",
      inputSchema: {
        type: "object",
        properties: {
          project_path: { type: "string", description: "Absolute path to the JUCE project root." },
        },
        required: ["project_path"],
      },
    },
    {
      name: "suggest_oversampling_strategy",
      description:
        "Heuristic recommender for oversampling factor + anti-aliasing filter type given a distortion description. Inputs: distortion_type (soft-saturation, tube-saturation, asymmetric, hard-clip, wave-fold, bit-crush, ring-mod, fm), optional fundamental_upper_hz (default 8000), sample_rate_hz (default 48000), cpu_budget (tight/normal/luxurious), preserve_phase. Returns: factor (1×/2×/4×/8×/16×), filter (halfband-iir, halfband-fir, elliptic-iir, polyphase-fir, lagrange-poly), rationale, expected aliasing in dB, CPU-overhead multiplier, and cautions. Use during Stage 0 research and Stage 2 DSP design.",
      inputSchema: {
        type: "object",
        properties: {
          distortion_type: {
            type: "string",
            enum: ["soft-saturation", "tube-saturation", "asymmetric", "hard-clip", "wave-fold", "bit-crush", "ring-mod", "fm"],
            description: "Type of nonlinearity introducing harmonics.",
          },
          fundamental_upper_hz: { type: "number", description: "Highest fundamental to preserve. Default 8000." },
          sample_rate_hz: { type: "number", description: "Host sample rate. Default 48000." },
          cpu_budget: { type: "string", enum: ["tight", "normal", "luxurious"], description: "CPU budget bias. Default normal." },
          preserve_phase: { type: "boolean", description: "Force linear-phase filter. Default false." },
        },
        required: ["distortion_type"],
      },
    },
    {
      name: "check_pluginval_logs",
      description:
        "Parse pluginval output (Tracktion's plugin validator) and produce a triaged punch list. Categorises findings: audio-thread-allocation, audio-thread-lock, audio-thread-fp (denormals/NaN), param-out-of-range, state-restore, audio-output, format-validation (VST3/AU/AAX), thread, memory, init-shutdown. Returns category breakdown, top-priority findings, and per-category recommendations (often dispatching to other MCP tools). Provide either log_path or log_content.",
      inputSchema: {
        type: "object",
        properties: {
          log_path: { type: "string", description: "Absolute path to a pluginval log file." },
          log_content: { type: "string", description: "Raw pluginval log content. Provide either this or log_path." },
        },
      },
    },
  ],
}));

// ---------- Tool dispatch ----------

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case "scan_realtime_safety": {
        const { project_path } = ScanRealtimeSafetyArgs.parse(args);
        const result = await scanRealtimeSafety(project_path);
        return jsonReply(result);
      }
      case "validate_apvts_layout": {
        const { project_path } = ValidateApvtsLayoutArgs.parse(args);
        const result = await validateApvtsLayout(project_path);
        return jsonReply(result);
      }
      case "get_audio_project_state": {
        const { project_path } = GetAudioProjectStateArgs.parse(args);
        const result = await getAudioProjectState(project_path);
        return jsonReply(result);
      }
      case "suggest_oversampling_strategy": {
        const parsed = SuggestOversamplingArgs.parse(args);
        const result = suggestOversamplingStrategy({
          distortionType: parsed.distortion_type,
          fundamentalUpperHz: parsed.fundamental_upper_hz,
          sampleRateHz: parsed.sample_rate_hz,
          cpuBudget: parsed.cpu_budget,
          preservePhase: parsed.preserve_phase,
        });
        return jsonReply(result);
      }
      case "check_pluginval_logs": {
        const parsed = CheckPluginvalLogsArgs.parse(args);
        const result = await checkPluginvalLogs({
          logPath: parsed.log_path,
          logContent: parsed.log_content,
        });
        return jsonReply(result);
      }
      default:
        return errorReply(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return errorReply(`Tool '${name}' failed: ${err instanceof Error ? err.message : String(err)}`);
  }
});

function jsonReply(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

function errorReply(message: string) {
  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true,
  };
}

// ---------- Boot ----------

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("audio-plugin-freedom-mcp v0.1.0 ready");
