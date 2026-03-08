import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { AI_CONFIG, type Provider, getProviderForModel } from "./config";

/**
 * OpenAI Provider Instance
 */
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Anthropic Provider Instance
 */
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Ollama Provider Instance (uses OpenAI-compatible API)
 */
const ollama = createOpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
  apiKey: "ollama", // Required by the SDK but not used by Ollama
});

/**
 * Get the appropriate provider instance based on provider name
 */
export function getProvider(provider: Provider) {
  switch (provider) {
    case "openai":
      return openai;
    case "anthropic":
      return anthropic;
    case "ollama":
      return ollama;
    default:
      return openai;
  }
}

/**
 * Get the model instance for a given model ID
 * Automatically routes to the correct provider
 */
export function getModel(modelId: string) {
  const provider = getProviderForModel(modelId);
  
  switch (provider) {
    case "openai":
      return openai(modelId);
    case "anthropic":
      return anthropic(modelId);
    case "ollama":
      return ollama.chat(modelId);
    default:
      return openai(AI_CONFIG.defaultModels.openai);
  }
}

/**
 * Get the embedding model
 * Currently only OpenAI embeddings are supported
 */
export function getEmbeddingModel() {
  return openai.embedding(AI_CONFIG.embedding.model);
}

/**
 * Check if API keys are configured
 */
export function checkProviderConfig(): {
  openai: boolean;
  anthropic: boolean;
  ollama: boolean;
} {
  return {
    openai: !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-...",
    anthropic: !!process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "sk-ant-...",
    ollama: true, // Ollama is local, no API key needed
  };
}
