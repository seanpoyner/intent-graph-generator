/**
 * IntentGraph MCP Tool Handlers
 * All tool implementations for the MCP server
 */

import { storage } from './storage.js';
import {
  generateNodeId,
  generateEdgeId,
  updateGraphMetadata,
  validateGraph,
  calculateCriticalPath,
  findParallelOpportunities
} from './utils.js';
import type {
  AgentDefinition,
  GraphConfig,
  NodeConfig,
  EdgeConfig,
  IntentGraphNode,
  IntentGraphEdge,
  ToolResponse,
  ExportFormat,
  OutputDefinition
} from './types.js';

// ============================================================================
// PHASE 1: Graph Management Tools
// ============================================================================

/**
 * Tool 1: create_graph
 * Initialize a new intent graph with purpose and available agents
 */
export function createGraph(
  purpose: string,
  availableAgents: AgentDefinition[],
  config?: GraphConfig
): ToolResponse {
  try {
    if (!purpose || purpose.trim().length === 0) {
      return {
        success: false,
        error: {
          code: 'INVALID_PURPOSE',
          message: 'Purpose must be a non-empty string'
        }
      };
    }

    if (!Array.isArray(availableAgents) || availableAgents.length === 0) {
      return {
        success: false,
        error: {
          code: 'INVALID_AGENTS',
          message: 'available_agents must be a non-empty array'
        }
      };
    }

    const graphConfig: GraphConfig = {
      execution_mode: config?.execution_mode || 'sequential',
      error_handling: config?.error_handling || 'fail',
      iteration_count: config?.iteration_count || 1
    };

    const stored = storage.create(purpose, availableAgents, graphConfig);

    return {
      success: true,
      result: {
        graph_id: stored.graph_id,
        status: 'initialized',
        metadata: {
          purpose: stored.purpose,
          created_at: stored.created_at.toISOString(),
          agent_count: stored.available_agents.length,
          config: stored.config
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'CREATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to create graph',
        details: { error: String(error) }
      }
    };
  }
}

/**
 * Tool 2: get_graph
 * Retrieve a graph by ID
 */
export function getGraph(graphId: string): ToolResponse {
  try {
    const stored = storage.get(graphId);
    
    if (!stored) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    return {
      success: true,
      result: {
        graph_id: stored.graph_id,
        purpose: stored.purpose,
        config: stored.config,
        document: stored.document,
        created_at: stored.created_at.toISOString(),
        updated_at: stored.updated_at.toISOString()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'GET_FAILED',
        message: error instanceof Error ? error.message : 'Failed to retrieve graph'
      }
    };
  }
}

/**
 * Tool 3: delete_graph
 * Delete a graph by ID
 */
export function deleteGraph(graphId: string): ToolResponse {
  try {
    const deleted = storage.delete(graphId);
    
    if (!deleted) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    return {
      success: true,
      result: {
        graph_id: graphId,
        deleted: true,
        message: 'Graph successfully deleted'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'DELETE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to delete graph'
      }
    };
  }
}

/**
 * Tool 4: list_graphs
 * List all graphs
 */
export function listGraphs(): ToolResponse {
  try {
    const graphs = storage.list();

    return {
      success: true,
      result: {
        count: graphs.length,
        graphs: graphs
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'LIST_FAILED',
        message: error instanceof Error ? error.message : 'Failed to list graphs'
      }
    };
  }
}

// ============================================================================
// PHASE 2: Node Operations
// ============================================================================

/**
 * Tool 5: add_node
 * Add a node to the graph
 */
export function addNode(
  graphId: string,
  agentName: string,
  nodeConfig: NodeConfig
): ToolResponse {
  try {
    const stored = storage.get(graphId);
    if (!stored) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    // Verify agent exists
    const agent = stored.available_agents.find(a => a.name === agentName);
    if (!agent) {
      return {
        success: false,
        error: {
          code: 'AGENT_NOT_FOUND',
          message: `Agent '${agentName}' not found in available_agents`,
          details: {
            available_agents: stored.available_agents.map(a => a.name)
          }
        }
      };
    }

    const nodeId = generateNodeId(agentName);

    // Create outputs from agent schema if not provided
    const outputs: OutputDefinition[] = [];
    if (typeof agent.output_schema === 'object') {
      Object.entries(agent.output_schema).forEach(([name, type]) => {
        outputs.push({
          name,
          type: typeof type === 'string' ? type as OutputDefinition['type'] : 'object',
          description: `Output field: ${name}`
        });
      });
    }

    const node: IntentGraphNode = {
      node_id: nodeId,
      agent_name: agentName,
      agent_type: agent.type,
      node_type: nodeConfig.node_type,
      purpose: nodeConfig.purpose,
      inputs: nodeConfig.inputs || {},
      outputs: outputs.length > 0 ? outputs : [
        { name: 'result', type: 'object', description: 'Agent execution result' }
      ],
      configuration: nodeConfig.configuration,
      error_handling: nodeConfig.error_handling,
      metadata: nodeConfig.metadata
    };

    stored.document.intent_graph.nodes.push(node);
    updateGraphMetadata(stored);
    storage.update(graphId, stored.document);

    return {
      success: true,
      result: {
        node_id: nodeId,
        agent_name: agentName,
        node_type: nodeConfig.node_type,
        status: 'added',
        message: `Node '${nodeId}' successfully added to graph`
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'ADD_NODE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to add node'
      }
    };
  }
}

/**
 * Tool 6: update_node
 * Update an existing node
 */
export function updateNode(
  graphId: string,
  nodeId: string,
  updates: Partial<NodeConfig>
): ToolResponse {
  try {
    const stored = storage.get(graphId);
    if (!stored) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    const nodeIndex = stored.document.intent_graph.nodes.findIndex(n => n.node_id === nodeId);
    if (nodeIndex === -1) {
      return {
        success: false,
        error: {
          code: 'NODE_NOT_FOUND',
          message: `Node with ID '${nodeId}' not found in graph`
        }
      };
    }

    const node = stored.document.intent_graph.nodes[nodeIndex];

    // Apply updates
    if (updates.purpose) node.purpose = updates.purpose;
    if (updates.node_type) node.node_type = updates.node_type;
    if (updates.inputs) node.inputs = { ...node.inputs, ...updates.inputs };
    if (updates.configuration) node.configuration = { ...node.configuration, ...updates.configuration };
    if (updates.error_handling) node.error_handling = { ...node.error_handling, ...updates.error_handling };
    if (updates.metadata) node.metadata = { ...node.metadata, ...updates.metadata };

    updateGraphMetadata(stored);
    storage.update(graphId, stored.document);

    return {
      success: true,
      result: {
        node_id: nodeId,
        status: 'updated',
        message: `Node '${nodeId}' successfully updated`
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UPDATE_NODE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to update node'
      }
    };
  }
}

/**
 * Tool 7: remove_node
 * Remove a node from the graph
 */
export function removeNode(graphId: string, nodeId: string): ToolResponse {
  try {
    const stored = storage.get(graphId);
    if (!stored) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    const nodeIndex = stored.document.intent_graph.nodes.findIndex(n => n.node_id === nodeId);
    if (nodeIndex === -1) {
      return {
        success: false,
        error: {
          code: 'NODE_NOT_FOUND',
          message: `Node with ID '${nodeId}' not found in graph`
        }
      };
    }

    // Remove node
    stored.document.intent_graph.nodes.splice(nodeIndex, 1);

    // Remove edges connected to this node
    const removedEdges = stored.document.intent_graph.edges.filter(
      e => e.from_node === nodeId || e.to_node === nodeId
    );
    stored.document.intent_graph.edges = stored.document.intent_graph.edges.filter(
      e => e.from_node !== nodeId && e.to_node !== nodeId
    );

    updateGraphMetadata(stored);
    storage.update(graphId, stored.document);

    return {
      success: true,
      result: {
        node_id: nodeId,
        status: 'removed',
        removed_edges: removedEdges.map(e => e.edge_id),
        message: `Node '${nodeId}' and ${removedEdges.length} connected edges successfully removed`
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'REMOVE_NODE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to remove node'
      }
    };
  }
}

/**
 * Tool 8: list_nodes
 * List all nodes in a graph
 */
export function listNodes(graphId: string): ToolResponse {
  try {
    const stored = storage.get(graphId);
    if (!stored) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    const nodes = stored.document.intent_graph.nodes.map(n => ({
      node_id: n.node_id,
      agent_name: n.agent_name,
      agent_type: n.agent_type,
      node_type: n.node_type,
      purpose: n.purpose
    }));

    return {
      success: true,
      result: {
        graph_id: graphId,
        count: nodes.length,
        nodes: nodes
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'LIST_NODES_FAILED',
        message: error instanceof Error ? error.message : 'Failed to list nodes'
      }
    };
  }
}

// ============================================================================
// PHASE 2: Edge Operations
// ============================================================================

/**
 * Tool 9: add_edge
 * Add an edge between two nodes
 */
export function addEdge(
  graphId: string,
  fromNode: string,
  toNode: string,
  edgeConfig?: EdgeConfig
): ToolResponse {
  try {
    const stored = storage.get(graphId);
    if (!stored) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    // Verify nodes exist
    const fromNodeExists = stored.document.intent_graph.nodes.some(n => n.node_id === fromNode);
    const toNodeExists = stored.document.intent_graph.nodes.some(n => n.node_id === toNode);

    if (!fromNodeExists || !toNodeExists) {
      return {
        success: false,
        error: {
          code: 'NODE_NOT_FOUND',
          message: `One or both nodes not found: from='${fromNode}', to='${toNode}'`
        }
      };
    }

    const edgeId = generateEdgeId(fromNode, toNode);

    const edge: IntentGraphEdge = {
      edge_id: edgeId,
      from_node: fromNode,
      to_node: toNode,
      edge_type: edgeConfig?.edge_type || 'sequential',
      condition: edgeConfig?.condition,
      priority: edgeConfig?.priority || 1,
      data_mapping: edgeConfig?.data_mapping
    };

    stored.document.intent_graph.edges.push(edge);
    updateGraphMetadata(stored);
    storage.update(graphId, stored.document);

    return {
      success: true,
      result: {
        edge_id: edgeId,
        from_node: fromNode,
        to_node: toNode,
        edge_type: edge.edge_type,
        status: 'added',
        message: `Edge '${edgeId}' successfully added`
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'ADD_EDGE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to add edge'
      }
    };
  }
}

/**
 * Tool 10: update_edge
 * Update an existing edge
 */
export function updateEdge(
  graphId: string,
  edgeId: string,
  updates: Partial<EdgeConfig>
): ToolResponse {
  try {
    const stored = storage.get(graphId);
    if (!stored) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    const edgeIndex = stored.document.intent_graph.edges.findIndex(e => e.edge_id === edgeId);
    if (edgeIndex === -1) {
      return {
        success: false,
        error: {
          code: 'EDGE_NOT_FOUND',
          message: `Edge with ID '${edgeId}' not found in graph`
        }
      };
    }

    const edge = stored.document.intent_graph.edges[edgeIndex];

    // Apply updates
    if (updates.edge_type) edge.edge_type = updates.edge_type;
    if (updates.condition) edge.condition = updates.condition;
    if (updates.priority !== undefined) edge.priority = updates.priority;
    if (updates.data_mapping) edge.data_mapping = { ...edge.data_mapping, ...updates.data_mapping };

    updateGraphMetadata(stored);
    storage.update(graphId, stored.document);

    return {
      success: true,
      result: {
        edge_id: edgeId,
        status: 'updated',
        message: `Edge '${edgeId}' successfully updated`
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UPDATE_EDGE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to update edge'
      }
    };
  }
}

/**
 * Tool 11: remove_edge
 * Remove an edge from the graph
 */
export function removeEdge(graphId: string, edgeId: string): ToolResponse {
  try {
    const stored = storage.get(graphId);
    if (!stored) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    const edgeIndex = stored.document.intent_graph.edges.findIndex(e => e.edge_id === edgeId);
    if (edgeIndex === -1) {
      return {
        success: false,
        error: {
          code: 'EDGE_NOT_FOUND',
          message: `Edge with ID '${edgeId}' not found in graph`
        }
      };
    }

    stored.document.intent_graph.edges.splice(edgeIndex, 1);
    updateGraphMetadata(stored);
    storage.update(graphId, stored.document);

    return {
      success: true,
      result: {
        edge_id: edgeId,
        status: 'removed',
        message: `Edge '${edgeId}' successfully removed`
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'REMOVE_EDGE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to remove edge'
      }
    };
  }
}

/**
 * Tool 12: list_edges
 * List all edges in a graph
 */
export function listEdges(graphId: string): ToolResponse {
  try {
    const stored = storage.get(graphId);
    if (!stored) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    const edges = stored.document.intent_graph.edges.map(e => ({
      edge_id: e.edge_id,
      from_node: e.from_node,
      to_node: e.to_node,
      edge_type: e.edge_type,
      has_condition: !!e.condition
    }));

    return {
      success: true,
      result: {
        graph_id: graphId,
        count: edges.length,
        edges: edges
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'LIST_EDGES_FAILED',
        message: error instanceof Error ? error.message : 'Failed to list edges'
      }
    };
  }
}

// ============================================================================
// PHASE 3: Validation & Analysis Tools
// ============================================================================

/**
 * Tool 13: validate_graph
 * Validate graph structure and return detailed report
 */
export function validateGraphTool(graphId: string): ToolResponse {
  try {
    const stored = storage.get(graphId);
    if (!stored) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    const validation = validateGraph(stored.document);

    return {
      success: true,
      result: {
        graph_id: graphId,
        ...validation
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_FAILED',
        message: error instanceof Error ? error.message : 'Failed to validate graph'
      }
    };
  }
}

/**
 * Tool 14: analyze_complexity
 * Calculate complexity metrics for the graph
 */
export function analyzeComplexity(graphId: string): ToolResponse {
  try {
    const stored = storage.get(graphId);
    if (!stored) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    const metrics = stored.document.metadata.complexity_metrics;
    const estimates = stored.document.metadata.resource_estimates;

    return {
      success: true,
      result: {
        graph_id: graphId,
        complexity_metrics: metrics,
        resource_estimates: estimates,
        complexity_rating: metrics.complexity_score < 30 ? 'low' :
                          metrics.complexity_score < 60 ? 'medium' : 'high'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'ANALYSIS_FAILED',
        message: error instanceof Error ? error.message : 'Failed to analyze complexity'
      }
    };
  }
}

/**
 * Tool 15: find_parallel_opportunities
 * Find opportunities for parallel execution
 */
export function findParallelOpportunitiesTool(graphId: string): ToolResponse {
  try {
    const stored = storage.get(graphId);
    if (!stored) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    const opportunities = findParallelOpportunities(
      stored.document.intent_graph.nodes,
      stored.document.intent_graph.edges
    );

    return {
      success: true,
      result: {
        graph_id: graphId,
        count: opportunities.length,
        opportunities: opportunities,
        message: opportunities.length === 0
          ? 'No parallelization opportunities found'
          : `Found ${opportunities.length} parallelization opportunities`
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'ANALYSIS_FAILED',
        message: error instanceof Error ? error.message : 'Failed to find parallel opportunities'
      }
    };
  }
}

/**
 * Tool 16: calculate_critical_path
 * Calculate the critical path through the graph
 */
export function calculateCriticalPathTool(graphId: string): ToolResponse {
  try {
    const stored = storage.get(graphId);
    if (!stored) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    const criticalPath = calculateCriticalPath(
      stored.document.intent_graph.nodes,
      stored.document.intent_graph.edges
    );

    return {
      success: true,
      result: {
        graph_id: graphId,
        critical_path: criticalPath,
        length: criticalPath.length,
        message: `Critical path contains ${criticalPath.length} nodes`
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'ANALYSIS_FAILED',
        message: error instanceof Error ? error.message : 'Failed to calculate critical path'
      }
    };
  }
}

// ============================================================================
// PHASE 4: Optimization Tools
// ============================================================================

/**
 * Tool 17: suggest_improvements
 * Suggest improvements for the graph
 */
export function suggestImprovements(graphId: string): ToolResponse {
  try {
    const stored = storage.get(graphId);
    if (!stored) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    const suggestions: string[] = [];
    const { nodes, edges } = stored.document.intent_graph;
    const { complexity_metrics } = stored.document.metadata;

    // Check for parallelization
    const parallelOpps = findParallelOpportunities(nodes, edges);
    if (parallelOpps.length > 0) {
      suggestions.push(`Found ${parallelOpps.length} opportunities to parallelize sequential operations`);
    }

    // Check complexity
    if (complexity_metrics.complexity_score > 70) {
      suggestions.push('High complexity detected - consider breaking into smaller sub-graphs');
    }

    // Check for error handling
    const nodesWithoutErrorHandling = nodes.filter(n => !n.error_handling);
    if (nodesWithoutErrorHandling.length > 0) {
      suggestions.push(`${nodesWithoutErrorHandling.length} nodes lack error handling strategies`);
    }

    // Check for missing timeouts
    const nodesWithoutTimeouts = nodes.filter(n => !n.configuration?.timeout_ms);
    if (nodesWithoutTimeouts.length > 0) {
      suggestions.push(`${nodesWithoutTimeouts.length} nodes lack timeout configuration`);
    }

    // Check for orphaned nodes
    if (nodes.length > 0 && edges.length === 0) {
      suggestions.push('Graph has nodes but no edges - nodes are disconnected');
    }

    if (suggestions.length === 0) {
      suggestions.push('Graph is well-optimized - no improvements suggested');
    }

    return {
      success: true,
      result: {
        graph_id: graphId,
        suggestions: suggestions,
        count: suggestions.length
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'SUGGESTION_FAILED',
        message: error instanceof Error ? error.message : 'Failed to suggest improvements'
      }
    };
  }
}

// ============================================================================
// PHASE 5: Export Tools
// ============================================================================

/**
 * Tool 18: export_graph
 * Export graph in various formats
 */
export function exportGraph(graphId: string, format: ExportFormat = 'json'): ToolResponse {
  try {
    const stored = storage.get(graphId);
    if (!stored) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    let exported: string;

    switch (format) {
      case 'json':
        exported = JSON.stringify(stored.document, null, 2);
        break;

      case 'yaml':
        // Simple YAML conversion (for basic cases)
        exported = jsonToYaml(stored.document);
        break;

      case 'dot':
        // GraphViz DOT format
        exported = generateDotFormat(stored.document);
        break;

      case 'mermaid':
        // Mermaid diagram format
        exported = generateMermaidDiagram(stored.document);
        break;

      default:
        return {
          success: false,
          error: {
            code: 'INVALID_FORMAT',
            message: `Unsupported export format: ${format}`
          }
        };
    }

    return {
      success: true,
      result: {
        graph_id: graphId,
        format: format,
        content: exported
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'EXPORT_FAILED',
        message: error instanceof Error ? error.message : 'Failed to export graph'
      }
    };
  }
}

/**
 * Tool 19: visualize_graph
 * Generate Mermaid diagram for visualization
 */
export function visualizeGraph(graphId: string): ToolResponse {
  try {
    const stored = storage.get(graphId);
    if (!stored) {
      return {
        success: false,
        error: {
          code: 'GRAPH_NOT_FOUND',
          message: `Graph with ID '${graphId}' not found`
        }
      };
    }

    const mermaid = generateMermaidDiagram(stored.document);

    return {
      success: true,
      result: {
        graph_id: graphId,
        mermaid_diagram: mermaid,
        message: 'Paste the diagram code into a Mermaid renderer to visualize'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'VISUALIZATION_FAILED',
        message: error instanceof Error ? error.message : 'Failed to visualize graph'
      }
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function jsonToYaml(obj: unknown, indent = 0): string {
  const spaces = ' '.repeat(indent);
  
  if (obj === null) return 'null';
  if (typeof obj !== 'object') return String(obj);
  if (Array.isArray(obj)) {
    return obj.map(item => `\n${spaces}- ${jsonToYaml(item, indent + 2)}`).join('');
  }

  return Object.entries(obj as Record<string, unknown>)
    .map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `\n${spaces}${key}:${jsonToYaml(value, indent + 2)}`;
      }
      return `\n${spaces}${key}: ${value}`;
    })
    .join('');
}

function generateDotFormat(doc: { intent_graph: { nodes: IntentGraphNode[]; edges: IntentGraphEdge[] } }): string {
  let dot = 'digraph IntentGraph {\n';
  dot += '  rankdir=LR;\n';
  dot += '  node [shape=box, style=rounded];\n\n';

  // Add nodes
  doc.intent_graph.nodes.forEach(node => {
    const label = `${node.agent_name}\\n(${node.node_type})`;
    dot += `  "${node.node_id}" [label="${label}"];\n`;
  });

  dot += '\n';

  // Add edges
  doc.intent_graph.edges.forEach(edge => {
    const style = edge.edge_type === 'parallel' ? 'dashed' : 'solid';
    dot += `  "${edge.from_node}" -> "${edge.to_node}" [style=${style}, label="${edge.edge_type}"];\n`;
  });

  dot += '}\n';
  return dot;
}

function generateMermaidDiagram(doc: { intent_graph: { nodes: IntentGraphNode[]; edges: IntentGraphEdge[] } }): string {
  let mermaid = 'graph LR\n';

  // Add nodes with styling
  doc.intent_graph.nodes.forEach(node => {
    const shape = node.node_type === 'entry' ? '([' :
                  node.node_type === 'exit' ? '])' :
                  node.node_type === 'decision' ? '{' : '[';
    const endShape = node.node_type === 'entry' ? '])' :
                     node.node_type === 'exit' ? '](' :
                     node.node_type === 'decision' ? '}' : ']';

    mermaid += `  ${node.node_id}${shape}"${node.agent_name}<br/>${node.node_type}"${endShape}\n`;
  });

  // Add edges
  doc.intent_graph.edges.forEach(edge => {
    const arrow = edge.edge_type === 'parallel' ? '-.->|' :
                  edge.edge_type === 'conditional' ? '-->|' :
                  '-->|';
    const label = edge.edge_type;
    mermaid += `  ${edge.from_node} ${arrow}${label}| ${edge.to_node}\n`;
  });

  return mermaid;
}

