/**
 * AI Configuration
 * Central configuration for all AI-related settings
 */

export const AI_CONFIG = {
  // Default models for each provider
  defaultModels: {
    openai: "gpt-4o",
    anthropic: "claude-sonnet-4-20250514",
  },

  // Available models by provider
  models: {
    openai: [
      { id: "gpt-4o", name: "GPT-4o", description: "Most capable model" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and affordable" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "Previous generation" },
    ],
    anthropic: [
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", description: "Best balance of speed and capability" },
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Previous generation" },
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", description: "Fast and efficient" },
    ],
  },

  // Embedding configuration
  embedding: {
    model: "text-embedding-3-small",
    dimensions: 1536,
    maxChunkSize: 500, // tokens
    chunkOverlap: 50, // tokens
  },

  // Context window settings
  context: {
    maxMessages: 20, // Maximum messages to include in context
    maxTokens: 8000, // Approximate max tokens for context
  },

  // Rate limiting (requests per minute)
  rateLimits: {
    openai: 60,
    anthropic: 60,
  },
} as const;

export type Provider = "openai" | "anthropic";
export type OpenAIModel = (typeof AI_CONFIG.models.openai)[number]["id"];
export type AnthropicModel = (typeof AI_CONFIG.models.anthropic)[number]["id"];
export type Model = OpenAIModel | AnthropicModel;

/**
 * Get the provider for a given model
 */
export function getProviderForModel(model: string): Provider {
  if (AI_CONFIG.models.openai.some((m) => m.id === model)) {
    return "openai";
  }
  if (AI_CONFIG.models.anthropic.some((m) => m.id === model)) {
    return "anthropic";
  }
  // Default to OpenAI
  return "openai";
}
