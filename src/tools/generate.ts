/**
 * generate_intent_graph - v2 primary tool
 */

import type {
  OrchestrationCard,
  GenerationOptions,
  GenerateIntentGraphOutput,
  ToolResponse
} from '../types.js';
import { LLMClient } from '../llm/client.js';
import { validateGraph } from '../utils.js';

function getEnv(name: string, fallback?: string): string | undefined {
  try {
    return process.env[name] ?? fallback;
  } catch {
    return fallback;
  }
}

export async function generateIntentGraphTool(params: {
  orchestration_card: OrchestrationCard,
  options?: GenerationOptions
}): Promise<ToolResponse<GenerateIntentGraphOutput>> {
  try {
    const { orchestration_card, options } = params;

    // Support multiple environment variable naming schemes for flexibility
    const apiKey = getEnv('LLM_API_KEY') || getEnv('WRITER_API_KEY') || getEnv('OPENAI_API_KEY') || getEnv('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return { success: false, error: { code: 'CONFIG_ERROR', message: 'Missing LLM_API_KEY (or WRITER_API_KEY/OPENAI_API_KEY/ANTHROPIC_API_KEY)' } };
    }

    const model = getEnv('LLM_MODEL') || getEnv('WRITER_MODEL') || 'palmyra-x5';
    const baseUrl = getEnv('LLM_BASE_URL') || getEnv('WRITER_BASE_URL') || 'https://api.writer.com';

    const client = new LLMClient({ apiKey, model, baseUrl });
    const generated = await client.generateIntentGraph(orchestration_card, {
      include_artifacts: options?.include_artifacts,
      artifact_types: options?.artifact_types
    });

    // Optionally validate
    if (options?.validate) {
      const validation = validateGraph({
        intent_graph: generated.intent_graph,
        metadata: {
          graph_id: 'temp',
          version: '2.0.0',
          created_at: new Date().toISOString(),
          complexity_metrics: { node_count: 0, edge_count: 0, depth: 0, complexity_score: 0 }
        },
        validation: { is_valid: true, checks_performed: [] }
      });
      generated.validation = validation;
    }

    return { success: true, result: generated };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'GENERATION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to generate intent graph',
        details: { error: String(error) }
      }
    };
  }
}
