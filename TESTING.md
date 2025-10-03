# IntentGraph MCP Server - Testing Documentation

## Overview

Comprehensive test suite for the IntentGraph MCP Server covering all 19 tools with **42 test cases** across **8 test suites**.

**Test Status:** ✅ **42/42 PASSING** (100% success rate)  
**Test Duration:** ~16ms  
**Coverage:** All 19 MCP tools + 2 integration workflows

---

## Running Tests

### Quick Start

```powershell
# Run all tests
npm test

# Build and run tests separately
npm run build
node build/test.js

# Watch mode (auto-rebuild on changes)
npm run test:watch
```

### Expected Output

```
============================================================
IntentGraph MCP Server - Comprehensive Test Suite
============================================================
Total Tests:  42
Passed:       42 ✅
Failed:       0
Duration:     16ms
```

---

## Test Structure

### Test Suites

The test suite is organized into **8 phases** matching the MCP implementation:

1. **Phase 1: Graph Management** (6 tests)
   - create_graph, get_graph, delete_graph, list_graphs

2. **Phase 2: Node Operations** (8 tests)
   - add_node, update_node, remove_node, list_nodes

3. **Phase 3: Edge Operations** (7 tests)
   - add_edge, update_edge, remove_edge, list_edges

4. **Phase 4: Validation & Analysis** (5 tests)
   - validate_graph, analyze_complexity, find_parallel_opportunities, calculate_critical_path

5. **Phase 5: Optimization & Export** (7 tests)
   - suggest_improvements, export_graph (JSON/YAML/DOT/Mermaid), visualize_graph

6. **Phase 6: Removal Operations** (4 tests)
   - Edge and node removal with cascade

7. **Phase 7: Graph Deletion** (3 tests)
   - Delete and verify deletion

8. **Integration: Complex Workflows** (2 tests)
   - Complete sequential workflow
   - Parallel workflow with aggregation

---

## Test Coverage

### Tools Tested (19/19 = 100%)

#### ✅ Graph Management
- [x] create_graph
- [x] get_graph
- [x] delete_graph
- [x] list_graphs

#### ✅ Node Operations
- [x] add_node
- [x] update_node
- [x] remove_node
- [x] list_nodes

#### ✅ Edge Operations
- [x] add_edge
- [x] update_edge
- [x] remove_edge
- [x] list_edges

#### ✅ Validation & Analysis
- [x] validate_graph
- [x] analyze_complexity
- [x] find_parallel_opportunities
- [x] calculate_critical_path

#### ✅ Optimization & Export
- [x] suggest_improvements
- [x] export_graph (JSON)
- [x] export_graph (YAML)
- [x] export_graph (DOT)
- [x] export_graph (Mermaid)
- [x] visualize_graph

---

## Test Scenarios

### Success Scenarios (28 tests)
- Valid tool calls with proper parameters
- Graph construction workflows
- Validation and analysis operations
- Multiple export formats
- Integration workflows

### Error Scenarios (14 tests)
- Invalid graph IDs
- Missing required parameters
- Non-existent nodes/edges/agents
- Duplicate operations (delete twice, etc.)
- Invalid formats

---

## Test Data

### Sample Agents

**Order Processing Agents:**
```typescript
- OrderValidator (validator)
- InventoryChecker (api)
- PaymentProcessor (api)
- NotificationService (tool)
```

**Content Moderation Agents:**
```typescript
- TextAnalyzer (llm)
- ImageModerator (api)
- MetadataValidator (validator)
```

### Test Fixtures

Located in `src/test-utils.ts`:
- `sampleAgents` - 4 order processing agents
- `parallelAgents` - 3 content moderation agents
- `sampleConfig` - Default graph configuration
- Helper functions for data generation

---

## Test Utilities

### Test Runner

Custom test runner with:
- ✅ Test suite organization
- ✅ Success/failure tracking
- ✅ Duration measurement
- ✅ Colored output (✅ green / ❌ red)
- ✅ Summary statistics
- ✅ Error details

### Assertion Library

Type-safe assertions:
- `assertSuccess(response)` - Checks success response
- `assertFailure(response)` - Checks error response
- `assertErrorCode(response, code)` - Verifies error code
- `assertEquals(actual, expected)` - Deep equality
- `assertGreaterThan(actual, expected)` - Numeric comparison
- `assertContains(text, substring)` - String inclusion
- `assertNotNull(value)` - Null checks

---

## Integration Tests

### Test 1: Complete Sequential Workflow

