/**
 * IntentGraph Storage Manager
 * In-memory storage for graph instances with CRUD operations
 */

import type { StoredGraph, IntentGraphDocument, AgentDefinition, GraphConfig } from './types.js';

export class GraphStorage {
  private graphs: Map<string, StoredGraph>;
  private idCounter: number;

  constructor() {
    this.graphs = new Map();
    this.idCounter = 1;
    console.error('[GraphStorage] Initialized');
  }

  /**
   * Generate unique graph ID
   */
  private generateGraphId(): string {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const id = `graph_${timestamp}_${String(this.idCounter).padStart(3, '0')}`;
    this.idCounter++;
    return id;
  }

  /**
   * Create and store a new graph
   */
  create(purpose: string, agents: AgentDefinition[], config: GraphConfig): StoredGraph {
    const graphId = this.generateGraphId();
    const now = new Date();

    // Initialize empty graph document
    const document: IntentGraphDocument = {
      intent_graph: {
        nodes: [],
        edges: [],
        execution_plan: {
          entry_points: [],
          exit_points: [],
          execution_strategy: config.execution_mode || 'sequential',
          parallel_groups: [],
          critical_path: [],
          total_estimated_steps: 0,
          max_parallel_nodes: 1
        }
      },
      metadata: {
        graph_id: graphId,
        version: '1.0.0',
        created_at: now.toISOString(),
        agent_purpose: purpose,
        complexity_metrics: {
          node_count: 0,
          edge_count: 0,
          depth: 0,
          width: 0,
          complexity_score: 0,
          cyclomatic_complexity: 1
        },
        resource_estimates: {
          estimated_duration_ms: 0,
          estimated_cost: 0,
          estimated_tokens: 0,
          estimated_api_calls: 0
        },
        optimization_notes: [],
        warnings: []
      },
      validation: {
        is_valid: true,
        checks_performed: [],
        validation_timestamp: now.toISOString()
      }
    };

    const stored: StoredGraph = {
      graph_id: graphId,
      purpose,
      available_agents: agents,
      config,
      document,
      created_at: now,
      updated_at: now
    };

    this.graphs.set(graphId, stored);
    console.error(`[GraphStorage] Created graph: ${graphId}`);
    return stored;
  }

  /**
   * Get a graph by ID
   */
  get(graphId: string): StoredGraph | undefined {
    return this.graphs.get(graphId);
  }

  /**
   * Update a graph
   */
  update(graphId: string, document: IntentGraphDocument): boolean {
    const stored = this.graphs.get(graphId);
    if (!stored) {
      return false;
    }

    stored.document = document;
    stored.updated_at = new Date();
    this.graphs.set(graphId, stored);
    console.error(`[GraphStorage] Updated graph: ${graphId}`);
    return true;
  }

  /**
   * Delete a graph
   */
  delete(graphId: string): boolean {
    const deleted = this.graphs.delete(graphId);
    if (deleted) {
      console.error(`[GraphStorage] Deleted graph: ${graphId}`);
    }
    return deleted;
  }

  /**
   * List all graphs
   */
  list(): Array<{ graph_id: string; purpose: string; created_at: string; node_count: number; edge_count: number }> {
    return Array.from(this.graphs.values()).map(g => ({
      graph_id: g.graph_id,
      purpose: g.purpose,
      created_at: g.created_at.toISOString(),
      node_count: g.document.metadata.complexity_metrics.node_count,
      edge_count: g.document.metadata.complexity_metrics.edge_count
    }));
  }

  /**
   * Get graph count
   */
  count(): number {
    return this.graphs.size;
  }

  /**
   * Clear all graphs (for testing)
   */
  clear(): void {
    this.graphs.clear();
    this.idCounter = 1;
    console.error('[GraphStorage] Cleared all graphs');
  }
}

// Singleton instance
export const storage = new GraphStorage();

