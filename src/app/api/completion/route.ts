import { generateObject, generateText } from "ai";
import { z } from "zod";
import { NextResponse } from "next/server";
import { getModel } from "@/lib/ai/providers";
import { AI_CONFIG } from "@/lib/ai/config";

export const maxDuration = 30;

/**
 * Predefined schemas for common HR use cases
 */
const schemas = {
  // Extract employee information from text
  employeeInfo: z.object({
    name: z.string().optional().describe("Employee full name"),
    email: z.string().optional().describe("Employee email"),
    department: z.string().optional().describe("Department name"),
    role: z.string().optional().describe("Job title or role"),
    startDate: z.string().optional().describe("Start date if mentioned"),
    manager: z.string().optional().describe("Manager name if mentioned"),
  }),

  // Analyze sentiment of feedback or review
  sentimentAnalysis: z.object({
    sentiment: z.enum(["positive", "neutral", "negative"]).describe("Overall sentiment"),
    confidence: z.number().min(0).max(1).describe("Confidence score 0-1"),
    keyPhrases: z.array(z.string()).describe("Key phrases indicating sentiment"),
    summary: z.string().describe("Brief summary of the content"),
  }),

  // Classify HR inquiry type
  inquiryClassification: z.object({
    category: z.enum([
      "benefits",
      "payroll",
      "time_off",
      "performance",
      "compliance",
      "onboarding",
      "offboarding",
      "policy",
      "other"
    ]).describe("Primary category of the inquiry"),
    urgency: z.enum(["low", "medium", "high", "critical"]).describe("Urgency level"),
    suggestedAction: z.string().describe("Recommended next step"),
    requiresHumanReview: z.boolean().describe("Whether this needs human attention"),
  }),

  // Parse a job description
  jobDescription: z.object({
    title: z.string().describe("Job title"),
    department: z.string().optional().describe("Department"),
    responsibilities: z.array(z.string()).describe("Key responsibilities"),
    requirements: z.array(z.string()).describe("Required qualifications"),
    preferredQualifications: z.array(z.string()).optional().describe("Nice-to-have qualifications"),
    salaryRange: z.string().optional().describe("Salary range if mentioned"),
    location: z.string().optional().describe("Work location"),
    workType: z.enum(["remote", "hybrid", "onsite"]).optional().describe("Work arrangement"),
  }),

  // Meeting summary
  meetingSummary: z.object({
    title: z.string().describe("Meeting title"),
    date: z.string().optional().describe("Meeting date"),
    attendees: z.array(z.string()).describe("List of attendees"),
    keyPoints: z.array(z.string()).describe("Main discussion points"),
    actionItems: z.array(z.object({
      task: z.string(),
      assignee: z.string().optional(),
      dueDate: z.string().optional(),
    })).describe("Action items from the meeting"),
    decisions: z.array(z.string()).describe("Decisions made"),
  }),
};

type SchemaName = keyof typeof schemas;

interface CompletionRequest {
  prompt: string;
  schema?: SchemaName;
  customSchema?: Record<string, unknown>;
  model?: string;
  systemPrompt?: string;
}

/**
 * POST - Generate structured output
 */
export async function POST(req: Request) {
  try {
    const body: CompletionRequest = await req.json();
    const {
      prompt,
      schema: schemaName,
      customSchema,
      model = AI_CONFIG.defaultModels.openai,
      systemPrompt,
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const modelInstance = getModel(model);

    // If a schema is provided, generate structured output
    if (schemaName || customSchema) {
      let schemaToUse: z.ZodType;

      if (schemaName && schemas[schemaName]) {
        schemaToUse = schemas[schemaName];
      } else if (customSchema) {
        // Convert custom schema to Zod (simplified - in production use a proper converter)
        // For now, we'll treat custom schemas as requiring the raw generateText approach
        const { text } = await generateText({
          model: modelInstance,
          system: systemPrompt || `You are a helpful assistant that extracts structured data. Respond with valid JSON matching the requested schema.`,
          prompt: `${prompt}\n\nRespond with JSON matching this schema: ${JSON.stringify(customSchema)}`,
        });

        try {
          const parsed = JSON.parse(text);
          return NextResponse.json({
            success: true,
            data: parsed,
            model,
          });
        } catch {
          return NextResponse.json({
            success: false,
            error: "Failed to parse response as JSON",
            rawText: text,
          }, { status: 422 });
        }
      } else {
        return NextResponse.json(
          { error: "Invalid schema specified" },
          { status: 400 }
        );
      }

      // Generate structured output using the schema
      const { object } = await generateObject({
        model: modelInstance,
        schema: schemaToUse,
        system: systemPrompt,
        prompt,
      });

      return NextResponse.json({
        success: true,
        data: object,
        schema: schemaName,
        model,
      });
    }

    // No schema - generate plain text
    const { text } = await generateText({
      model: modelInstance,
      system: systemPrompt,
      prompt,
    });

    return NextResponse.json({
      success: true,
      text,
      model,
    });
  } catch (error) {
    console.error("Completion error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate completion",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET - List available schemas
 */
export async function GET() {
  const schemaList = Object.entries(schemas).map(([name, schema]) => ({
    name,
    description: getSchemaDescription(name as SchemaName),
    fields: Object.keys(schema.shape),
  }));

  return NextResponse.json({
    schemas: schemaList,
    availableModels: [
      ...AI_CONFIG.models.openai,
      ...AI_CONFIG.models.anthropic,
    ],
  });
}

function getSchemaDescription(name: SchemaName): string {
  const descriptions: Record<SchemaName, string> = {
    employeeInfo: "Extract employee information from text",
    sentimentAnalysis: "Analyze sentiment of text (feedback, reviews, etc.)",
    inquiryClassification: "Classify and triage HR inquiries",
    jobDescription: "Parse and structure job descriptions",
    meetingSummary: "Summarize meetings with action items",
  };
  return descriptions[name];
}
