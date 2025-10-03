#!/usr/bin/env node

/**
 * IntentGraph MCP Server - Comprehensive Test Suite
 * Tests all 19 tools with success and failure scenarios
 */

import { storage } from './storage.js';
import * as tools from './tools.js';
import {
  TestRunner,
  assertEquals,
  assertNotNull,
  assertSuccess,
  assertFailure,
  assertErrorCode,
  assertGreaterThan,
  assertContains,
  sampleAgents,
  sampleConfig,
  parallelAgents,
  generateTestPurpose
} from './test-utils.js';
import type { NodeConfig, EdgeConfig } from './types.js';

// ============================================================================
// Test Suite Setup
// ============================================================================

const runner = new TestRunner();
let testGraphId: string;
let testNodeIds: string[] = [];
let testEdgeIds: string[] = [];

// ============================================================================
// PHASE 1: Graph Management Tests
// ============================================================================

async function testGraphManagement(): Promise<void> {
  runner.setSuite('Phase 1: Graph Management');

  await runner.run('create_graph - success', () => {
    const response = tools.createGraph(
      generateTestPurpose('Graph1'),
      sampleAgents,
      sampleConfig
    );

    assertSuccess(response);
    
    const result = response.result as { graph_id: string; status: string };
    assertNotNull(result.graph_id, 'Should have graph_id');
    assertEquals(result.status, 'initialized', 'Status should be initialized');
    
    testGraphId = result.graph_id;
    console.error(`   Created graph: ${testGraphId}`);
  });

  await runner.run('create_graph - empty purpose fails', () => {
    const response = tools.createGraph('', sampleAgents, sampleConfig);
    assertFailure(response);
    assertErrorCode(response as never, 'INVALID_PURPOSE');
  });

  await runner.run('create_graph - empty agents fails', () => {
    const response = tools.createGraph('Test purpose', [], sampleConfig);
    assertFailure(response);
    assertErrorCode(response as never, 'INVALID_AGENTS');
  });

  await runner.run('get_graph - success', () => {
    const response = tools.getGraph(testGraphId);
    assertSuccess(response);
    
    const result = response.result as { graph_id: string; purpose: string };
    assertEquals(result.graph_id, testGraphId);
    assertContains(result.purpose, 'Graph1');
  });

  await runner.run('get_graph - not found', () => {
    const response = tools.getGraph('invalid_graph_id');
    assertFailure(response);
    assertErrorCode(response as never, 'GRAPH_NOT_FOUND');
  });

  await runner.run('list_graphs - success', () => {
    const response = tools.listGraphs();
    assertSuccess(response);
    
    const result = response.result as { count: number; graphs: unknown[] };
    assertGreaterThan(result.count, 0, 'Should have at least one graph');
    assertEquals(result.graphs.length, result.count);
  });
}

// ============================================================================
// PHASE 2: Node Operations Tests
// ============================================================================

async function testNodeOperations(): Promise<void> {
  runner.setSuite('Phase 2: Node Operations');

  await runner.run('add_node - entry node success', () => {
    const nodeConfig: NodeConfig = {
      node_type: 'entry',
      purpose: 'Validate incoming order data',
      inputs: {
        order: {
          source: 'params.order',
          source_type: 'request',
          required: true
        }
      },
      metadata: {
        priority: 'high',
        estimated_duration_ms: 500
      }
    };

    const response = tools.addNode(testGraphId, 'OrderValidator', nodeConfig);
    assertSuccess(response);
    
    const result = response.result as { node_id: string; status: string };
    assertNotNull(result.node_id);
    assertEquals(result.status, 'added');
    
    testNodeIds.push(result.node_id);
    console.error(`   Created node: ${result.node_id}`);
  });

  await runner.run('add_node - processing node success', () => {
    const nodeConfig: NodeConfig = {
      node_type: 'processing',
      purpose: 'Check inventory availability',
      inputs: {
        product_ids: {
          source: `${testNodeIds[0]}.validated_order.items`,
          source_type: 'node_output',
          source_node: testNodeIds[0],
          required: true
        }
      }
    };

    const response = tools.addNode(testGraphId, 'InventoryChecker', nodeConfig);
    assertSuccess(response);
    
    const result = response.result as { node_id: string };
    testNodeIds.push(result.node_id);
  });

  await runner.run('add_node - exit node success', () => {
    const nodeConfig: NodeConfig = {
      node_type: 'exit',
      purpose: 'Send confirmation notification'
    };

    const response = tools.addNode(testGraphId, 'NotificationService', nodeConfig);
    assertSuccess(response);
    
    const result = response.result as { node_id: string };
    testNodeIds.push(result.node_id);
  });

  await runner.run('add_node - invalid graph', () => {
    const nodeConfig: NodeConfig = {
      node_type: 'processing',
      purpose: 'Test node'
    };

    const response = tools.addNode('invalid_id', 'OrderValidator', nodeConfig);
    assertFailure(response);
    assertErrorCode(response as never, 'GRAPH_NOT_FOUND');
  });

  await runner.run('add_node - invalid agent', () => {
    const nodeConfig: NodeConfig = {
      node_type: 'processing',
      purpose: 'Test node'
    };

    const response = tools.addNode(testGraphId, 'NonexistentAgent', nodeConfig);
    assertFailure(response);
    assertErrorCode(response as never, 'AGENT_NOT_FOUND');
  });

  await runner.run('list_nodes - success', () => {
    const response = tools.listNodes(testGraphId);
    assertSuccess(response);
    
    const result = response.result as { count: number; nodes: unknown[] };
    assertEquals(result.count, 3, 'Should have 3 nodes');
  });

  await runner.run('update_node - success', () => {
    const updates = {
      purpose: 'Updated purpose: Validate and sanitize order data',
      metadata: {
        priority: 'critical' as const,
        tags: ['validation', 'security']
      }
    };

    const response = tools.updateNode(testGraphId, testNodeIds[0], updates);
    assertSuccess(response);
  });

  await runner.run('update_node - invalid node', () => {
    const response = tools.updateNode(testGraphId, 'invalid_node_id', { purpose: 'test' });
    assertFailure(response);
    assertErrorCode(response as never, 'NODE_NOT_FOUND');
  });
}

