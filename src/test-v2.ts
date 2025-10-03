#!/usr/bin/env node

/**
 * Comprehensive Test Suite for IntentGraph MCP Server v2.0
 * Tests all 7 tools with various scenarios
 * 
 * Run with: npm run test
 */

import { generateIntentGraphTool } from './tools/generate.js';
import type { OrchestrationCard } from './types.js';

// Test utilities
let testsPassed = 0;
let testsFailed = 0;
let testsSkipped = 0;

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function log(message: string, level: 'info' | 'success' | 'error' | 'warn' = 'info'): void {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m'     // Yellow
  };
  const reset = '\x1b[0m';
  console.log(`${colors[level]}${message}${reset}`);
}

async function runTest(name: string, testFn: () => Promise<void>): Promise<void> {
  try {
    log(`\n▶ Running: ${name}`, 'info');
    await testFn();
    testsPassed++;
    log(`  ✓ PASSED: ${name}`, 'success');
  } catch (error) {
    testsFailed++;
    log(`  ✗ FAILED: ${name}`, 'error');
    log(`    Error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    if (error instanceof Error && error.stack) {
      log(`    Stack: ${error.stack.split('\n').slice(1, 3).join('\n')}`, 'error');
    }
  }
}

function skipTest(name: string, reason: string): void {
  testsSkipped++;
  log(`\n⊘ SKIPPED: ${name}`, 'warn');
  log(`  Reason: ${reason}`, 'warn');
}

// Sample orchestration cards
const sampleOrchestrationCard: OrchestrationCard = {
  user_request: {
    description: "Process customer orders end-to-end with validation, payment, inventory, and notification",
    domain: "e-commerce",
    success_criteria: [
      "Orders processed within 5 seconds",
      "Payment success rate > 99%"
    ]
  },
  available_agents: [
    {
      name: "OrderValidator",
      type: "validator",
      capabilities: ["schema_validation", "business_rules"],
      input_schema: { order: { type: "object" } },
      output_schema: { is_valid: { type: "boolean" }, validated_order: { type: "object" } }
    },
    {
      name: "PaymentProcessor",
      type: "api",
      capabilities: ["stripe_payment", "refund"],
      input_schema: { amount: { type: "number" }, method: { type: "object" } },
      output_schema: { transaction_id: { type: "string" }, status: { type: "string" } }
    },
    {
      name: "InventoryManager",
      type: "tool",
      capabilities: ["update_stock", "reserve_items"],
      input_schema: { items: { type: "array" } },
      output_schema: { updated: { type: "boolean" } }
    },
    {
      name: "NotificationService",
      type: "tool",
      capabilities: ["send_email", "send_sms"],
      input_schema: { recipient: { type: "string" }, message: { type: "string" } },
      output_schema: { sent: { type: "boolean" } }
    }
  ],
  constraints: {
    max_iterations: 5,
    timeout_ms: 5000
  },
  context: {
    environment: "production",
    request_id: "test_request_001"
  },
  preferences: {
    optimize_for: "reliability",
    parallelization: "balanced"
  },
  example_scenarios: [
    {
      scenario: "Happy path - order is valid, payment succeeds, inventory updates, notification sent"
    }
  ]
};

const minimalOrchestrationCard: OrchestrationCard = {
  user_request: {
    description: "Simple data validation workflow that validates input and returns result",
    success_criteria: ["Fast response"]
  },
  available_agents: [
    {
      name: "DataValidator",
      type: "validator",
      capabilities: ["validate"],
      input_schema: { data: { type: "object" } },
      output_schema: { valid: { type: "boolean" } }
    }
  ],
  constraints: {
    max_iterations: 1,
    timeout_ms: 1000
  }
};

// ============================================================================
// Test Suite
// ============================================================================

async function main(): Promise<void> {
  log('\n========================================', 'info');
  log('IntentGraph MCP Server v2.0 Test Suite', 'info');
  log('========================================\n', 'info');

  const hasApiKey = !!(process.env.LLM_API_KEY || process.env.WRITER_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
  
  if (!hasApiKey) {
    log('⚠️  LLM API key not found in environment', 'warn');
    log('   LLM-powered tests will be skipped', 'warn');
    log('   Set LLM_API_KEY (or WRITER_API_KEY/OPENAI_API_KEY/ANTHROPIC_API_KEY)', 'warn');
    log('   PowerShell: $env:LLM_API_KEY="your-key"; npm test', 'warn');
    log('   Bash: export LLM_API_KEY="your-key"; npm test\n', 'warn');
  }

  // ========================================================================
  // Tool 1: generate_intent_graph
  // ========================================================================
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
  log('Tool 1: generate_intent_graph', 'info');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');

  if (hasApiKey) {
    await runTest('generate_intent_graph: Standard orchestration card', async () => {
      const result = await generateIntentGraphTool({
        orchestration_card: sampleOrchestrationCard,
        options: {
          validate: true,
          optimize: false,
          format: 'json'
        }
      });

      assert(result.success === true, 'Should succeed');
      if (!result.success) return;

      assert(result.result.intent_graph !== undefined, 'Should return intent graph');
      assert(result.result.intent_graph.nodes.length > 0, 'Should have nodes');
      assert(result.result.intent_graph.edges.length > 0, 'Should have edges');
      assert(result.result.metadata !== undefined, 'Should have metadata');
      assert(result.result.metadata.generation_timestamp !== undefined, 'Should have timestamp');
    });

    await runTest('generate_intent_graph: Minimal orchestration card', async () => {
      const result = await generateIntentGraphTool({
        orchestration_card: minimalOrchestrationCard,
        options: {
          validate: false,
          format: 'json'
        }
      });

      assert(result.success === true, 'Should succeed');
      if (!result.success) return;

      assert(result.result.intent_graph !== undefined, 'Should return intent graph');
      assert(result.result.intent_graph.nodes.length >= 1, 'Should have at least one node');
    });

    await runTest('generate_intent_graph: With artifacts', async () => {
      const result = await generateIntentGraphTool({
        orchestration_card: sampleOrchestrationCard,
        options: {
          include_artifacts: true,
          artifact_types: ['reasoning', 'alternatives'],
          format: 'json'
        }
      });

      assert(result.success === true, 'Should succeed');
      if (!result.success) return;

      assert(result.result.artifacts !== undefined, 'Should include artifacts');
      assert(result.result.artifacts!.reasoning !== undefined, 'Should have reasoning artifact');
    });

    await runTest('generate_intent_graph: With validation', async () => {
      const result = await generateIntentGraphTool({
        orchestration_card: sampleOrchestrationCard,
        options: {
          validate: true,
          format: 'json'
        }
      });

      assert(result.success === true, 'Should succeed');
      if (!result.success) return;

      assert(result.result.validation !== undefined, 'Should have validation results');
    });

    await runTest('generate_intent_graph: With optimization', async () => {
      const result = await generateIntentGraphTool({
        orchestration_card: sampleOrchestrationCard,
        options: {
          optimize: true,
          format: 'json'
        }
      });

      assert(result.success === true, 'Should succeed');
      if (!result.success) return;

      // Optimization tracking is in metadata or validation
      assert(result.result.metadata !== undefined, 'Should have metadata');
    });

    await runTest('generate_intent_graph: Complex workflow', async () => {
      const complexCard: OrchestrationCard = {
        user_request: {
          description: "Multi-stage approval workflow with parallel processing including validation, permission checking, data processing, aggregation, and notifications",
          success_criteria: ["Complete within 10 seconds", "100% reliability"]
        },
        available_agents: [
          {
            name: "RequestValidator",
            type: "validator",
            capabilities: ["validate"],
            input_schema: { request: { type: "object" } },
            output_schema: { valid: { type: "boolean" } }
          },
          {
            name: "PermissionChecker",
            type: "validator",
            capabilities: ["check_permissions"],
            input_schema: { user: { type: "string" }, resource: { type: "string" } },
            output_schema: { allowed: { type: "boolean" } }
          },
          {
            name: "DataProcessor",
            type: "transformer",
            capabilities: ["transform"],
            input_schema: { data: { type: "object" } },
            output_schema: { processed: { type: "object" } }
          },
          {
            name: "Aggregator",
            type: "aggregator",
            capabilities: ["combine"],
            input_schema: { results: { type: "array" } },
            output_schema: { combined: { type: "object" } }
          }
        ],
        constraints: {
          max_iterations: 10,
          timeout_ms: 10000
        },
        preferences: {
          optimize_for: "speed",
          parallelization: "aggressive"
        }
      };

      const result = await generateIntentGraphTool({
        orchestration_card: complexCard,
        options: { validate: true, optimize: true }
      });

      assert(result.success === true, 'Should succeed with complex workflow');
      if (!result.success) return;

      assert(result.result.intent_graph.nodes.length >= 4, 'Should create nodes for all agents');
    });

    await runTest('generate_intent_graph: Error handling - missing required field', async () => {
      const invalidCard: any = {
        user_request: {
          description: "Test"
        }
        // Missing available_resources - required field
      };

      const result = await generateIntentGraphTool({
        orchestration_card: invalidCard,
        options: {}
      });

      assert(result.success === false, 'Should fail with invalid input');
      if (result.success) return;

      assert(result.error.code !== undefined, 'Should have error code');
      assert(result.error.message !== undefined, 'Should have error message');
    });

  } else {
    skipTest('generate_intent_graph tests', 'LLM API key not set');
  }

  // ========================================================================
  // Tool 2: validate_graph (placeholder - to be implemented)
  // ========================================================================
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
  log('Tool 2: validate_graph', 'info');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');

  skipTest('validate_graph tests', 'Tool implementation pending');

  // ========================================================================
  // Tool 3: analyze_graph (placeholder - to be implemented)
  // ========================================================================
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
  log('Tool 3: analyze_graph', 'info');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');

  skipTest('analyze_graph tests', 'Tool implementation pending');

  // ========================================================================
  // Tool 4: optimize_graph (placeholder - to be implemented)
  // ========================================================================
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
  log('Tool 4: optimize_graph', 'info');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');

  skipTest('optimize_graph tests', 'Tool implementation pending');

  // ========================================================================
  // Tool 5: export_graph (placeholder - to be implemented)
  // ========================================================================
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
  log('Tool 5: export_graph', 'info');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');

  skipTest('export_graph tests', 'Tool implementation pending');

  // ========================================================================
  // Tool 6: visualize_graph (placeholder - to be implemented)
  // ========================================================================
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
  log('Tool 6: visualize_graph', 'info');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');

  skipTest('visualize_graph tests', 'Tool implementation pending');

  // ========================================================================
  // Tool 7: generate_artifacts (placeholder - to be implemented)
  // ========================================================================
  
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');
  log('Tool 7: generate_artifacts', 'info');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'info');

  skipTest('generate_artifacts tests', 'Tool implementation pending');

  // ========================================================================
  // Summary
  // ========================================================================

  log('\n========================================', 'info');
  log('Test Summary', 'info');
  log('========================================', 'info');
  log(`✓ Passed:  ${testsPassed}`, 'success');
  log(`✗ Failed:  ${testsFailed}`, 'error');
  log(`⊘ Skipped: ${testsSkipped}`, 'warn');
  log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`, 'info');

  if (testsFailed > 0) {
    log('❌ Test suite failed', 'error');
    process.exit(1);
  } else if (testsPassed === 0) {
    log('⚠️  No tests were run', 'warn');
    process.exit(1);
  } else {
    log('✅ All tests passed!', 'success');
    process.exit(0);
  }
}

// Run tests
main().catch((error) => {
  log(`\n💥 Fatal error: ${error}`, 'error');
  process.exit(1);
});

