import { getRAGContext, type SearchResult } from "./search";
import { buildRAGPrompt, DEFAULT_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { AI_CONFIG } from "@/lib/ai/config";

/**
 * Build a context-enhanced system prompt with RAG results
 */
export async function buildContextualPrompt(
  query: string,
  options: {
    systemPrompt?: string;
    maxChunks?: number;
  } = {}
): Promise<string> {
  const {
    systemPrompt = DEFAULT_SYSTEM_PROMPT,
    maxChunks = 5,
  } = options;

  // Get relevant context from knowledge base
  const context = await getRAGContext(query, maxChunks);

  // Build the enhanced prompt
  return buildRAGPrompt(context, systemPrompt);
}

/**
 * Estimate token count for context
 */
function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Fit context within token limits
 * Prioritizes by similarity score
 */
export function fitContextToLimit(
  results: SearchResult[],
  maxTokens: number = AI_CONFIG.context.maxTokens
): SearchResult[] {
  // Sort by similarity (highest first)
  const sorted = [...results].sort((a, b) => b.similarity - a.similarity);

  const fitted: SearchResult[] = [];
  let totalTokens = 0;

  for (const result of sorted) {
    const resultTokens = estimateTokenCount(result.content);
    if (totalTokens + resultTokens <= maxTokens) {
      fitted.push(result);
      totalTokens += resultTokens;
    } else {
      break;
    }
  }

  return fitted;
}

/**
 * Format search results for display
 */
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return "No relevant documents found.";
  }

  return results
    .map((r, i) => {
      const source = r.documentSource || r.documentTitle || "Unknown source";
      const similarity = (r.similarity * 100).toFixed(1);
      return `[${i + 1}] ${source} (${similarity}% match)\n${r.content}`;
    })
    .join("\n\n---\n\n");
}
