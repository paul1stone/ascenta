import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { generateFocusLayerSuggestion } from "@/lib/ai/focus-layer-tool";

type Ctx = { params: Promise<{ employeeId: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  const { employeeId } = await ctx.params;
  if (!mongoose.isValidObjectId(employeeId)) {
    return NextResponse.json({ error: "Invalid employee id" }, { status: 404 });
  }
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI suggestions require OPENAI_API_KEY or ANTHROPIC_API_KEY" },
      { status: 503 }
    );
  }
  try {
    const responses = await generateFocusLayerSuggestion(employeeId);
    return NextResponse.json({ responses });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = /Assign a job description/.test(message) ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
