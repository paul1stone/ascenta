import { eq, sql, desc } from "drizzle-orm";
import {
  db,
  documents,
  embeddings,
  type NewDocument,
  type NewEmbedding,
} from "./index";

/**
 * Create a new document
 */
export async function createDocument(data: NewDocument) {
  const [document] = await db.insert(documents).values(data).returning();
  return document;
}

/**
 * Get a document by ID
 */
export async function getDocument(id: string) {
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id));
  return document;
}

/**
 * Get all documents
 */
export async function getAllDocuments() {
  return db.select().from(documents).orderBy(desc(documents.createdAt));
}

/**
 * Update a document
 */
export async function updateDocument(
  id: string,
  data: Partial<Pick<NewDocument, "title" | "content" | "source" | "metadata">>
) {
  const [updated] = await db
    .update(documents)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(documents.id, id))
    .returning();
  return updated;
}

/**
 * Delete a document and its embeddings
 */
export async function deleteDocument(id: string) {
  await db.delete(documents).where(eq(documents.id, id));
}

/**
 * Add embeddings for a document
 */
export async function addEmbeddings(data: NewEmbedding[]) {
  return db.insert(embeddings).values(data).returning();
}

/**
 * Delete all embeddings for a document
 */
export async function deleteDocumentEmbeddings(documentId: string) {
  await db.delete(embeddings).where(eq(embeddings.documentId, documentId));
}

/**
 * Semantic search using pgvector cosine similarity
 * Returns the most similar chunks to the query embedding
 */
export async function searchSimilarChunks(
  queryEmbedding: number[],
  limit: number = 5,
  similarityThreshold: number = 0.7
) {
  // Use pgvector's cosine distance operator <=>
  // Lower distance = more similar, so we use 1 - distance for similarity
  const results = await db.execute(sql`
    SELECT 
      e.id,
      e.document_id,
      e.content,
      e.chunk_index,
      e.metadata,
      d.title as document_title,
      d.source as document_source,
      1 - (e.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) as similarity
    FROM embeddings e
    JOIN documents d ON e.document_id = d.id
    WHERE 1 - (e.embedding <=> ${JSON.stringify(queryEmbedding)}::vector) > ${similarityThreshold}
    ORDER BY e.embedding <=> ${JSON.stringify(queryEmbedding)}::vector
    LIMIT ${limit}
  `);

  return results.rows as Array<{
    id: string;
    document_id: string;
    content: string;
    chunk_index: string | null;
    metadata: Record<string, unknown> | null;
    document_title: string | null;
    document_source: string | null;
    similarity: number;
  }>;
}

/**
 * Get embeddings for a specific document
 */
export async function getDocumentEmbeddings(documentId: string) {
  return db
    .select()
    .from(embeddings)
    .where(eq(embeddings.documentId, documentId))
    .orderBy(embeddings.chunkIndex);
}
