/**
 * Test Utilities and Fixtures
 * Helper functions and sample data for testing
 */

import type { AgentDefinition, GraphConfig } from './types.js';

// ============================================================================
// Test Fixtures
// ============================================================================

export const sampleAgents: AgentDefinition[] = [
  {
    name: 'OrderValidator',
    type: 'validator',
    capabilities: ['validate_schema', 'check_required_fields'],
    input_schema: { order: 'object' },
    output_schema: { is_valid: 'boolean', errors: 'array', validated_order: 'object' }
  },
  {
    name: 'InventoryChecker',
    type: 'api',
    capabilities: ['check_stock', 'reserve_inventory'],
    input_schema: { product_ids: 'array', quantities: 'array' },
    output_schema: { in_stock: 'boolean', reserved: 'boolean', reservation_id: 'string' }
  },
  {
    name: 'PaymentProcessor',
    type: 'api',
    capabilities: ['process_payment', 'validate_payment_method'],
    input_schema: { amount: 'number', payment_method: 'object', order_id: 'string' },
    output_schema: { transaction_id: 'string', status: 'string', timestamp: 'string' }
  },
  {
    name: 'NotificationService',
    type: 'tool',
    capabilities: ['send_email', 'send_sms'],
    input_schema: { recipient: 'string', message: 'string', channel: 'string' },
    output_schema: { sent: 'boolean', message_id: 'string' }
  }
];

export const sampleConfig: GraphConfig = {
  execution_mode: 'sequential',
  error_handling: 'fail',
  iteration_count: 1
};

export const parallelAgents: AgentDefinition[] = [
  {
    name: 'TextAnalyzer',
    type: 'llm',
    capabilities: ['sentiment_analysis', 'toxicity_detection'],
    input_schema: { text: 'string' },
    output_schema: { sentiment: 'string', toxicity_score: 'number', flags: 'array' }
  },
  {
    name: 'ImageModerator',
    type: 'api',
    capabilities: ['nsfw_detection', 'violence_detection'],
    input_schema: { image_url: 'string' },
    output_schema: { is_safe: 'boolean', categories: 'array', confidence: 'number' }
  },
  {
    name: 'MetadataValidator',
    type: 'validator',
    capabilities: ['validate_tags', 'check_copyright'],
    input_schema: { metadata: 'object' },
    output_schema: { is_compliant: 'boolean', violations: 'array' }
  }
];

// ============================================================================
// Test Helpers
// ============================================================================

export interface TestResult {
  test_name: string;
  passed: boolean;
  duration_ms: number;
  error?: string;
  details?: unknown;
}

export class TestRunner {
  private results: TestResult[] = [];
  private currentSuite = '';

  setSuite(name: string): void {
    this.currentSuite = name;
    console.error(`\n${'='.repeat(60)}`);
    console.error(`TEST SUITE: ${name}`);
    console.error('='.repeat(60));
  }

  async run(testName: string, testFn: () => Promise<void> | void): Promise<void> {
    const fullName = this.currentSuite ? `${this.currentSuite} :: ${testName}` : testName;
    const startTime = Date.now();

    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      this.results.push({
        test_name: fullName,
        passed: true,
        duration_ms: duration
      });

      console.error(`✅ PASS: ${testName} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.results.push({
        test_name: fullName,
        passed: false,
        duration_ms: duration,
        error: errorMessage,
        details: error
      });

      console.error(`❌ FAIL: ${testName} (${duration}ms)`);
      console.error(`   Error: ${errorMessage}`);
    }
  }

  getSummary(): { total: number; passed: number; failed: number; duration: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const duration = this.results.reduce((sum, r) => sum + r.duration_ms, 0);

    return { total, passed, failed, duration };
  }

  printSummary(): void {
    const summary = this.getSummary();

    console.error(`\n${'='.repeat(60)}`);
    console.error('TEST SUMMARY');
    console.error('='.repeat(60));
    console.error(`Total Tests:  ${summary.total}`);
    console.error(`Passed:       ${summary.passed} ✅`);
    console.error(`Failed:       ${summary.failed} ${summary.failed > 0 ? '❌' : ''}`);
    console.error(`Duration:     ${summary.duration}ms`);
    console.error('='.repeat(60));

    if (summary.failed > 0) {
      console.error('\nFailed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.error(`  ❌ ${r.test_name}`);
          console.error(`     ${r.error}`);
        });
    }
  }

  hasFailures(): boolean {
    return this.results.some(r => !r.passed);
  }

  getResults(): TestResult[] {
    return [...this.results];
  }
}

// ============================================================================
// Assertion Helpers
// ============================================================================

export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function assertEquals<T>(actual: T, expected: T, message?: string): void {
  const msg = message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`;
  assert(JSON.stringify(actual) === JSON.stringify(expected), msg);
}

export function assertNotNull<T>(value: T | null | undefined, message?: string): void {
  const msg = message || 'Value should not be null or undefined';
  assert(value !== null && value !== undefined, msg);
}

export function assertNull<T>(value: T | null | undefined, message?: string): void {
  const msg = message || 'Value should be null or undefined';
  assert(value === null || value === undefined, msg);
}

export function assertIncludes(array: unknown[], item: unknown, message?: string): void {
  const msg = message || `Array should include ${JSON.stringify(item)}`;
  assert(array.includes(item), msg);
}

export function assertGreaterThan(actual: number, expected: number, message?: string): void {
  const msg = message || `${actual} should be greater than ${expected}`;
  assert(actual > expected, msg);
}

export function assertLessThan(actual: number, expected: number, message?: string): void {
  const msg = message || `${actual} should be less than ${expected}`;
  assert(actual < expected, msg);
}

export function assertContains(text: string, substring: string, message?: string): void {
  const msg = message || `"${text}" should contain "${substring}"`;
  assert(text.includes(substring), msg);
}

export function assertSuccess<T>(response: { success: boolean; result?: T }): asserts response is { success: true; result: T } {
  assert(response.success === true, `Expected success=true, got ${response.success}`);
  assert(response.result !== undefined, 'Expected result to be defined on success');
}

export function assertFailure(response: { success: boolean }): asserts response is { success: false; error: { code: string; message: string } } {
  assert(response.success === false, `Expected success=false, got ${response.success}`);
}

export function assertErrorCode(response: { success: false; error: { code: string } }, expectedCode: string): void {
  assertFailure(response);
  assertEquals(response.error.code, expectedCode, `Expected error code ${expectedCode}`);
}

// ============================================================================
// Mock Data Generators
// ============================================================================

export function generateTestPurpose(prefix = 'Test'): string {
  return `${prefix}: Process customer orders with validation and payment`;
}

export function generateTestAgents(count: number): AgentDefinition[] {
  const agents: AgentDefinition[] = [];
  const types: AgentDefinition['type'][] = ['llm', 'tool', 'api', 'validator', 'transformer', 'aggregator'];

  for (let i = 0; i < count; i++) {
    agents.push({
      name: `TestAgent${i + 1}`,
      type: types[i % types.length],
      capabilities: [`capability_${i + 1}`],
      input_schema: { input: 'string' },
      output_schema: { output: 'string' }
    });
  }

  return agents;
}

// ============================================================================
// Cleanup Utilities
// ============================================================================

export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function resetTestEnvironment(): void {
  // Can be extended to reset storage, clear state, etc.
  console.error('[Test Utils] Test environment ready');
}

