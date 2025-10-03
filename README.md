# IntentGraph MCP Server

[![npm version](https://badge.fury.io/js/intent-graph-mcp-server.svg)](https://www.npmjs.com/package/intent-graph-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

A **Model Context Protocol (MCP) server** that provides composable tools for building and managing intent graphs incrementally. Transform monolithic agent orchestration into granular, transparent, and interactive graph construction.

**Author:** Sean Poyner  
**Version:** 1.0.0  
**License:** MIT  
**Contact:** sean.poyner@pm.me

---

## 🚀 Quick Start

```bash
# Install from npm
npm install -g intent-graph-mcp-server

# Configure in Cursor or Claude Desktop
# Add to MCP config:
{
  "intent-graph": {
    "command": "npx",
    "args": ["intent-graph-mcp-server"]
  }
}

# Restart your IDE and start building graphs!
```

See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.

---

## Overview

Instead of generating complete intent graphs in one shot, this MCP server gives AI agents **19 specialized tools** to:

- ✅ Create and manage graphs incrementally
- ✅ Add/update/remove nodes and edges dynamically
- ✅ Validate graph structure at each step
- ✅ Analyze complexity and find optimization opportunities
- ✅ Export graphs in multiple formats (JSON, YAML, DOT, Mermaid)
- ✅ Visualize graphs with Mermaid diagrams

**Perfect for:** Building complex agent workflows, orchestrating AI systems, creating visual agent pipelines, designing multi-step automation.

**Compatible with:** Cursor IDE, Claude Desktop, any MCP-compatible AI assistant.

---

## Why Use This?

### Traditional Approach (Monolithic)
```
❌ Generate entire 100-node graph in one shot
❌ No visibility into construction process
❌ Difficult to debug or modify
❌ All-or-nothing - no incremental refinement
```

### IntentGraph MCP Approach (Composable)
```
✅ Build graphs step-by-step with AI guidance
✅ Validate at each step
✅ Modify and optimize iteratively
✅ Full transparency and control
✅ Export in multiple formats
```

---

## Features

### **Graph Management** (Phase 1)
- `create_graph` - Initialize a new graph with purpose and available agents
- `get_graph` - Retrieve complete graph by ID
- `delete_graph` - Remove a graph
- `list_graphs` - List all graphs with summary info

### **Node Operations** (Phase 2)
- `add_node` - Add an agent execution node
- `update_node` - Modify node configuration
- `remove_node` - Remove node and connected edges
- `list_nodes` - List all nodes in a graph

### **Edge Operations** (Phase 2)
- `add_edge` - Connect nodes with edges (sequential, parallel, conditional, etc.)
- `update_edge` - Modify edge configuration
- `remove_edge` - Remove an edge
- `list_edges` - List all edges in a graph

### **Validation & Analysis** (Phase 3)
- `validate_graph` - Comprehensive validation with detailed report
- `analyze_complexity` - Calculate complexity metrics
- `find_parallel_opportunities` - Identify parallelization opportunities
- `calculate_critical_path` - Find longest path through graph

### **Optimization** (Phase 4)
- `suggest_improvements` - Get optimization suggestions

### **Export & Visualization** (Phase 5)
- `export_graph` - Export in JSON, YAML, DOT, or Mermaid format
- `visualize_graph` - Generate Mermaid diagram

---

## Installation

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** (comes with Node.js)

### Option 1: Install from npm (Recommended)

```bash
npm install -g intent-graph-mcp-server
```

This installs the server globally, making it available system-wide.

### Option 2: Install from source

```bash
# Clone the repository
git clone https://github.com/spoyner/IntentGraphGen.git
cd IntentGraphGen

# Install dependencies
npm install

# Build TypeScript
npm run build
```

---

## Configuration

### For Cursor IDE

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
2. Search for **"MCP: Edit Configuration"**
3. Add this configuration:

**If installed via npm:**
```json
{
  "mcpServers": {
    "intent-graph": {
      "command": "npx",
      "args": ["intent-graph-mcp-server"]
    }
  }
}
```

**If installed from source:**
```json
{
  "mcpServers": {
    "intent-graph": {
      "command": "node",
      "args": ["/absolute/path/to/IntentGraphGen/build/index.js"]
    }
  }
}
```

4. **Restart Cursor**

### For Claude Desktop

1. Locate your config file:
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux:** `~/.config/Claude/claude_desktop_config.json`

2. Add the same configuration as above

3. **Restart Claude Desktop**

### Verify Installation

After restarting, ask the AI:
```
List all available MCP tools
```

You should see 19 IntentGraph tools including `create_graph`, `add_node`, `add_edge`, `validate_graph`, and more.

---

## Usage Examples

### Example 1: Build a Simple Sequential Graph

```javascript
// 1. Create graph
create_graph({
  purpose: "Process customer orders",
  available_agents: [
    {
      name: "OrderValidator",
      type: "validator",
      capabilities: ["validate_schema"],
      input_schema: { order: "object" },
      output_schema: { is_valid: "boolean", validated_order: "object" }
    },
    {
      name: "PaymentProcessor",
      type: "api",
      capabilities: ["process_payment"],
      input_schema: { amount: "number", method: "object" },
      output_schema: { transaction_id: "string", status: "string" }
    }
  ]
})
// Returns: { graph_id: "graph_20250102_001", status: "initialized" }

// 2. Add entry node
add_node({
  graph_id: "graph_20250102_001",
  agent_name: "OrderValidator",
  node_config: {
    node_type: "entry",
    purpose: "Validate incoming order",
    inputs: {
      order: {
        source: "params.order",
        source_type: "request",
        required: true
      }
    }
  }
})
// Returns: { node_id: "node_ordervalidator_xyz", status: "added" }

// 3. Add processing node
add_node({
  graph_id: "graph_20250102_001",
  agent_name: "PaymentProcessor",
  node_config: {
    node_type: "processing",
    purpose: "Process payment",
    inputs: {
      amount: {
        source: "node_ordervalidator_xyz.validated_order.total",
        source_type: "node_output",
        source_node: "node_ordervalidator_xyz",
        required: true
      }
    }
  }
})
// Returns: { node_id: "node_paymentprocessor_abc", status: "added" }

// 4. Connect nodes
add_edge({
  graph_id: "graph_20250102_001",
  from_node: "node_ordervalidator_xyz",
  to_node: "node_paymentprocessor_abc",
  edge_config: {
    edge_type: "conditional",
    condition: {
      expression: "node_ordervalidator_xyz.is_valid === true",
      evaluation_context: "node_output"
    }
  }
})
// Returns: { edge_id: "edge_...", status: "added" }

// 5. Validate graph
validate_graph({
  graph_id: "graph_20250102_001"
})
// Returns: { is_valid: true, checks_performed: [...] }

// 6. Export as JSON
export_graph({
  graph_id: "graph_20250102_001",
  format: "json"
})
```

### Example 2: Analyze and Optimize

```javascript
// Find parallel opportunities
find_parallel_opportunities({
  graph_id: "graph_20250102_001"
})

// Calculate critical path
calculate_critical_path({
  graph_id: "graph_20250102_001"
})

// Get improvement suggestions
suggest_improvements({
  graph_id: "graph_20250102_001"
})
```

### Example 3: Visualize with Mermaid

```javascript
visualize_graph({
  graph_id: "graph_20250102_001"
})
// Returns Mermaid diagram code - paste into Mermaid renderer
```

---

## Architecture

### Stateless Design
- Graphs stored in-memory (Map-based storage)
- Each tool call is stateless and explicit
- Easy to scale horizontally
- Simple testing and debugging

### Type-Safe
- Full TypeScript implementation
- Comprehensive type definitions
- Schema validation at runtime
- No `any` types

### Error Handling
- All tools return `{ success: true, result }` or `{ success: false, error }`
- Detailed error messages with codes
- Actionable error details
- Proper MCP error formatting

---

## Schema Compliance

This MCP server maintains full compatibility with **IntentGraph Schema v1.0**:

- ✅ 12+ node properties (node_id, agent_name, inputs, outputs, configuration, etc.)
- ✅ 6 edge types (sequential, parallel, conditional, fallback, retry, iteration)
- ✅ Execution planning with parallel groups
- ✅ Error handling strategies
- ✅ Resource estimation
- ✅ Comprehensive validation

---

## Development

### Build
```powershell
npm run build
```

### Watch Mode
```powershell
npm run watch
```

### Development Mode
```powershell
npm run dev
```

---

## Troubleshooting

### Issue: Server not connecting
- **Check:** Node.js version >= 18.0.0
- **Check:** Build succeeded (`npm run build`)
- **Check:** Config path is correct in Claude/Cursor settings

### Issue: Tool not found
- **Check:** Tool name matches exactly (case-sensitive)
- **Check:** Server restarted after config changes

### Issue: Graph not found
- **Remember:** Graphs are stored in-memory only
- **Solution:** Graphs cleared when server restarts

---

## Migration from Copilot Agent

If you're migrating from the Copilot Studio agent:

1. **Same Schema:** Output format is identical
2. **Same Validation:** All validation rules preserved
3. **Backward Compatible:** Export JSON matches original format
4. **Incremental Adoption:** Use alongside existing agent

---

## API Reference

### Tool Schemas

All tools follow strict JSON schemas. See tool definitions in `src/index.ts` for complete schemas.

### Response Format

**Success Response:**
```json
{
  "success": true,
  "result": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  }
}
```

---

## Project Structure

```
IntentGraphGen/
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── types.ts          # TypeScript type definitions
│   ├── storage.ts        # In-memory graph storage
│   ├── utils.ts          # Utility functions (validation, analysis)
│   └── tools.ts          # All tool implementations
├── build/                # Compiled JavaScript (git-ignored)
├── intent_graph_schema_v1.json
├── intent_graph_examples.md
├── mcp_migration_plan.md
├── package.json
├── tsconfig.json
└── README.md
```

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

**What this means:**
You're free to use this MCP server in your projects, modify it, or build upon it. Just keep the copyright notice and acknowledge the original author. That's it!

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Ways to Contribute
- 🐛 Report bugs
- 💡 Suggest features
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the repository

## Changelog

### v1.0.0 (2025-10-02)
- ✨ Initial release
- ✨ 19 composable tools for graph construction
- ✨ Full IntentGraph Schema v1.0 compliance
- ✨ Validation, analysis, and optimization tools
- ✨ Export in JSON, YAML, DOT, Mermaid formats
- ✨ Comprehensive documentation and examples

## Acknowledgments

Built with ❤️ using:
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk) - MCP SDK
- TypeScript - Type-safe development
- Node.js - Runtime environment

Special thanks to the Model Context Protocol community for creating an amazing standard for AI tool integration.