// ============================================================================
// PHASE 3: Edge Operations Tests
// ============================================================================

async function testEdgeOperations(): Promise<void> {
  runner.setSuite('Phase 3: Edge Operations');

  await runner.run('add_edge - sequential edge success', () => {
    const edgeConfig: EdgeConfig = {
      edge_type: 'sequential',
      priority: 1
    };

    const response = tools.addEdge(
      testGraphId,
      testNodeIds[0],
      testNodeIds[1],
      edgeConfig
    );

    assertSuccess(response);
    const result = response.result as { edge_id: string; status: string };
    assertNotNull(result.edge_id);
    
    testEdgeIds.push(result.edge_id);
    console.error(`   Created edge: ${result.edge_id}`);
  });

  await runner.run('add_edge - conditional edge success', () => {
    const edgeConfig: EdgeConfig = {
      edge_type: 'conditional',
      condition: {
        expression: `${testNodeIds[1]}.in_stock === true`,
        evaluation_context: 'node_output'
      },
      priority: 1
    };

    const response = tools.addEdge(
      testGraphId,
      testNodeIds[1],
      testNodeIds[2],
      edgeConfig
    );

    assertSuccess(response);
    const result = response.result as { edge_id: string };
    testEdgeIds.push(result.edge_id);
  });

  await runner.run('add_edge - invalid from_node', () => {
    const response = tools.addEdge(testGraphId, 'invalid_node', testNodeIds[0]);
    assertFailure(response);
    assertErrorCode(response as never, 'NODE_NOT_FOUND');
  });

  await runner.run('add_edge - invalid to_node', () => {
    const response = tools.addEdge(testGraphId, testNodeIds[0], 'invalid_node');
    assertFailure(response);
    assertErrorCode(response as never, 'NODE_NOT_FOUND');
  });

  await runner.run('list_edges - success', () => {
    const response = tools.listEdges(testGraphId);
    assertSuccess(response);
    
    const result = response.result as { count: number; edges: unknown[] };
    assertEquals(result.count, 2, 'Should have 2 edges');
  });

  await runner.run('update_edge - success', () => {
    const updates: Partial<EdgeConfig> = {
      priority: 10,
      edge_type: 'conditional',
      condition: {
        expression: `${testNodeIds[0]}.is_valid === true`,
        evaluation_context: 'node_output'
      }
    };

    const response = tools.updateEdge(testGraphId, testEdgeIds[0], updates);
    assertSuccess(response);
  });

  await runner.run('update_edge - invalid edge', () => {
    const response = tools.updateEdge(testGraphId, 'invalid_edge_id', { priority: 5 });
    assertFailure(response);
    assertErrorCode(response as never, 'EDGE_NOT_FOUND');
  });
}

// ============================================================================
// PHASE 4: Validation & Analysis Tests
// ============================================================================

