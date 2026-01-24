import { generateEmbedding } from "./embeddings";
import { searchSimilarChunks } from "@/lib/db/documents";

export interface SearchResult {
  id: string;
  documentId: string;
  content: string;
  chunkIndex: string | null;
  metadata: Record<string, unknown> | null;
  documentTitle: string | null;
  documentSource: string | null;
  similarity: number;
}

/**
 * Search the knowledge base using semantic similarity
 */
export async function searchKnowledgeBase(
  query: string,
  options: {
    limit?: number;
    similarityThreshold?: number;
  } = {}
): Promise<SearchResult[]> {
  const { limit = 5, similarityThreshold = 0.7 } = options;

  // Generate embedding for the query
  const queryEmbedding = await generateEmbedding(query);

  // Search for similar chunks
  const results = await searchSimilarChunks(
    queryEmbedding,
    limit,
    similarityThreshold
  );

  return results.map((r) => ({
    id: r.id,
    documentId: r.document_id,
    content: r.content,
    chunkIndex: r.chunk_index,
    metadata: r.metadata,
    documentTitle: r.document_title,
    documentSource: r.document_source,
    similarity: r.similarity,
  }));
}

/**
 * Search and format results for RAG context
 */
export async function getRAGContext(
  query: string,
  limit: number = 5
): Promise<Array<{ content: string; source: string | null }>> {
  const results = await searchKnowledgeBase(query, { limit });

  return results.map((result) => ({
    content: result.content,
    source: result.documentSource || result.documentTitle || null,
  }));
}
