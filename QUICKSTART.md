# IntentGraph MCP Server - Quick Start Guide

Get up and running with the IntentGraph MCP Server in **under 5 minutes**.

---

## Installation

Choose your preferred installation method:

### Option 1: Install from npm (Recommended)

```bash
npm install -g intent-graph-mcp-server
```

✅ Installs globally - ready to use anywhere!

### Option 2: Install from source

```bash
git clone https://github.com/spoyner/IntentGraphGen.git
cd IntentGraphGen
npm install
npm run build
```

---

## Configuration

### For Cursor IDE

1. Open Cursor
2. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
3. Search for **"MCP: Edit Configuration"**
4. Add this configuration:

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

5. **Restart Cursor**

### For Claude Desktop

1. Locate config file:
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux:** `~/.config/Claude/claude_desktop_config.json`

2. Add the same configuration as above

3. **Restart Claude Desktop**

---

## Verify Installation

After restarting Cursor or Claude Desktop, try asking:

```
List all available MCP tools
```

You should see **19 IntentGraph tools** including:
- `create_graph`
- `add_node`
- `add_edge`
- `validate_graph`
- `visualize_graph`
- and more...

---

## Your First Intent Graph

Let's build a simple customer order processing workflow:

### Step 1: Create a Graph

Ask the AI:
```
Create a new intent graph for processing customer orders with these agents:
- OrderValidator (validator type)
- PaymentProcessor (api type)
- NotificationService (tool type)
```

The AI will call `create_graph` and return a graph ID.

### Step 2: Add Nodes

Ask the AI:
```
Add three nodes to the graph:
1. OrderValidator as entry point
2. PaymentProcessor as processing node
3. NotificationService as exit point
```

The AI will call `add_node` three times.

### Step 3: Connect with Edges

Ask the AI:
```
Connect the nodes:
- OrderValidator → PaymentProcessor (conditional: is_valid === true)
- PaymentProcessor → NotificationService (conditional: status === 'success')
```

The AI will call `add_edge` to create the flow.

### Step 4: Validate

Ask the AI:
```
Validate the graph structure
```

The AI will call `validate_graph` and report any issues.

### Step 5: Visualize

Ask the AI:
```
Show me a Mermaid diagram of this graph
```

The AI will call `visualize_graph` and display a visual representation!

---

## Example Workflow

Here's a complete conversation you can try:

```
You: Create an intent graph for "E-commerce Order Processing" with agents:
     - OrderValidator, InventoryChecker, PaymentProcessor, ShippingService

AI: [Creates graph with ID: graph_xyz123]

You: Add OrderValidator as the entry node that validates order data

AI: [Adds node]

You: Add InventoryChecker to check stock availability

AI: [Adds node]

You: Connect them with a conditional edge: is_valid === true

AI: [Creates edge]

You: Continue building the workflow...

AI: [Continues adding nodes and edges]

You: Validate the complete graph

AI: [Runs validation, reports all checks passed]

You: Analyze the complexity

AI: [Shows metrics: 4 nodes, 3 edges, depth 4, complexity score 29]

You: Suggest optimizations

AI: [Suggests adding error handling and timeouts]

You: Export as JSON

AI: [Exports complete graph in JSON format]
```

---

## Common Tasks

### List All Graphs
```
Show me all intent graphs
```

### Get Graph Details
```
Get the full details of graph <graph_id>
```

### Add Error Handling
```
Update the PaymentProcessor node to include retry logic
```

### Find Optimization Opportunities
```
Suggest improvements for this graph
```

### Export in Different Formats
```
Export this graph as YAML
```

---

## Available Tools

| Tool | Purpose |
|------|---------|
| **Graph Management** |
| `create_graph` | Initialize new graph |
| `get_graph` | Retrieve graph by ID |
| `delete_graph` | Remove graph |
| `list_graphs` | List all graphs |
| **Node Operations** |
| `add_node` | Add agent node |
| `update_node` | Modify node config |
| `remove_node` | Delete node |
| `list_nodes` | List all nodes |
| **Edge Operations** |
| `add_edge` | Connect nodes |
| `update_edge` | Modify edge |
| `remove_edge` | Delete edge |
| `list_edges` | List all edges |
| **Validation** |
| `validate_graph` | Check structure |
| `analyze_complexity` | Get metrics |
| `find_parallel_opportunities` | Find parallelization |
| `calculate_critical_path` | Find longest path |
| **Optimization** |
| `suggest_improvements` | Get suggestions |
| **Export** |
| `export_graph` | Export (JSON/YAML/DOT/Mermaid) |
| `visualize_graph` | Generate Mermaid diagram |

---

## Tips & Best Practices

### 1. Build Incrementally
Start simple, add complexity gradually. Validate often!

### 2. Use Descriptive Purposes
Clear node purposes help the AI understand intent:
```
✅ "Validate customer order data and check required fields"
❌ "Validate order"
```

### 3. Add Error Handling Early
Don't wait until the end - add timeouts and retry policies as you build.

### 4. Leverage Validation
Run `validate_graph` frequently to catch issues early.

### 5. Visualize Often
Use `visualize_graph` to see the big picture as you build.

---

## Troubleshooting

### MCP Server Not Found

**Problem:** AI says it can't find IntentGraph tools

**Solution:**
1. Check config file syntax (valid JSON)
2. Verify path to `index.js` (if using source install)
3. Restart Cursor/Claude Desktop
4. Check Node.js version: `node --version` (need >= 18.0.0)

### Graph Not Found Error

**Problem:** "Graph with ID xyz not found"

**Cause:** Graphs are stored in-memory only

**Solution:** 
- Graphs are cleared when server restarts
- Keep graph IDs from the same session
- Future versions will add persistence

### Invalid Graph Structure

**Problem:** Validation fails

**Solution:**
1. Check that all edges reference existing nodes
2. Ensure entry and exit points are defined
3. Verify no circular dependencies (must be DAG)
4. Run `validate_graph` for detailed error report

### npm Installation Issues

**Problem:** `npm install -g` fails

**Solution:**
```bash
# Try without global flag
npm install intent-graph-mcp-server

# Or use npx directly (no install needed)
npx intent-graph-mcp-server
```

---

## Next Steps

### Learn More
- 📖 **README.md** - Complete documentation
- 📊 **intent_graph_examples.md** - Example graphs
- 🔧 **intent_graph_schema_v1.json** - Schema reference

### Contribute
- 🐛 Report bugs: [GitHub Issues](https://github.com/spoyner/IntentGraphGen/issues)
- 💡 Suggest features
- 🤝 Contribute code: See [CONTRIBUTING.md](CONTRIBUTING.md)

### Share
- ⭐ Star on GitHub
- 📢 Share with your team
- 💬 Join MCP community discussions

---

## Examples

Check `intent_graph_examples.md` for:
- ✅ Sequential workflow
- ✅ Parallel execution
- ✅ Complex branching
- ✅ Error handling

---

## Support

- **Documentation:** This guide + README.md
- **Schema:** intent_graph_schema_v1.json
- **Issues:** https://github.com/spoyner/IntentGraphGen/issues
- **Contact:** Sean Poyner <sean.poyner@pm.me>

---

**Happy Graph Building!** 🚀

---

*IntentGraph MCP Server - Making agent orchestration transparent and composable*

**Version:** 1.0.0  
**License:** MIT  
**Author:** Sean Poyner