async function testValidationAndAnalysis(): Promise<void> {
  runner.setSuite('Phase 4: Validation & Analysis');

  await runner.run('validate_graph - success', () => {
    const response = tools.validateGraphTool(testGraphId);
    assertSuccess(response);
    
    const result = response.result as { is_valid: boolean; checks_performed: unknown[] };
    assertEquals(result.is_valid, true, 'Graph should be valid');
    assertGreaterThan(result.checks_performed.length, 0, 'Should have validation checks');
  });

  await runner.run('validate_graph - invalid graph', () => {
    const response = tools.validateGraphTool('invalid_graph_id');
    assertFailure(response);
    assertErrorCode(response as never, 'GRAPH_NOT_FOUND');
  });

  await runner.run('analyze_complexity - success', () => {
    const response = tools.analyzeComplexity(testGraphId);
    assertSuccess(response);
    
    const result = response.result as { 
      complexity_metrics: { node_count: number; edge_count: number; complexity_score: number };
    };
    assertEquals(result.complexity_metrics.node_count, 3);
    assertEquals(result.complexity_metrics.edge_count, 2);
    assertGreaterThan(result.complexity_metrics.complexity_score, 0);
  });

  await runner.run('find_parallel_opportunities - success', () => {
    const response = tools.findParallelOpportunitiesTool(testGraphId);
    assertSuccess(response);
    
    const result = response.result as { count: number; opportunities: unknown[] };
    assertEquals(result.opportunities.length, result.count);
  });

  await runner.run('calculate_critical_path - success', () => {
    const response = tools.calculateCriticalPathTool(testGraphId);
    assertSuccess(response);
    
    const result = response.result as { critical_path: string[]; length: number };
    assertGreaterThan(result.length, 0, 'Critical path should have nodes');
    assertEquals(result.critical_path.length, result.length);
  });
}

// ============================================================================
// PHASE 5: Optimization & Export Tests
// ============================================================================

async function testOptimizationAndExport(): Promise<void> {
  runner.setSuite('Phase 5: Optimization & Export');

  await runner.run('suggest_improvements - success', () => {
    const response = tools.suggestImprovements(testGraphId);
    assertSuccess(response);
    
    const result = response.result as { suggestions: string[]; count: number };
    assertGreaterThan(result.count, 0, 'Should have suggestions');
    assertEquals(result.suggestions.length, result.count);
  });

  await runner.run('export_graph - JSON format', () => {
    const response = tools.exportGraph(testGraphId, 'json');
    assertSuccess(response);
    
    const result = response.result as { format: string; content: string };
    assertEquals(result.format, 'json');
    assertContains(result.content, 'intent_graph');
    
    // Verify valid JSON
    JSON.parse(result.content);
  });

  await runner.run('export_graph - YAML format', () => {
    const response = tools.exportGraph(testGraphId, 'yaml');
    assertSuccess(response);
    
    const result = response.result as { format: string; content: string };
    assertEquals(result.format, 'yaml');
  });

  await runner.run('export_graph - DOT format', () => {
    const response = tools.exportGraph(testGraphId, 'dot');
    assertSuccess(response);
    
    const result = response.result as { content: string };
    assertContains(result.content, 'digraph');
  });

  await runner.run('export_graph - Mermaid format', () => {
    const response = tools.exportGraph(testGraphId, 'mermaid');
    assertSuccess(response);
    
    const result = response.result as { content: string };
    assertContains(result.content, 'graph LR');
  });

  await runner.run('visualize_graph - success', () => {
    const response = tools.visualizeGraph(testGraphId);
    assertSuccess(response);
    
    const result = response.result as { mermaid_diagram: string };
    assertContains(result.mermaid_diagram, 'graph LR');
  });

  await runner.run('export_graph - invalid format', () => {
    const response = tools.exportGraph(testGraphId, 'invalid_format' as never);
    assertFailure(response);
    assertErrorCode(response as never, 'INVALID_FORMAT');
  });
}

// ============================================================================
// PHASE 6: Node/Edge Removal Tests
// ============================================================================

async function testRemovalOperations(): Promise<void> {
  runner.setSuite('Phase 6: Removal Operations');

  await runner.run('remove_edge - success', () => {
    const edgeToRemove = testEdgeIds[0];
    const response = tools.removeEdge(testGraphId, edgeToRemove);
    assertSuccess(response);
  });

  await runner.run('remove_edge - already removed', () => {
    const response = tools.removeEdge(testGraphId, testEdgeIds[0]);
    assertFailure(response);
    assertErrorCode(response as never, 'EDGE_NOT_FOUND');
  });

  await runner.run('remove_node - success', () => {
    const nodeToRemove = testNodeIds[2]; // Remove the exit node
    const response = tools.removeNode(testGraphId, nodeToRemove);
    assertSuccess(response);
    
    const result = response.result as { removed_edges: string[] };
    assertGreaterThan(result.removed_edges.length, 0, 'Should remove connected edges');
  });

  await runner.run('remove_node - already removed', () => {
    const response = tools.removeNode(testGraphId, testNodeIds[2]);
    assertFailure(response);
    assertErrorCode(response as never, 'NODE_NOT_FOUND');
  });
}

// ============================================================================
// PHASE 7: Delete Graph Tests
// ============================================================================

