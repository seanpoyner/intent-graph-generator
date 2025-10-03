#!/usr/bin/env node

/**
 * IntentGraph MCP Server
 * Main entry point for the Model Context Protocol server
 * 
 * Provides composable tools for building and managing intent graphs incrementally
 * Author: Sean Poyner <sean.poyner@pm.me>
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js';


// Initialize MCP Server
const server = new Server(
  {
    name: 'intent-graph-mcp-server',
    version: '2.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

// ============================================================================
// Tool Definitions
// ============================================================================

const TOOL_DEFINITIONS = [
  // V2: Generation
  {
    name: 'generate_intent_graph',
    description: 'Generate a complete intent graph from an orchestration card using Palmyra',
    inputSchema: {
      type: 'object',
      properties: {
        orchestration_card: { type: 'object', description: 'Context for generation (see orchestration-card schema)' },
        options: {
          type: 'object',
          properties: {
            include_artifacts: { type: 'boolean' },
            artifact_types: { type: 'array', items: { type: 'string' } },
            format: { type: 'string', enum: ['json', 'yaml'] },
            validate: { type: 'boolean' },
            optimize: { type: 'boolean' }
          }
        }
      },
      required: ['orchestration_card']
    }
  },

  // V2: Validation
  {
    name: 'validate_graph',
    description: 'Validate a generated intent graph structure and return detailed report',
    inputSchema: {
      type: 'object',
      properties: {
        graph: { type: 'object', description: 'The intent graph to validate' }
      },
      required: ['graph']
    }
  },

  // V2: Analysis
  {
    name: 'analyze_graph',
    description: 'Analyze graph complexity, metrics, and identify optimization opportunities',
    inputSchema: {
      type: 'object',
      properties: {
        graph: { type: 'object', description: 'The intent graph to analyze' },
        analysis_types: {
          type: 'array',
          items: { type: 'string', enum: ['complexity', 'parallel_opportunities', 'critical_path', 'bottlenecks'] },
          description: 'Types of analysis to perform (default: all)'
        }
      },
      required: ['graph']
    }
  },

  // V2: Optimization
  {
    name: 'optimize_graph',
    description: 'Optimize an intent graph by applying improvements and restructuring',
    inputSchema: {
      type: 'object',
      properties: {
        graph: { type: 'object', description: 'The intent graph to optimize' },
        optimization_strategies: {
          type: 'array',
          items: { type: 'string', enum: ['parallelize', 'reduce_latency', 'minimize_cost', 'improve_reliability'] },
          description: 'Optimization strategies to apply (default: all applicable)'
        }
      },
      required: ['graph']
    }
  },

  // V2: Export & Visualization
  {
    name: 'export_graph',
    description: 'Export an intent graph in various formats (json, yaml, dot, mermaid)',
    inputSchema: {
      type: 'object',
      properties: {
        graph: { type: 'object', description: 'The intent graph to export' },
        format: { type: 'string', enum: ['json', 'yaml', 'dot', 'mermaid'], default: 'json' }
      },
      required: ['graph']
    }
  },
  {
    name: 'visualize_graph',
    description: 'Generate Mermaid diagram for intent graph visualization',
    inputSchema: {
      type: 'object',
      properties: {
        graph: { type: 'object', description: 'The intent graph to visualize' },
        options: {
          type: 'object',
          properties: {
            direction: { type: 'string', enum: ['TB', 'LR'], default: 'TB', description: 'Diagram direction (Top-Bottom or Left-Right)' },
            include_metadata: { type: 'boolean', default: false, description: 'Include node metadata in diagram' }
          }
        }
      },
      required: ['graph']
    }
  },

  // V2: Artifacts
  {
    name: 'generate_artifacts',
    description: 'Generate debugging and logging artifacts for a graph generation session',
    inputSchema: {
      type: 'object',
      properties: {
        graph: { type: 'object', description: 'The generated intent graph' },
        orchestration_card: { type: 'object', description: 'The orchestration card used for generation' },
        artifact_types: {
          type: 'array',
          items: { type: 'string', enum: ['reasoning', 'alternatives', 'optimizations', 'execution_trace', 'debug_info'] },
          description: 'Types of artifacts to generate (default: all)'
        }
      },
      required: ['graph', 'orchestration_card']
    }
  }
];

// ============================================================================
// Request Handlers
// ============================================================================

// Handle list_tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('[MCP Server] Received list_tools request');
  return {
    tools: TOOL_DEFINITIONS
  };
});

// Handle call_tool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error(`[MCP Server] Received call_tool request: ${request.params.name}`);

  const { name, arguments: args } = request.params;

  if (!args) {
    throw new McpError(ErrorCode.InvalidParams, 'Missing arguments');
  }

  try {
    let response;

    switch (name) {
      // V2: Generation
      case 'generate_intent_graph':
        response = await (await import('./tools/generate.js')).generateIntentGraphTool({
          orchestration_card: args.orchestration_card as any,
          options: args.options as any
        });
        break;

      // V2: Validation
      case 'validate_graph':
        response = await (await import('./tools/helpers.js')).validateGraphTool({
          graph: args.graph as any
        });
        break;

      // V2: Analysis
      case 'analyze_graph':
        response = await (await import('./tools/helpers.js')).analyzeGraphTool({
          graph: args.graph as any,
          analysis_types: args.analysis_types as any
        });
        break;

      // V2: Optimization
      case 'optimize_graph':
        response = await (await import('./tools/helpers.js')).optimizeGraphTool({
          graph: args.graph as any,
          optimization_strategies: args.optimization_strategies as any
        });
        break;

      // V2: Export
      case 'export_graph':
        response = await (await import('./tools/helpers.js')).exportGraphTool({
          graph: args.graph as any,
          format: args.format as any
        });
        break;

      // V2: Visualization
      case 'visualize_graph':
        response = await (await import('./tools/helpers.js')).visualizeGraphTool({
          graph: args.graph as any,
          options: args.options as any
        });
        break;

      // V2: Artifacts
      case 'generate_artifacts':
        response = await (await import('./tools/helpers.js')).generateArtifactsTool({
          graph: args.graph as any,
          orchestration_card: args.orchestration_card as any,
          artifact_types: args.artifact_types as any
        });
        break;

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }

    // Convert tool response to MCP response format
    if (response.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response.result, null, 2)
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(response.error, null, 2)
          }
        ],
        isError: true
      };
    }
  } catch (error) {
    console.error(`[MCP Server] Error handling tool call: ${error}`);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'An unexpected error occurred',
            details: { error: String(error) }
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

// ============================================================================
// Server Lifecycle
// ============================================================================

async function main(): Promise<void> {
  console.error('[MCP Server] Starting IntentGraph MCP Server v2.0.0');
  console.error('[MCP Server] Available tools: 7');
  console.error('[MCP Server] Transport: stdio');

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[MCP Server] Server connected and ready');
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('[MCP Server] Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[MCP Server] Unhandled rejection:', reason);
  process.exit(1);
});

// Start server
main().catch((error) => {
  console.error('[MCP Server] Fatal error:', error);
  process.exit(1);
});

