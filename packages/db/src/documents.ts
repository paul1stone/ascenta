import { DocumentModel, EmbeddingModel } from "./schema";
import type { NewDocument, NewEmbedding } from "./schema";

function toDocument(doc: InstanceType<typeof DocumentModel>) {
  return doc.toJSON() as unknown as {
    id: string;
    title: string | null;
    content: string | null;
    source: string | null;
    metadata: unknown;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Create a new document
 */
export async function createDocument(data: NewDocument) {
  const doc = await DocumentModel.create(data);
  return toDocument(doc);
}

/**
 * Get a document by ID
 */
export async function getDocument(id: string) {
  const doc = await DocumentModel.findById(id);
  return doc ? toDocument(doc) : undefined;
}

/**
 * Get all documents
 */
export async function getAllDocuments() {
  const docs = await DocumentModel.find().sort({ createdAt: -1 });
  return docs.map(toDocument);
}

/**
 * Update a document
 */
export async function updateDocument(
  id: string,
  data: Partial<Pick<NewDocument, "title" | "content" | "source" | "metadata">>
) {
  const doc = await DocumentModel.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true }
  );
  return doc ? toDocument(doc) : undefined;
}

/**
 * Delete a document and its embeddings (cascade)
 */
export async function deleteDocument(id: string) {
  await EmbeddingModel.deleteMany({ documentId: id });
  await DocumentModel.findByIdAndDelete(id);
}

/**
 * Add embeddings for a document
 */
export async function addEmbeddings(data: NewEmbedding[]) {
  const docs = await EmbeddingModel.insertMany(
    data.map((d) => ({
      documentId: d.documentId,
      chunkIndex: d.chunkIndex ?? undefined,
      content: d.content,
      embedding: d.embedding ?? undefined,
      metadata: d.metadata ?? undefined,
    }))
  );
  return docs.map((d: InstanceType<typeof EmbeddingModel>) => d.toJSON());
}

/**
 * Delete all embeddings for a document
 */
export async function deleteDocumentEmbeddings(documentId: string) {
  await EmbeddingModel.deleteMany({ documentId });
}

/**
 * Semantic search using MongoDB Atlas Vector Search ($vectorSearch)
 * Returns the most similar chunks to the query embedding.
 *
 * NOTE: Requires an Atlas Vector Search index named "embedding_index"
 * on the `embeddings` collection with the `embedding` field (1536 dims, cosine).
 */
export async function searchSimilarChunks(
  queryEmbedding: number[],
  limit: number = 5,
  similarityThreshold: number = 0.3
) {
  const results = await EmbeddingModel.aggregate([
    {
      $vectorSearch: {
        index: "embedding_index",
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: limit * 10,
        limit,
      },
    },
    {
      $addFields: {
        similarity: { $meta: "vectorSearchScore" },
      },
    },
    {
      $match: {
        similarity: { $gt: similarityThreshold },
      },
    },
    {
      $lookup: {
        from: "documents",
        localField: "documentId",
        foreignField: "_id",
        as: "doc",
      },
    },
    { $unwind: { path: "$doc", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        id: { $toString: "$_id" },
        document_id: { $toString: "$documentId" },
        content: 1,
        chunk_index: "$chunkIndex",
        metadata: 1,
        document_title: "$doc.title",
        document_source: "$doc.source",
        similarity: 1,
      },
    },
  ]);

  return results as Array<{
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
  const docs = await EmbeddingModel.find({ documentId }).sort({ chunkIndex: 1 });
  return docs.map((d: InstanceType<typeof EmbeddingModel>) => d.toJSON());
}