**Purpose:** Build a 4-node sequential graph end-to-end

**Steps:**
1. Create graph with 4 agents
2. Add 4 nodes (entry → processing → processing → exit)
3. Connect nodes with edges
4. Validate complete graph
5. Export to JSON
6. Cleanup (delete graph)

**Validation:**
- All nodes created successfully
- All edges connected properly
- Graph validates as valid DAG
- Export produces valid JSON

### Test 2: Parallel Workflow with Aggregation

**Purpose:** Test parallel execution detection

**Steps:**
1. Create graph with 3 parallel agents
2. Add 3 processing nodes
3. Create parallel edges from first node
4. Find parallel opportunities
5. Cleanup

**Validation:**
- Parallel edges created
- Parallelization opportunities detected
- Graph structure correct

---

## Adding New Tests

### Template

```typescript
await runner.run('test_name - description', () => {
  // Arrange
  const input = { /* test data */ };
  
  // Act
  const response = tools.someFunction(input);
  
  // Assert
  assertSuccess(response);
  const result = response.result as { /* type */ };
  assertEquals(result.someField, expectedValue);
});
```

### Best Practices

1. **Test both success and failure cases**
   - Happy path
   - Error conditions
   - Edge cases

2. **Use descriptive test names**
   - Format: `tool_name - scenario`
   - Examples: "create_graph - success", "add_node - invalid agent"

3. **Clean up after tests**
   - Delete created graphs
   - Reset state if needed

4. **Use type assertions**
   - Cast response.result to expected type
   - Maintain type safety

5. **Keep tests independent**
   - Don't rely on side effects
   - Each test should work in isolation

---

## Continuous Integration

### Pre-commit Checks

```powershell
# Build check
npm run build

# Run tests
npm test

# Both commands must pass
```

### GitHub Actions (Example)

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

---

## Test Files

### Source Files
- `src/test.ts` - Main test suite (42 tests)
- `src/test-utils.ts` - Test utilities and fixtures

### Build Files
- `build/test.js` - Compiled test suite
- `build/test-utils.js` - Compiled utilities

---

## Debugging Tests

### Run specific suite

Edit `src/test.ts` and comment out suites:

```typescript
// await testGraphManagement();
await testNodeOperations(); // Run only this
// await testEdgeOperations();
```

### Add debug logging

```typescript
console.error('[DEBUG]', JSON.stringify(response, null, 2));
```

### Check test output

All test logs go to **stderr** for clear separation from results.

---

## Performance Benchmarks

### Test Duration Breakdown

- **Graph Management:** < 2ms
- **Node Operations:** < 3ms
- **Edge Operations:** < 5ms
- **Validation & Analysis:** < 2ms
- **Optimization & Export:** < 2ms
- **Removal Operations:** < 2ms
- **Integration Tests:** < 4ms

**Total:** ~16ms for 42 tests

### Tool Performance

- Average per test: **0.38ms**
- Fastest test: **0ms** (simple validations)
- Slowest test: **2ms** (integration workflows)

---

## Known Limitations

1. **In-Memory Only**
   - Tests don't persist between runs
   - Graph cleared at start of each run

2. **No Parallel Test Execution**
   - Tests run sequentially
   - Future: Add parallel test runner

3. **No Mock Server**
   - Tests use actual tool implementations
   - Future: Add mock mode for isolation

---

## Future Enhancements

### Planned
- [ ] Load testing (1000+ graphs)
- [ ] Stress testing (complex graphs)
- [ ] Performance regression tests
- [ ] Code coverage reporting
- [ ] Snapshot testing for exports
- [ ] Property-based testing

### Ideas
- [ ] Visual test report (HTML)
- [ ] Test metrics dashboard
- [ ] Automated performance tracking
- [ ] Mutation testing

---

## Troubleshooting

### Tests Fail to Build

```powershell
# Clean and rebuild
Remove-Item -Recurse build/
npm run build
```

### Tests Time Out

- Check for infinite loops
- Verify async operations complete
- Add timeout configuration

### Type Errors

- Ensure assertions use proper type guards
- Check `assertSuccess` narrows types correctly
- Verify response type casts

### Failed Assertions

- Read error message carefully
- Check expected vs actual values
- Add debug logging if needed

---

## Contact

**Questions or Issues?**  
Contact: Sean Poyner <sean.poyner@pm.me>

**Repository:** `C:\Users\seanp\projects\IntentGraphGen`  
**Test Command:** `npm test`  
**Build Command:** `npm run build`

