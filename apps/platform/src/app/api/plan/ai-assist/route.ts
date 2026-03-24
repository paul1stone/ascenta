import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { AI_CONFIG } from "@/lib/ai/config";
import { getModel } from "@/lib/ai/providers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { section, context, currentValue } = body;

    if (!section) {
      return NextResponse.json(
        { success: false, error: "section is required" },
        { status: 400 },
      );
    }

    const prompts: Record<string, string> = {
      mission: `You are helping craft a company mission statement. A mission statement describes the company's purpose — what it does, who it serves, and why it exists. It should be clear, concise (1-3 sentences), and inspiring.`,
      vision: `You are helping craft a company vision statement. A vision statement describes the future the company aspires to create — where it's headed. It should be aspirational, forward-looking, and concise (1-3 sentences).`,
      values: `You are helping define company values. Values describe the principles and beliefs that guide how the company operates and makes decisions. List 3-6 core values, each with a brief description (1-2 sentences).`,
      strategy_description: `You are helping write a strategy goal description. Make it specific, actionable, and measurable. 2-4 sentences.`,
      strategy_metrics: `You are helping define success metrics for a strategy goal. Suggest 2-4 concrete, measurable success criteria.`,
    };

    const systemPrompt = prompts[section];
    if (!systemPrompt) {
      return NextResponse.json(
        { success: false, error: `Unknown section: ${section}` },
        { status: 400 },
      );
    }

    let userPrompt = "";
    if (currentValue) {
      userPrompt = `Here is the current draft:\n\n${currentValue}\n\nPlease refine and improve it.`;
    } else if (context) {
      userPrompt = `Here is context from other sections of the company strategy:\n\n${context}\n\nBased on this context, generate a strong draft.`;
    } else {
      userPrompt = `Generate a strong draft. The user will refine it from here.`;
    }

    // getModel(modelId) returns a provider-routed model instance
    const result = await generateText({
      model: getModel(AI_CONFIG.defaultModels.openai),
      system: systemPrompt,
      prompt: userPrompt,
    });

    return NextResponse.json({ success: true, text: result.text });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("AI assist error:", message);
    return NextResponse.json(
      { success: false, error: "AI assist failed" },
      { status: 500 },
    );
  }
}
