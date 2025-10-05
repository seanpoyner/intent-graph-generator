# IntentGraph MCP Server

[![npm version](https://badge.fury.io/js/intent-graph-mcp-server.svg)](https://www.npmjs.com/package/intent-graph-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

**Universal LLM-powered MCP server for automated Intent Graph generation**. Supports Writer Palmyra, Claude, OpenAI, and any OpenAI-compatible API. Transform orchestration requirements into executable agent workflows with AI-assisted graph construction.

**Author:** Sean Poyner  
**Version:** 2.1.0  
**License:** MIT  
**Contact:** sean.poyner@pm.me

---

## 🚀 Quick Start

### **For Copilot Studio / Power Platform (Recommended)**

**1-Command Azure Deployment:**

```powershell
# Clone and deploy
git clone https://github.com/spoyner/intent-graph-generator
cd intent-graph-generator
npm install
.\deploy-to-azure.ps1 -LLM_API_KEY "your-writer-api-key"
```

✅ Automatically creates Azure Function  
✅ Gives you the URL for Copilot Studio  
✅ Fully integrated with Microsoft ecosystem  

**See:** [`AZURE-DEPLOYMENT.md`](AZURE-DEPLOYMENT.md) | [`COPILOT-STUDIO-SETUP.md`](COPILOT-STUDIO-SETUP.md)

---

### **For Other Platforms**

```bash
# Install from npm
npm install -g intent-graph-mcp-server

# Set your LLM API key
export LLM_API_KEY="your-api-key-here"
export LLM_MODEL="palmyra-x5"  # or gpt-4, claude-3-5-sonnet-20241022, etc.

# Use in your orchestration agent
# The agent calls the MCP server tools to generate intent graphs
# See configuration examples below for platform-specific setup
```




## Overview

The IntentGraph MCP Server v2.1 is designed for **orchestration agents** that need to build agent workflows. The orchestration agent provides context in an **Orchestration Card**, and an LLM generates the complete intent graph with intelligent optimizations.

**Primary Use Cases:**
- **Microsoft Copilot Studio** - Build complex agent orchestrations
- **Writer AI Agents** - Generate workflow graphs for Writer's agent platform
- **Codeful Agents** - Power intelligent agent coordination
- **Custom Agent Frameworks** - Any MCP-compatible orchestration system

**Also Compatible with:** Cursor IDE, Claude Desktop, and other MCP-enabled AI assistants.

---

## Why Use This?

### IntentGraph v2.1 (AI-Powered with Advanced Features)
```
✅ Single tool call generates complete graph
✅ AI understands context and constraints
✅ Automatically optimized structure
✅ Flexible LLM generation modes (delegate or use configured API)
✅ System-configurable prompts for custom workflows
✅ Direct memory integration for state persistence
✅ Fast, intelligent, reliable
✅ Artifacts for debugging and logging
```

---

## Features

### **🎯 Primary Generation Tool**
- **`generate_intent_graph`** - Generate complete intent graph from orchestration card
  - Input: Orchestration card with user request, available resources, constraints, context
  - Output: Fully-formed intent graph with nodes, edges, and metadata
  - **NEW in v2.1:** Flexible generation modes (`delegate_to_caller` or `use_configured_api`)
  - **NEW in v2.1:** System-configurable prompts for custom workflows
  - **NEW in v2.1:** Direct memory integration with `store_in_memory` option
  - Optional: Include artifacts (reasoning, alternatives, optimizations)
  - Powered by: Any OpenAI-compatible LLM (Writer Palmyra, Claude, OpenAI, custom)

### **✅ Validation & Analysis**
- **`validate_graph`** - Comprehensive validation with detailed report
  - Checks graph structure, node connectivity, data flow
  - Identifies cycles, unreachable nodes, missing dependencies
  - Returns actionable error messages

- **`analyze_graph`** - Deep analysis of graph metrics
  - Complexity metrics (nodes, edges, depth, branching factor)
  - Parallel execution opportunities
  - Critical path calculation
  - Bottleneck identification
  - **NEW in v2.1:** Supports `graph_id` for memory-cached graphs

### **⚡ Optimization**
- **`optimize_graph`** - Apply AI-driven optimizations
  - Parallelize independent operations
  - Reduce latency through restructuring
  - Minimize costs by consolidating nodes
  - Improve reliability with fallback paths
  - **NEW in v2.1:** Supports `graph_id` for memory-cached graphs

### **📤 Export & Visualization**
- **`export_graph`** - Export in multiple formats
  - JSON (standard format)
  - YAML (human-readable)
  - DOT (Graphviz)
  - Mermaid (diagrams)
  - **NEW in v2.1:** Supports `graph_id` for memory-cached graphs

- **`visualize_graph`** - Generate rich Mermaid diagrams
  - Top-bottom or left-right layouts
  - Multiple style presets (basic, detailed, complete)
  - Shows agent types with icons and colors
  - Displays instructions, tools, and execution dependencies
  - Optional metadata display
  - **NEW in v2.1:** Supports `graph_id` for memory-cached graphs
  - **NEW in v2.1:** Enhanced styling with modern shapes and colors

### **🔍 Artifacts & Debugging**
- **`generate_artifacts`** - Create debugging outputs
  - Reasoning: How the graph was constructed
  - Alternatives: Other designs considered
  - Optimizations: Applied improvements
  - Execution trace: Step-by-step generation log
  - Debug info: Internal state and decisions

---

## Installation

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** (comes with Node.js)
- **LLM API Key** - Choose your provider:
  - Writer Palmyra: [writer.com](https://writer.com) (recommended, default)
  - Anthropic Claude: [anthropic.com](https://anthropic.com)
  - OpenAI: [openai.com](https://openai.com)
  - Or use any OpenAI-compatible endpoint

### Option 1: Install from npm (Recommended)

```bash
npm install -g intent-graph-mcp-server
```

### Option 2: Install from source

```bash
# Clone the repository
git clone https://github.com/spoyner/intent-graph-generator.git
cd intent-graph-generator

# Install dependencies
npm install

# Build TypeScript
npm run build
```

---

## Configuration

### LLM Configuration (Universal)

The server supports **any OpenAI-compatible API** (Writer Palmyra, Claude, OpenAI, custom endpoints).

#### Environment Variables

```bash
# Primary (recommended - works with all providers)
export LLM_API_KEY="your-api-key"
export LLM_MODEL="palmyra-x5"  # or "claude-3-5-sonnet-20241022", "gpt-4", etc.
export LLM_BASE_URL="https://api.writer.com"  # or "https://api.anthropic.com", etc.

# Alternative (provider-specific, for convenience)
export WRITER_API_KEY="your-key"  # Falls back if LLM_API_KEY not set
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"
```

#### Common Configurations

**Writer Palmyra (Default)**
```bash
export LLM_API_KEY="your-writer-api-key"
export LLM_MODEL="palmyra-x5"  # or palmyra-creative, palmyra-x4, etc.
export LLM_BASE_URL="https://api.writer.com"
```

**Anthropic Claude**
```bash
export LLM_API_KEY="your-anthropic-api-key"
export LLM_MODEL="claude-3-5-sonnet-20241022"
export LLM_BASE_URL="https://api.anthropic.com"
```

**OpenAI**
```bash
export LLM_API_KEY="your-openai-api-key"
export LLM_MODEL="gpt-4"
export LLM_BASE_URL="https://api.openai.com"
```

**Custom Endpoint**
```bash
export LLM_API_KEY="your-custom-key"
export LLM_MODEL="your-model-name"
export LLM_BASE_URL="https://your-custom-endpoint.com"
```

### Memory Server Configuration (Optional - for v2.1 caching features)

To enable automatic memory caching (`store_in_memory` option), the server needs access to a memory MCP server:

```bash
# Default (uses @modelcontextprotocol/server-memory via npx)
export MEMORY_MCP_COMMAND="npx"
export MEMORY_MCP_ARGS="-y,@modelcontextprotocol/server-memory"

# Or custom memory server
export MEMORY_MCP_COMMAND="node"
export MEMORY_MCP_ARGS="/path/to/your/memory-server.js"
```

**Note:** If no memory server is configured, the server will still work normally but `store_in_memory` and `graph_id` features will be unavailable.

**Requirements:**
- Memory server must support `create_entities` and `open_nodes` tools
- Compatible with [@modelcontextprotocol/server-memory](https://github.com/modelcontextprotocol/servers/tree/main/src/memory)

### For Microsoft Copilot Studio

When building an orchestration agent in Copilot Studio, configure the MCP server as a tool:

1. Add MCP Server connection in your agent configuration
2. Set the command: `npx intent-graph-mcp-server`
3. Add environment variable: `WRITER_API_KEY=your-api-key-here`
4. The agent can now call any of the 7 IntentGraph tools

**Example Agent Action:**
```
When the user requests a workflow, call generate_intent_graph with an orchestration card containing:
- The user's request
- Available Copilot Studio agents and connectors
- Constraints and preferences
```

### For Writer AI Agents

Integrate the MCP server into your Writer agent workflow:

1. Configure MCP server in your Writer agent environment
2. Add WRITER_API_KEY to the agent's environment variables
3. Use the tools in your agent's decision logic

**Example Integration:**
```typescript
// In your Writer agent
const graph = await mcp.call('generate_intent_graph', {
  orchestration_card: {
    user_request: userInput,
    available_resources: {
      agents: writerAgents,
      mcp_servers: availableServers
    }
  }
});
```

### For Codeful Agents

Add the IntentGraph MCP server to your Codeful agent configuration:

1. Install the server in your Codeful environment
2. Configure environment variables
3. Call tools from your agent code

**Example Usage:**
```python
# In your Codeful agent
graph_result = codeful.mcp.generate_intent_graph(
    orchestration_card={
        "user_request": request_data,
        "available_resources": available_tools,
        "constraints": execution_constraints
    },
    options={"validate": True, "optimize": True}
)
```

### For Cursor IDE / Claude Desktop (Development & Testing)

For development and testing purposes, you can also use this server with AI assistants:

**Cursor IDE:**

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Search for **"MCP: Edit Configuration"**
3. Add this configuration:

```json
{
  "mcpServers": {
    "intent-graph": {
      "command": "npx",
      "args": ["intent-graph-mcp-server"],
      "env": {
        "WRITER_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Claude Desktop:**

1. Locate your config file:
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux:** `~/.config/Claude/claude_desktop_config.json`

2. Add the MCP server configuration
3. Restart Claude Desktop

### Verify Installation

You should see **7 IntentGraph tools** available:
- `generate_intent_graph`
- `validate_graph`
- `analyze_graph`
- `optimize_graph`
- `export_graph`
- `visualize_graph`
- `generate_artifacts`

---

## Usage

### Orchestration Card Structure

The orchestration card is a structured JSON input that provides all context needed for graph generation:

```typescript
{
  "user_request": {
    "description": "What the user wants to accomplish",
    "objectives": ["List of specific goals"],
    "success_criteria": ["How to measure success"]
  },
  "available_resources": {
    "agents": [/* Available AI agents */],
    "mcp_servers": [/* Available MCP servers */],
    "external_tools": [/* APIs, services, etc. */]
  },
  "constraints": {
    "max_iterations": 10,
    "timeout_ms": 30000,
    "error_handling": "retry",
    "execution_mode": "parallel"
  },
  "context": {
    "domain": "e-commerce",
    "environment": "production",
    "user_data": {/* Context-specific data */}
  },
  "preferences": {
    "optimization_priority": "latency",
    "parallelization": "aggressive",
    "error_handling": "graceful_degradation"
  },
  "special_requirements": [
    "Must validate all inputs",
    "Use fallback for payment failures"
  ]
}
```

See [examples/orchestration-cards/](examples/orchestration-cards/) for complete examples.

---

## Examples

### Example 1: Generate E-commerce Order Processing Graph

```javascript
// Call generate_intent_graph with orchestration card
const result = await generate_intent_graph({
  orchestration_card: {
    user_request: {
      description: "Process customer orders end-to-end",
      objectives: [
        "Validate order data",
        "Process payment securely",
        "Update inventory",
        "Send confirmation email"
      ],
      success_criteria: [
        "All orders processed within 5 seconds",
        "Payment success rate > 99%",
        "Zero data loss on failures"
      ]
    },
    available_resources: {
      agents: [
        {
          name: "OrderValidator",
          type: "validator",
          capabilities: ["schema_validation", "business_rules"],
          input_schema: { order: "object" },
          output_schema: { is_valid: "boolean", validated_order: "object" }
        },
        {
          name: "PaymentProcessor",
          type: "api",
          capabilities: ["stripe_payment", "refund"],
          input_schema: { amount: "number", method: "object" },
          output_schema: { transaction_id: "string", status: "string" }
        },
        {
          name: "InventoryManager",
          type: "tool",
          capabilities: ["update_stock", "reserve_items"],
          input_schema: { items: "array" },
          output_schema: { updated: "boolean" }
        },
        {
          name: "NotificationService",
          type: "tool",
          capabilities: ["send_email", "send_sms"],
          input_schema: { recipient: "string", message: "string" },
          output_schema: { sent: "boolean" }
        }
      ]
    },
    constraints: {
      max_iterations: 5,
      timeout_ms: 5000,
      error_handling: "retry",
      execution_mode: "hybrid"
    },
    preferences: {
      optimization_priority: "reliability",
      parallelization: "moderate"
    }
  },
  options: {
    validate: true,
    optimize: true,
    format: "json"
  }
});

// Result contains complete intent graph
console.log(result.graph);
```

### Example 2: Validate Generated Graph

```javascript
const validation = await validate_graph({
  graph: generatedGraph
});

console.log(validation);
// {
//   is_valid: true,
//   checks_performed: [
//     { check: "no_cycles", passed: true },
//     { check: "all_nodes_reachable", passed: true },
//     { check: "data_flow_valid", passed: true }
//   ]
// }
```

### Example 3: Analyze Graph Performance

```javascript
const analysis = await analyze_graph({
  graph: generatedGraph,
  analysis_types: ["complexity", "parallel_opportunities", "critical_path"]
});

console.log(analysis);
// {
//   complexity: {
//     node_count: 4,
//     edge_count: 5,
//     max_depth: 3,
//     branching_factor: 1.25
//   },
//   parallel_opportunities: [
//     { nodes: ["InventoryManager", "NotificationService"], potential_savings_ms: 500 }
//   ],
//   critical_path: {
//     path: ["OrderValidator", "PaymentProcessor", "InventoryManager"],
//     estimated_duration_ms: 3200
//   }
// }
```

### Example 4: Optimize for Lower Latency

```javascript
const optimized = await optimize_graph({
  graph: generatedGraph,
  optimization_strategies: ["parallelize", "reduce_latency"]
});

console.log(optimized.optimized_graph);
// Returns restructured graph with parallel execution groups
```

### Example 5: Export as Mermaid Diagram

```javascript
const diagram = await visualize_graph({
  graph: generatedGraph,
  options: {
    direction: "LR",
    include_metadata: true
  }
});

console.log(diagram.mermaid);
// ```mermaid
// graph LR
//   A[OrderValidator] -->|valid| B[PaymentProcessor]
//   B -->|success| C[InventoryManager]
//   B -->|success| D[NotificationService]
//   C --> E[Complete]
//   D --> E
// ```
```

### Example 6: Generate Debugging Artifacts

```javascript
const artifacts = await generate_artifacts({
  graph: generatedGraph,
  orchestration_card: originalCard,
  artifact_types: ["reasoning", "alternatives", "optimizations"]
});

console.log(artifacts);
// {
//   reasoning: "Chose sequential validation->payment flow to ensure data integrity...",
//   alternatives: ["Parallel validation and inventory check (rejected: race condition risk)"],
//   optimizations: ["Parallelized inventory update and notification sending (saves 500ms)"]
// }
```

---

## Architecture

### Stateless Design
- No persistent storage - graphs generated on demand
- Each tool call is independent
- Easy to scale horizontally
- No state management complexity

### LLM-Powered Generation
- Uses Writer Palmyra for intelligent graph construction
- Context-aware node/edge selection
- Automatic optimization during generation
- Learns from orchestration card constraints

### Type-Safe
- Full TypeScript implementation
- Comprehensive type definitions
- Runtime schema validation
- No `any` types

### Error Handling
- All tools return `{ success: true, result }` or `{ success: false, error }`
- Detailed error messages with codes
- Actionable error details
- Proper MCP error formatting

---

## API Reference

### generate_intent_graph

**Input:**
- `orchestration_card` (required): Orchestration card object
- `options` (optional):
  - `include_artifacts`: boolean - Generate debugging artifacts
  - `artifact_types`: string[] - Types of artifacts to generate
  - `format`: "json" | "yaml" - Output format
  - `validate`: boolean - Validate before returning
  - `optimize`: boolean - Optimize before returning

**Output:**
```typescript
{
  graph: IntentGraph,          // Complete intent graph
  metadata: {
    generated_at: string,
    generation_time_ms: number,
    palmyra_model: string,
    validation_passed: boolean,
    optimizations_applied: string[]
  },
  artifacts?: GenerationArtifacts  // If requested
}
```

### validate_graph

**Input:**
- `graph` (required): Intent graph object

**Output:**
```typescript
{
  is_valid: boolean,
  checks_performed: ValidationCheck[],
  errors?: ValidationError[],
  warnings?: ValidationWarning[]
}
```

### analyze_graph

**Input:**
- `graph` (required): Intent graph object
- `analysis_types` (optional): Array of analysis types

**Output:**
```typescript
{
  complexity?: ComplexityMetrics,
  parallel_opportunities?: ParallelOpportunity[],
  critical_path?: CriticalPath,
  bottlenecks?: Bottleneck[]
}
```

### optimize_graph

**Input:**
- `graph` (required): Intent graph object
- `optimization_strategies` (optional): Array of strategies

**Output:**
```typescript
{
  optimized_graph: IntentGraph,
  optimizations_applied: Optimization[],
  improvements: {
    latency_reduction_ms: number,
    cost_reduction_percent: number,
    reliability_improvement: number
  }
}
```

### export_graph / visualize_graph / generate_artifacts

See [ARCHITECTURE_V2.md](ARCHITECTURE_V2.md) for complete API documentation.

---

## Project Structure

```
intent-graph-generator/
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── types.ts          # TypeScript type definitions
│   ├── utils.ts          # Utility functions (validation, analysis)
│   ├── llm/
│   │   └── client.ts     # Writer Palmyra client
│   └── tools/
│       └── generate.ts   # Primary generation tool
├── schemas/
│   └── orchestration-card-schema.json
├── examples/
│   └── orchestration-cards/
│       └── ecommerce-order-processing.json
├── build/                # Compiled JavaScript
├── ARCHITECTURE_V2.md    # Detailed architecture docs
├── package.json
├── tsconfig.json
└── README.md
```

---

## Development

### Build
```bash
npm run build
```

### Watch Mode
```bash
npm run watch
```

### Development Mode
```bash
npm run dev
```

---

## Troubleshooting

### Issue: Server not connecting
- **Check:** Node.js version >= 18.0.0
- **Check:** Build succeeded (`npm run build`)
- **Check:** MCP server is properly configured in your agent platform
- **Check:** WRITER_API_KEY is set in environment

### Issue: Graph generation fails
- **Check:** WRITER_API_KEY is valid and has API access
- **Check:** Orchestration card follows the schema (see `schemas/orchestration-card-schema.json`)
- **Check:** Available resources are properly defined with valid schemas
- **Check:** Network connectivity to Writer API

### Issue: Tool not found
- **Check:** Tool name matches exactly (case-sensitive)
- **Check:** MCP server restarted after configuration changes
- **Check:** MCP server is running (check platform logs)
- **Check:** Agent has permission to call MCP tools

### Issue: Copilot Studio integration
- **Check:** MCP server is registered as a tool connector
- **Check:** Environment variables are set in Copilot Studio
- **Check:** Agent has the correct MCP tool permissions

### Issue: Writer Agents integration
- **Check:** MCP server is accessible from Writer agent environment
- **Check:** WRITER_API_KEY is configured (same key for both)
- **Check:** Agent can make MCP tool calls

---

## Migration from v1.0

If you're upgrading from v1.0:

1. **Breaking Changes:**
   - All 19 incremental tools removed
   - New orchestration card input format
   - Stateless (no in-memory storage)
   - Requires Writer API key

2. **Migration Steps:**
   - Update package: `npm install -g intent-graph-mcp-server@latest`
   - Get Writer API key from writer.com
   - Update agent configuration with `WRITER_API_KEY`
   - Rewrite orchestration logic to use `generate_intent_graph` tool
   - Replace incremental build logic with single orchestration card call

3. **Benefits:**
   - 90% fewer tool calls
   - Faster graph generation
   - AI-optimized structures
   - Easier to use and maintain

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute
- 🐛 Report bugs
- 💡 Suggest features
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the repository

**Contact:** Sean Poyner <sean.poyner@pm.me>

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**MIT License** - Copyright (c) 2025 Sean Poyner

This is a permissive open source license that allows anyone to:
- ✅ Use the software commercially
- ✅ Modify the source code
- ✅ Distribute copies
- ✅ Sublicense
- ✅ Use privately

**Requirements:**
- ⚠️ Must include copyright notice and license in all copies
- ⚠️ Must acknowledge the original author (Sean Poyner)

See [OPEN_SOURCE.md](OPEN_SOURCE.md) for detailed licensing information.

---

## Changelog

### v2.1.0 (2025-10-04)
- 🚀 **Flexible LLM Generation Modes**
  - `delegate_to_caller`: Returns prompts for calling agent to use its own LLM
  - `use_configured_api`: Server directly calls configured LLM (default)
  - Enables cost optimization and model flexibility
- 🎨 **System-Configurable Generation**
  - Custom prompt templates per system
  - Flexible output schemas
  - Example outputs for training
  - Agent descriptions and validation rules
  - Makes server a "meta-orchestration tool"
- 💾 **Direct Memory Integration** (Breaking Change)
  - Server now directly connects to memory MCP server
  - `store_in_memory: true` automatically stores graphs
  - `graph_id` parameter automatically retrieves from memory
  - No manual storage/retrieval steps required
  - Reusable pattern for state management
- ✨ **Enhanced Visualization**
  - Modern styling with colors and shapes
  - Agent type icons (🤖 LLM, 🔌 API, ✅ Validator, etc.)
  - Multiple style presets (basic, detailed, complete)
  - Shows instructions, tools, and execution dependencies
  - Improved edge labels with conditions and triggers
- 🐛 **Critical Fixes**
  - Fixed JSON parsing for custom schema outputs
  - Fixed markdown code block extraction
  - Fixed schema mismatch with `system_configuration`
  - Updated property names for consistency

### v2.0.0 (2025-10-03)
- 🎉 **Major architectural redesign**
- ✨ Single `generate_intent_graph` tool for complete graph generation
- ✨ Writer Palmyra LLM integration for AI-powered construction
- ✨ Orchestration card input format
- ✨ Stateless, scalable design
- ✨ Artifact generation for debugging and logging
- ✨ 6 helper tools: validate, analyze, optimize, export, visualize, generate_artifacts
- 🗑️ Removed 19 incremental tools from v1.0
- 🗑️ Removed in-memory storage

### v1.0.0 (2025-10-02) - Deprecated
- ✨ Initial release with 19 composable tools
- ✨ Incremental graph construction
- ✨ In-memory storage

---

## Acknowledgments

Built with ❤️ using:
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk) - MCP SDK
- [Writer Palmyra](https://writer.com) - LLM for graph generation
- TypeScript - Type-safe development
- Node.js - Runtime environment

Special thanks to:
- The Model Context Protocol community
- Writer.com for their powerful AI models
- The open-source community

---

**Ready to build intelligent agent workflows? Install now and start generating!**

```bash
npm install -g intent-graph-mcp-server
```
