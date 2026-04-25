#!/usr/bin/env node
// studio-mcp — MCP server for the studio plugin.
// Provides project-state intelligence + cross-session memory + plugin recommendations.
//
// Tools exposed (under namespace `studio`):
//   recommend_plugins        — inspect filesystem, suggest plugin combo
//   propose_next_action      — read state, suggest next task
//   cross_plugin_search      — grep across project artefacts
//   find_active_phase        — per-domain phase detection
//   track_decision           — persist a decision across sessions
//   list_decisions           — retrieve persisted decisions
//   list_committed_artefacts — categorised inventory of state files
//   get_open_blockers        — what's stopping progress

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { recommendPlugins } from "./tools/recommend-plugins.js";
import { proposeNextAction } from "./tools/propose-next-action.js";
import { crossPluginSearch } from "./tools/cross-plugin-search.js";
import { findActivePhase } from "./tools/find-active-phase.js";
import { trackDecision, getDecisions } from "./tools/track-decision.js";
import { listCommittedArtefacts } from "./tools/list-artefacts.js";
import { getOpenBlockers } from "./tools/get-blockers.js";

// ---------- Tool schemas ----------

const ProjectPathArg = z.object({
  project_path: z.string().describe("Absolute path to the project root directory."),
});

const ProposeNextActionArgs = ProjectPathArg;
const RecommendPluginsArgs = ProjectPathArg;
const FindActivePhaseArgs = ProjectPathArg;
const ListArtefactsArgs = ProjectPathArg;
const GetOpenBlockersArgs = ProjectPathArg;

const CrossPluginSearchArgs = z.object({
  project_path: z.string().describe("Absolute path to the project root."),
  query: z.string().describe("Free-text search query."),
  case_sensitive: z.boolean().optional().describe("Case-sensitive match. Default false."),
  max_hits: z.number().int().positive().optional().describe("Cap on returned hits. Default 50."),
});

const TrackDecisionArgs = z.object({
  project_path: z.string().describe("Absolute path to the project root."),
  type: z.string().describe("Decision category, e.g. 'stack-choice', 'adc-selection', 'concept-pick'."),
  value: z.unknown().describe("The decision value — string, number, object, etc."),
  notes: z.string().optional().describe("Optional rationale or context."),
});

const ListDecisionsArgs = z.object({
  project_path: z.string().describe("Absolute path to the project root."),
  type: z.string().optional().describe("Filter to a specific decision type."),
});

// ---------- Server setup ----------

