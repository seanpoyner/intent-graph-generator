/**
 * IntentGraph MCP Server - Type Definitions
 * Complete TypeScript types matching IntentGraph Schema v1.0
 */

// Node Types
export type NodeType = "entry" | "processing" | "decision" | "aggregation" | "exit" | "error_handler";
export type AgentType = "llm" | "tool" | "api" | "validator" | "transformer" | "aggregator" | "router" | "custom";
export type SourceType = "request" | "node_output" | "context" | "constant" | "environment";
export type OutputDataType = "string" | "number" | "boolean" | "object" | "array" | "null";
export type ErrorStrategy = "fail" | "fallback" | "skip" | "retry";
export type Priority = "low" | "normal" | "high" | "critical";
export type BackoffStrategy = "fixed" | "exponential" | "linear";

// Edge Types
export type EdgeType = "sequential" | "parallel" | "conditional" | "fallback" | "retry" | "iteration";
export type EvaluationContext = "node_output" | "global_context" | "both";

// Execution Types
export type ExecutionStrategy = "sequential" | "parallel" | "hybrid" | "adaptive";
export type ExecutionMode = "all" | "any" | "race" | "fastest_n";

// Input Mapping
export interface InputMapping {
  source: string;
  source_type: SourceType;
  source_node?: string;
  source_field?: string;
  transformation?: string;
  default_value?: unknown;
  required?: boolean;
}

// Output Definition
export interface OutputDefinition {
  name: string;
  type: OutputDataType;
  description: string;
  schema?: Record<string, unknown>;
}

// Configuration Objects
export interface RetryPolicy {
  max_attempts: number;
  backoff_strategy: BackoffStrategy;
  backoff_ms: number;
}

export interface CachePolicy {
  enabled: boolean;
  ttl_seconds: number;
  cache_key_fields: string[];
}

export interface NodeConfiguration {
  timeout_ms?: number;
  retry_policy?: RetryPolicy;
  cache_policy?: CachePolicy;
}

// Error Handling
export interface ErrorHandling {
  strategy: ErrorStrategy;
  fallback_node?: string;
  error_output?: string;
}

// Node Metadata
export interface NodeMetadata {
  estimated_duration_ms?: number;
  cost_estimate?: number;
  priority?: Priority;
  tags?: string[];
}

// Intent Graph Node
export interface IntentGraphNode {
  node_id: string;
  agent_name: string;
  agent_type?: AgentType;
  node_type: NodeType;
  purpose: string;
  inputs: Record<string, InputMapping>;
  outputs: OutputDefinition[];
  configuration?: NodeConfiguration;
  error_handling?: ErrorHandling;
  metadata?: NodeMetadata;
}

// Edge Condition
export interface EdgeCondition {
  expression: string;
  evaluation_context: EvaluationContext;
}

// Data Mapping
export interface DataMapping {
  from_field: string;
  to_field: string;
  transformation?: string;
}

// Intent Graph Edge
export interface IntentGraphEdge {
  edge_id: string;
  from_node: string;
  to_node: string;
  edge_type: EdgeType;
  condition?: EdgeCondition;
  priority?: number;
  data_mapping?: Record<string, DataMapping>;
}

// Parallel Group
export interface ParallelGroup {
  group_id: string;
  nodes: string[];
  execution_mode: ExecutionMode;
  fastest_n?: number;
}

// Iteration Config
export interface IterationConfig {
  max_iterations: number;
  convergence_criteria: string;
  iteration_nodes: string[];
}

// Execution Plan
export interface ExecutionPlan {
  entry_points: string[];
  exit_points: string[];
  execution_strategy: ExecutionStrategy;
  parallel_groups?: ParallelGroup[];
  critical_path?: string[];
  total_estimated_steps?: number;
  max_parallel_nodes?: number;
  iteration_config?: IterationConfig;
}

// Intent Graph Structure
export interface IntentGraph {
  nodes: IntentGraphNode[];
  edges: IntentGraphEdge[];
  execution_plan: ExecutionPlan;
}

// Complexity Metrics
export interface ComplexityMetrics {
  node_count: number;
  edge_count: number;
  depth: number;
  width?: number;
  complexity_score: number;
  cyclomatic_complexity?: number;
}

// Resource Estimates
export interface ResourceEstimates {
  estimated_duration_ms?: number;
  estimated_cost?: number;
  estimated_tokens?: number;
  estimated_api_calls?: number;
}

// Warning
export interface Warning {
  severity: "low" | "medium" | "high";
  message: string;
  node_id?: string;
}

// Graph Metadata
export interface GraphMetadata {
  graph_id: string;
  version: string;
  created_at: string;
  agent_purpose?: string;
  complexity_metrics: ComplexityMetrics;
  resource_estimates?: ResourceEstimates;
  optimization_notes?: string[];
  warnings?: Warning[];
}

// Validation Check
export interface ValidationCheck {
  check_name: string;
  passed: boolean;
  message?: string;
  details?: Record<string, unknown>;
}

// Validation Result
export interface ValidationResult {
  is_valid: boolean;
  checks_performed: ValidationCheck[];
  validation_timestamp?: string;
}

// Complete Graph Document
export interface IntentGraphDocument {
  intent_graph: IntentGraph;
  metadata: GraphMetadata;
  validation: ValidationResult;
}

// Agent Definition (for creation)
export interface AgentDefinition {
  name: string;
  type: AgentType;
  capabilities: string[];
  input_schema: Record<string, unknown>;
  output_schema: Record<string, unknown>;
}

// Graph Configuration
export interface GraphConfig {
  execution_mode?: ExecutionStrategy;
  error_handling?: ErrorStrategy;
  iteration_count?: number;
}

// Node Config (for add_node)
export interface NodeConfig {
  node_type: NodeType;
  purpose: string;
  inputs?: Record<string, InputMapping>;
  configuration?: NodeConfiguration;
  error_handling?: ErrorHandling;
  metadata?: NodeMetadata;
}

// Edge Config (for add_edge)
export interface EdgeConfig {
  edge_type: EdgeType;
  condition?: EdgeCondition;
  priority?: number;
  data_mapping?: Record<string, DataMapping>;
}

// Graph Store Item
export interface StoredGraph {
  graph_id: string;
  purpose: string;
  available_agents: AgentDefinition[];
  config: GraphConfig;
  document: IntentGraphDocument;
  created_at: Date;
  updated_at: Date;
}

// MCP Tool Response Types
export interface ToolSuccess<T = unknown> {
  success: true;
  result: T;
}

export interface ToolError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ToolResponse<T = unknown> = ToolSuccess<T> | ToolError;

// Optimization Strategy
export type OptimizationStrategy = "parallelization" | "cost_reduction" | "latency_reduction" | "balanced";

// Export Format
export type ExportFormat = "json" | "yaml" | "dot" | "mermaid";

