import { embed, embedMany } from "ai";
import { getEmbeddingModel } from "@/lib/ai/providers";
import { AI_CONFIG } from "@/lib/ai/config";

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { embedding } = await embed({
    model: getEmbeddingModel(),
    value: text,
  });
  return embedding;
}

/**
 * Generate embeddings for multiple texts
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: getEmbeddingModel(),
    values: texts,
  });
  return embeddings;
}

/**
 * Simple token estimator (approximation)
 * GPT models average ~4 characters per token
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Chunk text into smaller pieces for embedding
 * Uses a simple sentence-based approach with overlap
 */
export function chunkText(
  text: string,
  maxChunkSize: number = AI_CONFIG.embedding.maxChunkSize,
  overlap: number = AI_CONFIG.embedding.chunkOverlap
): string[] {
  // Split into sentences (simple approach)
  const sentences = text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);

  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentTokens = 0;

  for (const sentence of sentences) {
    const sentenceTokens = estimateTokens(sentence);

    if (currentTokens + sentenceTokens > maxChunkSize && currentChunk.length > 0) {
      // Save current chunk
      chunks.push(currentChunk.join(" "));

      // Start new chunk with overlap
      const overlapSentences: string[] = [];
      let overlapTokens = 0;

      // Take sentences from end of current chunk for overlap
      for (let i = currentChunk.length - 1; i >= 0 && overlapTokens < overlap; i--) {
        overlapSentences.unshift(currentChunk[i]);
        overlapTokens += estimateTokens(currentChunk[i]);
      }

      currentChunk = overlapSentences;
      currentTokens = overlapTokens;
    }

    currentChunk.push(sentence);
    currentTokens += sentenceTokens;
  }

  // Don't forget the last chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks;
}

/**
 * Process a document: chunk it and generate embeddings
 */
export async function processDocument(
  content: string,
  maxChunkSize?: number
): Promise<Array<{ content: string; embedding: number[] }>> {
  const chunks = chunkText(content, maxChunkSize);
  const embeddings = await generateEmbeddings(chunks);

  return chunks.map((chunk, index) => ({
    content: chunk,
    embedding: embeddings[index],
  }));
}
