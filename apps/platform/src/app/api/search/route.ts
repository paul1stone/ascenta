import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { searchKnowledgeBase } from "@/lib/rag/search";

/**
 * POST - Search the knowledge base
 */
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { query, limit: rawLimit = 5, similarityThreshold = 0.7 } = body;
    const limit = Math.min(rawLimit, 50);

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
