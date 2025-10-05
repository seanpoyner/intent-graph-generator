# Fix for Claude Desktop Intent-Graph Tool Errors

## The Problem

When you ask Claude Desktop to generate an intent graph, it encounters an error when trying to provide the orchestration card parameter. This is happening because Claude is having difficulty structuring the complex nested object correctly.

## The Solution 🎯

**Instead of asking Claude to create the orchestration card**, provide it directly as part of your prompt.

### Step-by-Step Fix

**1. Make sure Claude Desktop is running**

**2. Copy this EXACT prompt into Claude Desktop:**

```
Use the generate_intent_graph tool with this orchestration card:

{
  "user_request": {
    "description": "Process a customer support ticket with classification, priority assignment, expert routing, and response generation"
  },
  "available_agents": [
    {
      "name": "TicketClassifier",
      "type": "llm",
      "capabilities": ["classify_ticket", "extract_intent"],
      "input_schema": { "ticket": { "type": "object" } },
      "output_schema": { "category": { "type": "string" }, "priority": { "type": "string" } }
    },
    {
      "name": "PriorityAssigner",
      "type": "validator",
      "capabilities": ["assign_priority"],
      "input_schema": { "category": { "type": "string" } },
      "output_schema": { "priority": { "type": "string" } }
    },
    {
      "name": "ExpertRouter",
      "type": "router",
      "capabilities": ["route_to_expert"],
      "input_schema": { "category": { "type": "string" }, "priority": { "type": "string" } },
      "output_schema": { "assigned_expert": { "type": "string" } }
    },
    {
      "name": "ResponseGenerator",
      "type": "llm",
      "capabilities": ["generate_response"],
      "input_schema": { "ticket": { "type": "object" }, "expert": { "type": "string" } },
      "output_schema": { "response": { "type": "string" } }
    }
  ]
}
```

**3. Claude should successfully generate an intent graph!**

---

## Why This Happens

MCP tools with complex nested object parameters (like `orchestration_card`) can be challenging for Claude to construct dynamically. By providing the JSON structure directly in your prompt, you bypass this issue.

---

## Alternative: Ultra-Simple Test

If you want an even simpler test, try this:

```
Use the generate_intent_graph tool with this orchestration card:

{
  "user_request": {
    "description": "Classify a support ticket"
  },
  "available_agents": [
    {
      "name": "Classifier",
      "type": "llm",
      "capabilities": ["classify"],
      "input_schema": { "text": { "type": "string" } },
      "output_schema": { "category": { "type": "string" } }
    }
  ]
}
```

---

## What You'll See When It Works

Claude will return a JSON response containing:

- **intent_graph**: The generated workflow graph
  - `nodes`: Array of workflow steps
  - `edges`: Connections between nodes
  - `execution_plan`: How the graph should execute
- **metadata**: Generation timestamp, model used, complexity score
- **artifacts** (optional): Reasoning, alternatives, optimizations

Example output structure:
```json
{
  "intent_graph": {
    "nodes": [
      {
        "id": "node_1",
        "type": "agent",
        "agent_name": "TicketClassifier",
        "description": "Classify the support ticket"
      },
      ...
    ],
    "edges": [
      {
        "from": "node_1",
        "to": "node_2",
        "type": "sequential"
      },
      ...
    ],
    "execution_plan": {
      "entry_points": ["node_1"],
      "exit_points": ["node_4"],
      "execution_strategy": "sequential"
    }
  },
  "metadata": {
    "generation_timestamp": "2025-10-04T14:05:00Z",
    "llm_model_used": "palmyra-x5",
    "generation_time_ms": 2500
  }
}
```

---

## Testing Other Tools

Once `generate_intent_graph` works, try the other tools:

### Validate a Graph
```
Use the validate_graph tool to validate the intent graph you just generated
```

### Analyze a Graph
```
Use the analyze_graph tool to analyze the intent graph for bottlenecks and optimization opportunities
```

### Visualize a Graph
```
Use the visualize_graph tool to create a Mermaid diagram of the intent graph
```

### Export a Graph
```
Use the export_graph tool to export the intent graph in YAML format
```

---

## Troubleshooting

If it still doesn't work:

1. **Restart Claude Desktop** completely (quit, not just close window)
2. **Wait 10 seconds** after restart before trying
3. **Check the logs**: Run `.\Diagnose-MCP.ps1 -ShowLogs`
4. **Verify API key**: Check that your Writer API key in `claude_desktop_config.json` is valid
5. **See TROUBLESHOOTING.md** for comprehensive solutions

---

## Quick Diagnostic

Run this anytime to check your setup:

```powershell
.\Diagnose-MCP.ps1
```

To view logs:

```powershell
.\Diagnose-MCP.ps1 -ShowLogs
```

---

## Your Configuration (Verified ✅)

Based on the diagnostic:

- ✅ Node.js v22.16.0 installed
- ✅ Build exists at `build/index.js`
- ✅ Claude Desktop config found
- ✅ intent-graph MCP server configured
- ✅ API key present in config
- ✅ Logs directory exists

**Everything is configured correctly!** The issue is just with how the orchestration card is being provided to the tool.

---

## Need More Help?

- **Full setup guide**: `README.md`
- **Detailed troubleshooting**: `TROUBLESHOOTING.md`
- **Example orchestration cards**: `examples/orchestration-cards/`
- **Simple test card**: `test-simple.json`
- **Claude Desktop setup**: `CLAUDE-DESKTOP-SETUP.md`

---

## Summary

**Problem**: Claude encounters an error when providing the orchestration card

**Solution**: Provide the orchestration card directly in your prompt

**Expected Result**: Successful intent graph generation

**Test Now**: Copy the example prompt above and try it in Claude Desktop! 🚀


