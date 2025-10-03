/**
 * Universal LLM Client
 * Supports any OpenAI-compatible API (Writer Palmyra, Claude, OpenAI, custom endpoints)
 * Minimal client with retries and structured logging to stderr
 */

import type { OrchestrationCard, GenerateIntentGraphOutput, IntentGraph, ValidationResult } from '../types.js';

interface LLMClientOptions {
  apiKey: string;
  model: string;
  baseUrl?: string; // API endpoint (e.g., https://api.writer.com, https://api.anthropic.com, https://api.openai.com)
  maxRetries?: number;
  timeoutMs?: number;
}

export class LLMClient {
  private apiKey: string;
  private model: string;
  private baseUrl: string;
  private maxRetries: number;
  private timeoutMs: number;

  constructor(opts: LLMClientOptions) {
    this.apiKey = opts.apiKey;
    this.model = opts.model;
    this.baseUrl = opts.baseUrl || 'https://api.writer.com';
    this.maxRetries = opts.maxRetries ?? 2;
    this.timeoutMs = opts.timeoutMs ?? 30000;
  }

  async generateIntentGraph(orchestrationCard: OrchestrationCard, options?: { include_artifacts?: boolean; artifact_types?: string[] }): Promise<GenerateIntentGraphOutput> {
    const includeArtifacts = options?.include_artifacts ?? false;
    const artifactTypes = options?.artifact_types ?? ['reasoning', 'alternatives', 'optimizations'];
    
    // Build comprehensive prompt that includes user's request and all context
    const systemPrompt = `You are an expert workflow architect that designs intent graphs for agent orchestration.

Your task is to:
1. Analyze the USER'S REQUEST (what they want to accomplish)
2. Review the AVAILABLE AGENTS and their capabilities
3. Design an efficient workflow graph that fulfills the user's request
4. Return a complete IntentGraph JSON structure${includeArtifacts ? ' with artifacts' : ''}

The intent graph must:
- Start with entry nodes that process the user's input
- Use the available agents appropriately based on their capabilities
- Connect nodes with proper edges (sequential, parallel, conditional, etc.)
- End with exit nodes that produce the desired output
- Include error handling and retry strategies where appropriate
- Optimize for the specified preferences (speed, cost, reliability, etc.)

CRITICAL: You MUST respond with ONLY valid JSON in this exact format:
{
  "intent_graph": {
    "nodes": [...],
    "edges": [...],
    "execution_plan": {
      "entry_points": [...],
      "exit_points": [...],
      "execution_strategy": "sequential|parallel|hybrid"
    }
  }${includeArtifacts ? `,
  "artifacts": {
    ${artifactTypes.includes('reasoning') ? '"reasoning": "Your step-by-step reasoning for the graph design",' : ''}
    ${artifactTypes.includes('alternatives') ? '"alternatives": [{"approach": "Alternative approach 1", "pros": [], "cons": []}, ...],' : ''}
    ${artifactTypes.includes('optimizations') ? '"optimizations": [{"type": "optimization type", "description": "what was optimized", "impact": "expected impact"}]' : ''}
  }` : ''}
}

Do NOT include any explanatory text before or after the JSON. ONLY return the JSON object.`;

    const userPrompt = `USER'S REQUEST:
"${orchestrationCard.user_request.description}"

${orchestrationCard.user_request.domain ? `DOMAIN: ${orchestrationCard.user_request.domain}` : ''}

${orchestrationCard.user_request.success_criteria?.length ? `SUCCESS CRITERIA:
${orchestrationCard.user_request.success_criteria.map(c => `- ${c}`).join('\n')}` : ''}

AVAILABLE AGENTS:
${orchestrationCard.available_agents.map((agent, i) => `${i + 1}. ${agent.name} (${agent.type})
   Capabilities: ${agent.capabilities.join(', ')}
   Input: ${JSON.stringify(agent.input_schema)}
   Output: ${JSON.stringify(agent.output_schema)}`).join('\n\n')}

${orchestrationCard.available_mcp_servers?.length ? `\nAVAILABLE MCP SERVERS:
${orchestrationCard.available_mcp_servers.map(s => `- ${s.name}: ${s.tools.length} tools available`).join('\n')}` : ''}

${orchestrationCard.available_tools?.length ? `\nAVAILABLE EXTERNAL TOOLS:
${orchestrationCard.available_tools.map(t => `- ${t.name}: ${t.description || 'No description'}`).join('\n')}` : ''}

${orchestrationCard.constraints ? `\nCONSTRAINTS:
${orchestrationCard.constraints.max_iterations ? `- Max iterations: ${orchestrationCard.constraints.max_iterations}` : ''}
${orchestrationCard.constraints.timeout_ms ? `- Timeout: ${orchestrationCard.constraints.timeout_ms}ms` : ''}
${orchestrationCard.constraints.max_parallel_nodes ? `- Max parallel nodes: ${orchestrationCard.constraints.max_parallel_nodes}` : ''}` : ''}

${orchestrationCard.preferences ? `\nPREFERENCES:
${orchestrationCard.preferences.optimize_for ? `- Optimize for: ${orchestrationCard.preferences.optimize_for}` : ''}
${orchestrationCard.preferences.parallelization ? `- Parallelization: ${orchestrationCard.preferences.parallelization}` : ''}` : ''}

${orchestrationCard.special_requirements?.length ? `\nSPECIAL REQUIREMENTS:
${orchestrationCard.special_requirements.map(r => `- ${r}`).join('\n')}` : ''}

${orchestrationCard.context?.environment ? `\nENVIRONMENT: ${orchestrationCard.context.environment}` : ''}

Design a complete intent graph that fulfills the user's request using the available resources.`;

    const body = {
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4096
    };

    const start = Date.now();
    const responseJson = await this.postWithRetry('/v1/chat/completions', body);

    let content = responseJson?.choices?.[0]?.message?.content || '{}';
    
    // Strip markdown code blocks if present (```json ... ``` or ``` ... ```)
    if (typeof content === 'string') {
      content = content.trim();
      // Remove ```json\n...\n``` or ```\n...\n```
      content = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '');
    }
    