const server = new Server(
  {
    name: "studio-mcp",
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
      name: "recommend_plugins",
      description:
        "Inspect a project's filesystem and recommend which claude-plugins to load. Detects domains (audio, figma, webapp, cli, hardware, marketing) by examining files (package.json, manifest.json, BOM.csv, POSITIONING.md, etc.) and returns an ordered list with rationale + the exact `claude --plugin-dir` install command.",
      inputSchema: {
        type: "object",
        properties: {
          project_path: { type: "string", description: "Absolute path to the project root directory." },
        },
        required: ["project_path"],
      },
    },
    {
      name: "propose_next_action",
      description:
        "Read project state across all artefacts (CHANGELOG, BACKLOG, HANDOFF docs, git, domain-specific spec files) and propose the next concrete action. Returns: current state synthesis, cross-domain conflicts found, numbered recommended actions with effort estimates + dispatch targets, and risk flags. The orchestration heart of the studio plugin.",
      inputSchema: {
        type: "object",
        properties: {
          project_path: { type: "string", description: "Absolute path to the project root directory." },
        },
        required: ["project_path"],
      },
    },
    {
      name: "cross_plugin_search",
      description:
        "Search across project state files (HANDOFF docs, CHANGELOG, BACKLOG, README, RESEARCH-BRIEF, all spec docs, concepts/, campaigns/, post-mortems/) for a free-text query. Returns hits with path + line number + 3-line context. Useful for 'did we ever decide X' / 'where did we discuss Y' archaeology.",
      inputSchema: {
        type: "object",
        properties: {
          project_path: { type: "string", description: "Absolute path to project root." },
          query: { type: "string", description: "Free-text search query." },
          case_sensitive: { type: "boolean", description: "Case-sensitive match. Default false." },
          max_hits: { type: "number", description: "Cap on returned hits. Default 50." },
        },
        required: ["project_path", "query"],
      },
    },
    {
      name: "find_active_phase",
      description:
        "Per-domain phase detection. For each detected domain (audio, hardware, webapp, etc.), reports current phase, next expected phase, and percent-complete based on which artefacts are committed. Powers cross-domain orchestration — the hardware-orchestrator's 'we're at concept stage; CAD-SPEC next' is now a tool call instead of a re-reading exercise.",
      inputSchema: {
        type: "object",
        properties: {
          project_path: { type: "string", description: "Absolute path to project root." },
        },
        required: ["project_path"],
      },
    },
    {
      name: "track_decision",
      description:
        "Persist a project-level decision across Claude Code sessions. Writes to .claude-state/decisions.jsonl (append-only). Use when the user makes a meaningful decision (chose a stack, picked an IC alternate, selected a concept direction, locked an API contract). Future sessions can retrieve via list_decisions.",
      inputSchema: {
        type: "object",
        properties: {
          project_path: { type: "string", description: "Absolute path to project root." },
          type: { type: "string", description: "Decision category, e.g. 'stack-choice', 'adc-selection', 'concept-pick'." },
          value: { description: "The decision value — string, number, object, etc." },
          notes: { type: "string", description: "Optional rationale or context." },
        },
        required: ["project_path", "type", "value"],
      },
    },
    {
      name: "list_decisions",
      description:
        "Retrieve persisted decisions from .claude-state/decisions.jsonl. Filter by type if specified. Use at session start to remember prior decisions, or when an agent needs context the user once provided.",
      inputSchema: {
        type: "object",
        properties: {
          project_path: { type: "string", description: "Absolute path to project root." },
          type: { type: "string", description: "Filter to a specific decision type." },
        },
        required: ["project_path"],
      },
    },
    {
      name: "list_committed_artefacts",
      description:
        "Returns the inventory of project state files (research, concept, spec, review, handoff, changelog, backlog) grouped by domain. Plus the 5 most recently modified. Useful for orienting a fresh session quickly.",
      inputSchema: {
        type: "object",
        properties: {
          project_path: { type: "string", description: "Absolute path to project root." },
        },
        required: ["project_path"],
      },
    },
    {
      name: "get_open_blockers",
      description:
        "Returns open blockers — handoff docs marked in-progress/blocked, BACKLOG items IN_PROGRESS or BLOCKED, large uncommitted WIP, detected test failures. Severity-labelled (high/medium/low). Use to identify what's stopping forward progress before proposing new work.",
      inputSchema: {
        type: "object",
        properties: {
          project_path: { type: "string", description: "Absolute path to project root." },
        },
        required: ["project_path"],
      },
    },
  ],
}));

// ---------- Tool dispatch ----------

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case "recommend_plugins": {
        const { project_path } = RecommendPluginsArgs.parse(args);
        const result = await recommendPlugins(project_path);
        return jsonReply(result);
      }
      case "propose_next_action": {
        const { project_path } = ProposeNextActionArgs.parse(args);
        const result = await proposeNextAction(project_path);
        return jsonReply(result);
      }
      case "cross_plugin_search": {
        const parsed = CrossPluginSearchArgs.parse(args);
        const result = await crossPluginSearch(parsed.project_path, parsed.query, {
          caseSensitive: parsed.case_sensitive,
          maxHits: parsed.max_hits,
        });
        return jsonReply({ hits: result, count: result.length });
      }
      case "find_active_phase": {
        const { project_path } = FindActivePhaseArgs.parse(args);
        const result = await findActivePhase(project_path);
        return jsonReply({ domains: result });
      }
      case "track_decision": {
        const parsed = TrackDecisionArgs.parse(args);
        const result = await trackDecision(parsed.project_path, parsed.type, parsed.value, parsed.notes);
        return jsonReply(result);
      }
      case "list_decisions": {
        const parsed = ListDecisionsArgs.parse(args);
        const result = await getDecisions(parsed.project_path, parsed.type);
        return jsonReply({ decisions: result, count: result.length });
      }
      case "list_committed_artefacts": {
        const { project_path } = ListArtefactsArgs.parse(args);
        const result = await listCommittedArtefacts(project_path);
        return jsonReply(result);
      }
      case "get_open_blockers": {
        const { project_path } = GetOpenBlockersArgs.parse(args);
        const result = await getOpenBlockers(project_path);
        return jsonReply({ blockers: result, count: result.length });
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

// Log to stderr so it doesn't pollute the stdio protocol channel
console.error("studio-mcp v0.1.0 ready");
