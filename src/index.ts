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

import * as tools from './tools.js';
import type { AgentDefinition, GraphConfig, NodeConfig, EdgeConfig } from './types.js';

// Initialize MCP Server
const server = new Server(
  {
    name: 'intent-graph-mcp-server',
    version: '1.0.0'
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
  // Phase 1: Graph Management
  {
    name: 'create_graph',
    description: 'Initialize a new intent graph with purpose and available agents',
    inputSchema: {
      type: 'object',
      properties: {
        purpose: {
          type: 'string',
          description: 'High-level objective for the graph'
        },
        available_agents: {
          type: 'array',
          description: 'List of agents that can be used in the graph',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Agent name' },
              type: { type: 'string', enum: ['llm', 'tool', 'api', 'validator', 'transformer', 'aggregator', 'router', 'custom'] },
              capabilities: { type: 'array', items: { type: 'string' } },
              input_schema: { type: 'object' },
              output_schema: { type: 'object' }
            },
            required: ['name', 'type', 'capabilities', 'input_schema', 'output_schema']
          }
        },
        config: {
          type: 'object',
          description: 'Graph configuration options',
          properties: {
            execution_mode: { type: 'string', enum: ['sequential', 'parallel', 'hybrid', 'adaptive'] },
            error_handling: { type: 'string', enum: ['fail', 'fallback', 'skip', 'retry'] },
            iteration_count: { type: 'integer', minimum: 1, maximum: 10 }
          }
        }
      },
      required: ['purpose', 'available_agents']
    }
  },
  {
    name: 'get_graph',
    description: 'Retrieve a graph by its ID',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph to retrieve' }
      },
      required: ['graph_id']
    }
  },
  {
    name: 'delete_graph',
    description: 'Delete a graph by its ID',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph to delete' }
      },
      required: ['graph_id']
    }
  },
  {
    name: 'list_graphs',
    description: 'List all graphs with summary information',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },

  // Phase 2: Node Operations
  {
    name: 'add_node',
    description: 'Add a node to the graph representing an agent execution',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph to modify' },
        agent_name: { type: 'string', description: 'Name of agent (must be in available_agents)' },
        node_config: {
          type: 'object',
          properties: {
            node_type: { type: 'string', enum: ['entry', 'processing', 'decision', 'aggregation', 'exit', 'error_handler'] },
            purpose: { type: 'string', description: 'Clear description of node\'s objective' },
            inputs: { type: 'object', description: 'Input parameter mappings' },
            configuration: {
              type: 'object',
              properties: {
                timeout_ms: { type: 'integer', minimum: 100, maximum: 300000 },
                retry_policy: {
                  type: 'object',
                  properties: {
                    max_attempts: { type: 'integer', minimum: 1, maximum: 5 },
                    backoff_strategy: { type: 'string', enum: ['fixed', 'exponential', 'linear'] },
                    backoff_ms: { type: 'integer', minimum: 100 }
                  }
                }
              }
            },
            error_handling: {
              type: 'object',
              properties: {
                strategy: { type: 'string', enum: ['fail', 'fallback', 'skip', 'retry'] },
                fallback_node: { type: 'string' },
                error_output: { type: 'string' }
              }
            },
            metadata: {
              type: 'object',
              properties: {
                estimated_duration_ms: { type: 'integer' },
                cost_estimate: { type: 'number' },
                priority: { type: 'string', enum: ['low', 'normal', 'high', 'critical'] },
                tags: { type: 'array', items: { type: 'string' } }
              }
            }
          },
          required: ['node_type', 'purpose']
        }
      },
      required: ['graph_id', 'agent_name', 'node_config']
    }
  },
  {
    name: 'update_node',
    description: 'Update an existing node in the graph',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph' },
        node_id: { type: 'string', description: 'ID of the node to update' },
        updates: {
          type: 'object',
          description: 'Fields to update',
          properties: {
            purpose: { type: 'string' },
            node_type: { type: 'string', enum: ['entry', 'processing', 'decision', 'aggregation', 'exit', 'error_handler'] },
            inputs: { type: 'object' },
            configuration: { type: 'object' },
            error_handling: { type: 'object' },
            metadata: { type: 'object' }
          }
        }
      },
      required: ['graph_id', 'node_id', 'updates']
    }
  },
  {
    name: 'remove_node',
    description: 'Remove a node from the graph (also removes connected edges)',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph' },
        node_id: { type: 'string', description: 'ID of the node to remove' }
      },
      required: ['graph_id', 'node_id']
    }
  },
  {
    name: 'list_nodes',
    description: 'List all nodes in a graph',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph' }
      },
      required: ['graph_id']
    }
  },

  // Phase 2: Edge Operations
  {
    name: 'add_edge',
    description: 'Create an edge connecting two nodes',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph' },
        from_node: { type: 'string', description: 'Source node ID' },
        to_node: { type: 'string', description: 'Target node ID' },
        edge_config: {
          type: 'object',
          properties: {
            edge_type: { type: 'string', enum: ['sequential', 'parallel', 'conditional', 'fallback', 'retry', 'iteration'] },
            condition: {
              type: 'object',
              properties: {
                expression: { type: 'string', description: 'Boolean expression to evaluate' },
                evaluation_context: { type: 'string', enum: ['node_output', 'global_context', 'both'] }
              }
            },
            priority: { type: 'integer', description: 'Execution priority when multiple edges available' },
            data_mapping: { type: 'object', description: 'Explicit data transformations between nodes' }
          }
        }
      },
      required: ['graph_id', 'from_node', 'to_node']
    }
  },
  {
    name: 'update_edge',
    description: 'Update an existing edge in the graph',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph' },
        edge_id: { type: 'string', description: 'ID of the edge to update' },
        updates: {
          type: 'object',
          description: 'Fields to update',
          properties: {
            edge_type: { type: 'string', enum: ['sequential', 'parallel', 'conditional', 'fallback', 'retry', 'iteration'] },
            condition: { type: 'object' },
            priority: { type: 'integer' },
            data_mapping: { type: 'object' }
          }
        }
      },
      required: ['graph_id', 'edge_id', 'updates']
    }
  },
  {
    name: 'remove_edge',
    description: 'Remove an edge from the graph',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph' },
        edge_id: { type: 'string', description: 'ID of the edge to remove' }
      },
      required: ['graph_id', 'edge_id']
    }
  },
  {
    name: 'list_edges',
    description: 'List all edges in a graph',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph' }
      },
      required: ['graph_id']
    }
  },

  // Phase 3: Validation & Analysis
  {
    name: 'validate_graph',
    description: 'Validate graph structure and return detailed report',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph to validate' }
      },
      required: ['graph_id']
    }
  },
  {
    name: 'analyze_complexity',
    description: 'Calculate complexity metrics for the graph',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph to analyze' }
      },
      required: ['graph_id']
    }
  },
  {
    name: 'find_parallel_opportunities',
    description: 'Find opportunities for parallel execution in the graph',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph to analyze' }
      },
      required: ['graph_id']
    }
  },
  {
    name: 'calculate_critical_path',
    description: 'Calculate the critical path (longest path) through the graph',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph to analyze' }
      },
      required: ['graph_id']
    }
  },

  // Phase 4: Optimization
  {
    name: 'suggest_improvements',
    description: 'Analyze graph and suggest improvements for optimization',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph to analyze' }
      },
      required: ['graph_id']
    }
  },

  // Phase 5: Export & Visualization
  {
    name: 'export_graph',
    description: 'Export graph in various formats (json, yaml, dot, mermaid)',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph to export' },
        format: { type: 'string', enum: ['json', 'yaml', 'dot', 'mermaid'], default: 'json' }
      },
      required: ['graph_id']
    }
  },
  {
    name: 'visualize_graph',
    description: 'Generate Mermaid diagram for graph visualization',
    inputSchema: {
      type: 'object',
      properties: {
        graph_id: { type: 'string', description: 'ID of the graph to visualize' }
      },
      required: ['graph_id']
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
      // Phase 1: Graph Management
      case 'create_graph':
        response = tools.createGraph(
          args.purpose as string,
          args.available_agents as AgentDefinition[],
          args.config as GraphConfig
        );
        break;

      case 'get_graph':
        response = tools.getGraph(args.graph_id as string);
        break;

      case 'delete_graph':
        response = tools.deleteGraph(args.graph_id as string);
        break;

      case 'list_graphs':
        response = tools.listGraphs();
        break;

      // Phase 2: Node Operations
      case 'add_node':
        response = tools.addNode(
          args.graph_id as string,
          args.agent_name as string,
          args.node_config as NodeConfig
        );
        break;

      case 'update_node':
        response = tools.updateNode(
          args.graph_id as string,
          args.node_id as string,
          args.updates as Partial<NodeConfig>
        );
        break;

      case 'remove_node':
        response = tools.removeNode(
          args.graph_id as string,
          args.node_id as string
        );
        break;

      case 'list_nodes':
        response = tools.listNodes(args.graph_id as string);
        break;

      // Phase 2: Edge Operations
      case 'add_edge':
        response = tools.addEdge(
          args.graph_id as string,
          args.from_node as string,
          args.to_node as string,
          args.edge_config as EdgeConfig
        );
        break;

      case 'update_edge':
        response = tools.updateEdge(
          args.graph_id as string,
          args.edge_id as string,
          args.updates as Partial<EdgeConfig>
        );
        break;

      case 'remove_edge':
        response = tools.removeEdge(
          args.graph_id as string,
          args.edge_id as string
        );
        break;

      case 'list_edges':
        response = tools.listEdges(args.graph_id as string);
        break;

      // Phase 3: Validation & Analysis
      case 'validate_graph':
        response = tools.validateGraphTool(args.graph_id as string);
        break;

      case 'analyze_complexity':
        response = tools.analyzeComplexity(args.graph_id as string);
        break;

      case 'find_parallel_opportunities':
        response = tools.findParallelOpportunitiesTool(args.graph_id as string);
        break;

      case 'calculate_critical_path':
        response = tools.calculateCriticalPathTool(args.graph_id as string);
        break;

      // Phase 4: Optimization
      case 'suggest_improvements':
        response = tools.suggestImprovements(args.graph_id as string);
        break;

      // Phase 5: Export & Visualization
      case 'export_graph':
        response = tools.exportGraph(
          args.graph_id as string,
          (args.format as 'json' | 'yaml' | 'dot' | 'mermaid') || 'json'
        );
        break;

      case 'visualize_graph':
        response = tools.visualizeGraph(args.graph_id as string);
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
  console.error('[MCP Server] Starting IntentGraph MCP Server v1.0.0');
  console.error('[MCP Server] Available tools: 19');
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