async function testGraphDeletion(): Promise<void> {
  runner.setSuite('Phase 7: Graph Deletion');

  await runner.run('delete_graph - success', () => {
    const response = tools.deleteGraph(testGraphId);
    assertSuccess(response);
  });

  await runner.run('delete_graph - already deleted', () => {
    const response = tools.deleteGraph(testGraphId);
    assertFailure(response);
    assertErrorCode(response as never, 'GRAPH_NOT_FOUND');
  });

  await runner.run('get_graph - after deletion', () => {
    const response = tools.getGraph(testGraphId);
    assertFailure(response);
    assertErrorCode(response as never, 'GRAPH_NOT_FOUND');
  });
}

// ============================================================================
// INTEGRATION TESTS: Complex Workflows
// ============================================================================

async function testComplexWorkflows(): Promise<void> {
  runner.setSuite('Integration: Complex Workflows');

  await runner.run('Complete sequential workflow', () => {
    // Create graph
    const createResp = tools.createGraph(
      'Complete Sequential Workflow Test',
      sampleAgents,
      sampleConfig
    );
    assertSuccess(createResp);
    
    const graphId = (createResp.result as { graph_id: string }).graph_id;

    // Add 4 nodes
    const node1 = tools.addNode(graphId, 'OrderValidator', {
      node_type: 'entry',
      purpose: 'Validate order'
    });
    assertSuccess(node1);
    
    const node2 = tools.addNode(graphId, 'InventoryChecker', {
      node_type: 'processing',
      purpose: 'Check inventory'
    });
    assertSuccess(node2);
    
    const node3 = tools.addNode(graphId, 'PaymentProcessor', {
      node_type: 'processing',
      purpose: 'Process payment'
    });
    assertSuccess(node3);
    
    const node4 = tools.addNode(graphId, 'NotificationService', {
      node_type: 'exit',
      purpose: 'Send notification'
    });
    assertSuccess(node4);

    // Connect nodes
    const n1 = (node1.result as { node_id: string }).node_id;
    const n2 = (node2.result as { node_id: string }).node_id;
    const n3 = (node3.result as { node_id: string }).node_id;
    const n4 = (node4.result as { node_id: string }).node_id;

    tools.addEdge(graphId, n1, n2);
    tools.addEdge(graphId, n2, n3);
    tools.addEdge(graphId, n3, n4);

    // Validate
    const validation = tools.validateGraphTool(graphId);
    assertSuccess(validation);
    assertEquals((validation.result as { is_valid: boolean }).is_valid, true);

    // Export
    const exported = tools.exportGraph(graphId, 'json');
    assertSuccess(exported);

    // Cleanup
    tools.deleteGraph(graphId);
  });

  await runner.run('Parallel workflow with aggregation', () => {
    // Create graph with parallel agents
    const createResp = tools.createGraph(
      'Parallel Workflow Test',
      parallelAgents,
      { execution_mode: 'parallel', error_handling: 'fail', iteration_count: 1 }
    );
    assertSuccess(createResp);
    
    const graphId = (createResp.result as { graph_id: string }).graph_id;

    // Add parallel processing nodes
    const nodeResponses = parallelAgents.map(agent =>
      tools.addNode(graphId, agent.name, {
        node_type: 'processing',
        purpose: `Process with ${agent.name}`
      })
    );

    nodeResponses.forEach(resp => assertSuccess(resp));

    const nodeIds = nodeResponses.map(r => {
      assertSuccess(r);
      return (r.result as { node_id: string }).node_id;
    });

    // Create parallel edges from first node
    tools.addEdge(graphId, nodeIds[0], nodeIds[1], { edge_type: 'parallel' });
    tools.addEdge(graphId, nodeIds[0], nodeIds[2], { edge_type: 'parallel' });

    // Find parallel opportunities
    const opportunities = tools.findParallelOpportunitiesTool(graphId);
    assertSuccess(opportunities);

    // Cleanup
    tools.deleteGraph(graphId);
  });
}

// ============================================================================
// Main Test Execution
// ============================================================================

async function runAllTests(): Promise<void> {
  console.error('='.repeat(60));
  console.error('IntentGraph MCP Server - Comprehensive Test Suite');
  console.error('='.repeat(60));
  console.error(`Start Time: ${new Date().toISOString()}`);

  // Clear any existing data
  storage.clear();

  try {
    // Run all test suites
    await testGraphManagement();
    await testNodeOperations();
    await testEdgeOperations();
    await testValidationAndAnalysis();
    await testOptimizationAndExport();
    await testRemovalOperations();
    await testGraphDeletion();
    await testComplexWorkflows();

    // Print summary
    runner.printSummary();

    // Exit with appropriate code
    process.exit(runner.hasFailures() ? 1 : 0);
  } catch (error) {
    console.error('\n❌ FATAL ERROR during test execution:');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();

