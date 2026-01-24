import { NextResponse } from "next/server";
import { searchKnowledgeBase } from "@/lib/rag/search";

/**
 * POST - Search the knowledge base
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { query, limit = 5, similarityThreshold = 0.7 } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const results = await searchKnowledgeBase(query, {
      limit,
      similarityThreshold,
    });

    return NextResponse.json({
      query,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