    let parsed: any;
    try {
      parsed = typeof content === 'string' ? JSON.parse(content) : content;
    } catch (e) {
      console.error('[LLMClient] Failed to parse model JSON:', e);
      console.error('[LLMClient] Content:', content.substring(0, 200));
      parsed = {};
    }

    // Coerce into GenerateIntentGraphOutput shape (best effort)
    const output: GenerateIntentGraphOutput = {
      intent_graph: (parsed.intent_graph as IntentGraph) ?? { nodes: [], edges: [], execution_plan: { entry_points: [], exit_points: [], execution_strategy: 'sequential' } },
      metadata: {
        generation_timestamp: new Date().toISOString(),
        llm_model_used: this.model,
        generation_time_ms: Date.now() - start,
        complexity_score: parsed?.metadata?.complexity_score,
        estimated_execution_time_ms: parsed?.metadata?.estimated_execution_time_ms,
        estimated_cost: parsed?.metadata?.estimated_cost
      },
      artifacts: parsed?.artifacts,
      validation: parsed?.validation as ValidationResult | undefined
    };

    return output;
  }

  private async postWithRetry(path: string, body: unknown): Promise<any> {
    let attempt = 0;
    let lastErr: unknown;

    while (attempt <= this.maxRetries) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
        const res = await fetch(this.baseUrl + path, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(body),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`HTTP ${res.status}: ${text}`);
        }
        return await res.json();
      } catch (err) {
        lastErr = err;
        console.error(`[LLMClient] Attempt ${attempt + 1} failed:`, err);
        attempt += 1;
        if (attempt > this.maxRetries) break;
        await new Promise(r => setTimeout(r, 500 * attempt));
      }
    }

    throw lastErr;
  }
}
