import { connectDB } from "@ascenta/db";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getModel, checkProviderConfig } from "@/lib/ai/providers";
import { AI_CONFIG } from "@/lib/ai/config";

/**
 * Pick a default model from whichever AI provider is actually configured.
 * Prefers OpenAI (default model here is gpt-4o), falls back to Anthropic,
 * then Ollama. Returns null if nothing is configured so callers can 503.
 */
function pickConfiguredModel(): string | null {
  const { openai, anthropic, ollama } = checkProviderConfig();
  if (openai) return AI_CONFIG.defaultModels.openai;
  if (anthropic) return AI_CONFIG.defaultModels.anthropic;
  if (ollama) return AI_CONFIG.defaultModels.ollama;
  return null;
}

const FIELD_PROMPTS: Record<string, string> = {
  openingMove:
    "Generate a warm, specific opening line for a manager to start a check-in conversation. It should reference the employee's self-reflection preview and invite the employee to share first. One sentence, conversational tone.",
  recognition:
    "Suggest a specific, values-anchored recognition statement the manager could use. It should name a concrete contribution, not generic praise. One to two sentences.",
  development:
    "Generate an open-ended developmental question appropriate for this employee's current situation. Focus on growth and future, not past performance. One question.",
  coaching:
    "Suggest 2-3 concrete coaching approaches for addressing the employee's stuck point. Be specific and actionable, not generic advice.",
  opener:
    "Generate a suggested opening statement for the participate phase that references the employee's preparation and invites dialogue. One to two sentences.",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const userId = request.headers.get("x-dev-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const checkIn = await CheckIn.findById(id)
    .populate("employee", "firstName lastName department jobTitle")
    .populate("goals", "objectiveStatement goalType keyResults")
    .populate(
      "previousCheckInId",
      "gapSignals managerReflect participate",
    )
    .lean();

  if (!checkIn) {
    return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
  }

  // Verify manager access — check both populated and unpopulated forms
  const managerId =
    (checkIn.manager as any)?._id?.toString() ||
    checkIn.manager?.toString();
  if (managerId !== userId) {
    return NextResponse.json(
      { error: "Only manager can use AI assist" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const { field } = body as { field: string };

  const fieldPrompt = FIELD_PROMPTS[field];
  if (!fieldPrompt) {
    return NextResponse.json({ error: "Unknown field" }, { status: 400 });
  }

  const employee = checkIn.employee as any;
  const goals = (checkIn.goals as any[])
    .map((g: any) => g.objectiveStatement)
    .join("; ");

  const contextParts = [
    `Employee: ${employee.firstName} ${employee.lastName}, ${employee.jobTitle}, ${employee.department}`,
    `Goals: ${goals}`,
  ];

  if (checkIn.employeePrepare?.distilledPreview) {
    contextParts.push(
      `Employee preparation summary: ${checkIn.employeePrepare.distilledPreview}`,
    );
  }

  if (checkIn.previousCheckInId) {
    const prev = checkIn.previousCheckInId as any;
    if (prev?.managerReflect?.forwardAction) {
      contextParts.push(
        `Manager's previous forward action: ${prev.managerReflect.forwardAction}`,
      );
    }
  }

  const modelId = pickConfiguredModel();
  if (!modelId) {
    return NextResponse.json(
      { error: "No AI provider configured" },
      { status: 503 },
    );
  }

  try {
    const model = getModel(modelId);

    const result = await generateText({
      model,
      system:
        "You are a coaching assistant helping managers prepare for employee check-in conversations. Be warm, specific, and actionable. Never be generic.",
      prompt: `${contextParts.join("\n")}\n\n${fieldPrompt}`,
      maxOutputTokens: 200,
    });

    return NextResponse.json({ suggestion: result.text });
  } catch (error) {
    console.error("AI assist error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestion" },
      { status: 500 },
    );
  }
}
